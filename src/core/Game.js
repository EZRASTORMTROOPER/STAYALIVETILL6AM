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
    this.camera = new THREE.OrthographicCamera(-8, 8, 4.5, -4.5, 0.1, 50);
    this.camera.position.z = 10;
    this.camera.position.y = 0;

    this.runtimeClock = new THREE.Clock();
    this.assetLoader = new AssetLoader();
    this.clockSystem = new ClockSystem();
    this.inputSystem = new InputSystem(this.canvas);
    this.flashlightSystem = new FlashlightSystem(document.getElementById('flashlight-mask'), this.statusLabel);

    this.lookOffset = 0;
    this.lookTilt = 0;
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
    const background = this.createBackground(textures.officeBackground);
    this.backgroundLayer = background;
    this.scene.add(this.backgroundLayer);

    this.midLayer = this.createMidLayer();
    this.scene.add(this.midLayer);

    this.foregroundLayer = this.createForegroundLayer();
    this.scene.add(this.foregroundLayer);

    this.characterMesh = this.createCharacter(textures.characterSprite);
    this.midLayer.add(this.characterMesh);

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

  createMidLayer() {
    const material = new THREE.MeshBasicMaterial({
      color: '#091225',
      transparent: true,
      opacity: 0.22,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(17.2, 9.8), material);
    mesh.position.set(0.25, -0.1, 0.08);
    return mesh;
  }

  createForegroundLayer() {
    const material = new THREE.MeshBasicMaterial({
      color: '#03060e',
      transparent: true,
      opacity: 0.55,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(18.6, 10.6), material);
    mesh.position.set(0, -0.75, 0.16);
    return mesh;
  }

  createBackground(texture) {
    const geometry = new THREE.PlaneGeometry(16, 9);
    const material = texture
      ? new THREE.MeshBasicMaterial({ map: texture })
      : new THREE.MeshBasicMaterial({ color: '#202533' });

    return new THREE.Mesh(geometry, material);
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
    const mouseVerticalOffset = (0.5 - this.inputSystem.mouseY) * 0.9;

    this.lookOffset = THREE.MathUtils.clamp(this.lookOffset, -2.8, 2.8);
    const totalOffset = THREE.MathUtils.clamp(this.lookOffset + mouseOffset, -3.3, 3.3);
    this.lookTilt = THREE.MathUtils.lerp(this.lookTilt, mouseVerticalOffset, 0.08);
    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, totalOffset, 0.1);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, this.lookTilt, 0.1);

    this.backgroundLayer.position.x = this.camera.position.x * -0.15;
    this.backgroundLayer.position.y = this.camera.position.y * -0.05;

    this.midLayer.position.x = this.camera.position.x * -0.34;
    this.midLayer.position.y = this.camera.position.y * -0.1;

    this.foregroundLayer.position.x = this.camera.position.x * -0.62;
    this.foregroundLayer.position.y = -0.75 + this.camera.position.y * -0.16;

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
    this.camera.position.y = 0;
    this.lookOffset = 0;
    this.lookTilt = 0;
    this.state = 'running';
    this.instructionsPanel.reset();
    this.flashlightSystem.setStatus('Survive until 6:00 AM');
    this.runtimeClock.getDelta();
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
    const aspect = window.innerWidth / window.innerHeight;
    const viewHeight = 9;
    const viewWidth = viewHeight * aspect;
    this.camera.left = -viewWidth / 2;
    this.camera.right = viewWidth / 2;
    this.camera.top = viewHeight / 2;
    this.camera.bottom = -viewHeight / 2;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
