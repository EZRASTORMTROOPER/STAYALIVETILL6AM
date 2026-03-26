import * as THREE from 'three';
import { AssetLoader } from './AssetLoader.js';
import { ClockSystem } from '../systems/ClockSystem.js';
import { InputSystem } from '../systems/InputSystem.js';
import { FlashlightSystem } from '../systems/FlashlightSystem.js';
import { EncounterSystem } from '../systems/EncounterSystem.js';
import { InstructionsPanel } from '../ui/InstructionsPanel.js';

export class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.clockLabel = document.getElementById('clock');
    this.statusLabel = document.getElementById('status');
    this.endPanel = document.getElementById('end-panel');
    this.endTitle = document.getElementById('end-title');
    this.endMessage = document.getElementById('end-message');
    this.restartButton = document.getElementById('restart-button');
    this.instructionsPanel = new InstructionsPanel(document.getElementById('instruction-panel'));

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 50);
    this.camera.position.set(0, 0, 8.2);

    this.runtimeClock = new THREE.Clock();
    this.assetLoader = new AssetLoader();
    this.clockSystem = new ClockSystem();
    this.inputSystem = new InputSystem(this.canvas);
    this.flashlightSystem = new FlashlightSystem(document.getElementById('flashlight-mask'), this.statusLabel);

    this.lookOffset = 0;
    this.parallaxStrength = {
      camera: 0.92,
      far: 0.34,
      mid: 0.56,
      foreground: 0.94,
      character: 1.18,
    };
    this.state = 'loading';

    this.onResize = this.onResize.bind(this);
    this.loop = this.loop.bind(this);
    this.restart = this.restart.bind(this);

    window.addEventListener('resize', this.onResize);
    this.restartButton.addEventListener('click', this.restart);
  }

  async init() {
    const textures = await this.assetLoader.loadAll();
    this.setupScene(textures);

    this.encounterSystem = new EncounterSystem(this.characterMesh);
    this.state = 'running';
    this.runtimeClock.start();
    requestAnimationFrame(this.loop);
  }

  setupScene(textures) {
    this.farBackgroundMesh = this.createBackground(textures.officeBackground, {
      width: 30,
      height: 13,
      z: -3.2,
      opacity: 0.85,
      color: '#8e96a8',
    });
    this.scene.add(this.farBackgroundMesh);

    this.midBackgroundMesh = this.createBackground(textures.officeBackground, {
      width: 24,
      height: 11,
      z: -1.4,
      opacity: 1,
      color: '#ffffff',
    });
    this.scene.add(this.midBackgroundMesh);

    this.foregroundMesh = this.createBackground(textures.officeBackground, {
      width: 21,
      height: 10.2,
      z: -0.55,
      opacity: 0.3,
      color: '#4b5872',
    });
    this.scene.add(this.foregroundMesh);

    this.characterMesh = this.createCharacter(textures.characterSprite);
    this.scene.add(this.characterMesh);

    if (textures.flashlightOverlay) {
      const flashlightOverlay = new THREE.Mesh(
        new THREE.PlaneGeometry(16.2, 9.2),
        new THREE.MeshBasicMaterial({
          map: textures.flashlightOverlay,
          transparent: true,
          opacity: 0.12,
        }),
      );
      flashlightOverlay.position.z = 1;
      this.scene.add(flashlightOverlay);
    }
  }

  createBackground(texture, options = {}) {
    const { width = 16, height = 9, z = 0, opacity = 1, color = '#ffffff' } = options;
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = texture
      ? new THREE.MeshBasicMaterial({ map: texture, transparent: opacity < 1, opacity, color })
      : new THREE.MeshBasicMaterial({ color: '#202533', transparent: opacity < 1, opacity });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = z;
    return mesh;
  }

  createCharacter(texture) {
    const geometry = new THREE.PlaneGeometry(2.4, 2.8);
    let material;

    if (texture) {
      material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, color: '#6c1b2f' });
    } else {
      material = new THREE.MeshBasicMaterial({ color: '#6c1b2f' });
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0.8, -0.8, 0.2);
    mesh.visible = false;
    return mesh;
  }

  updateRunning(deltaSeconds) {
    this.clockSystem.update(deltaSeconds);
    const lookAxis = this.inputSystem.getLookAxis();
    this.lookOffset += lookAxis * deltaSeconds * 2.1;
    const mouseOffset = (this.inputSystem.mouseX - 0.5) * 3.5;

    this.lookOffset = THREE.MathUtils.clamp(this.lookOffset, -2.8, 2.8);
    const totalOffset = THREE.MathUtils.clamp(this.lookOffset + mouseOffset, -3.3, 3.3);
    this.applyParallax(totalOffset);

    const flashlightOn = this.inputSystem.flashlightHeld;
    this.flashlightSystem.setEnabled(flashlightOn);
    this.flashlightSystem.update(this.inputSystem.mouseX);

    this.encounterSystem.syncHour(this.clockSystem.currentHour);
    const lookingTowardCharacter = Math.abs(this.camera.position.x - this.characterMesh.position.x) < 1.45;
    this.encounterSystem.update(deltaSeconds, flashlightOn, lookingTowardCharacter);

    this.clockLabel.textContent = this.clockSystem.getTimeText();
    this.flashlightSystem.setStatus(
      flashlightOn ? 'Flashlight active - watch for movement' : 'Survive until 6:00 AM',
    );

    if (this.encounterSystem.shouldLose()) {
      this.endGame(false, 'You were caught in the dark. Use the flashlight when the threat appears.');
    } else if (this.clockSystem.isNightOver) {
      this.endGame(true, '6:00 AM. You made it through the night.');
    }
  }

  endGame(won, message) {
    this.state = 'ended';
    this.endPanel.classList.remove('hidden');
    this.endTitle.textContent = won ? 'Shift Complete' : 'Game Over';
    this.endMessage.textContent = message;
    this.flashlightSystem.setEnabled(false);
  }

  restart() {
    this.endPanel.classList.add('hidden');
    this.clockSystem.reset();
    this.encounterSystem.reset();
    this.camera.position.x = 0;
    this.lookOffset = 0;
    this.state = 'running';
    this.instructionsPanel.reset();
    this.flashlightSystem.setStatus('Survive until 6:00 AM');
    this.runtimeClock.getDelta();
  }

  applyParallax(totalOffset) {
    this.camera.position.x = totalOffset * this.parallaxStrength.camera;

    if (this.farBackgroundMesh) {
      this.farBackgroundMesh.position.x = -totalOffset * this.parallaxStrength.far;
    }

    if (this.midBackgroundMesh) {
      this.midBackgroundMesh.position.x = -totalOffset * this.parallaxStrength.mid;
    }

    if (this.foregroundMesh) {
      this.foregroundMesh.position.x = -totalOffset * this.parallaxStrength.foreground;
    }

    if (this.characterMesh) {
      this.characterMesh.position.x = 0.8 + totalOffset * this.parallaxStrength.character;
    }
  }

  loop() {
    const deltaSeconds = Math.min(this.runtimeClock.getDelta(), 0.1);

    if (this.inputSystem.consumeRestartRequest()) {
      this.restart();
    }

    if (this.state === 'running') {
      this.updateRunning(deltaSeconds);
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.loop);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
