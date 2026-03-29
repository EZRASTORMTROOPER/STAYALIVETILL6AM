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
    this.cameraModeLabel = document.getElementById('camera-mode');
    this.cameraRoomLabel = document.getElementById('camera-room');
    this.cameraMap = document.getElementById('camera-map');
    this.cameraMapNodes = Array.from(document.querySelectorAll('[data-camera-room]'));
    this.endPanel = document.getElementById('end-panel');
    this.endTitle = document.getElementById('end-title');
    this.endMessage = document.getElementById('end-message');
    this.restartButton = document.getElementById('restart-button');
    this.jumpscareOverlay = document.getElementById('jumpscare-overlay');
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
    this.securityCameraActive = false;
    this.securityRooms = [
      { id: 'kidsco', label: 'Kidsco', textureKey: 'kidscoRoomBackground' },
      { id: 'party-room', label: 'Party Room', textureKey: 'partyRoomBackground' },
      { id: 'main-hall', label: 'Main Hall', textureKey: 'mainHallBackground' },
    ];
    this.activeSecurityRoomIndex = 0;
    this.jumpscareElapsed = 0;
    this.jumpscareDuration = 1.05;
    this.jumpscareActive = false;
    this.state = 'loading';

    this.onResize = this.onResize.bind(this);
    this.loop = this.loop.bind(this);
    this.restart = this.restart.bind(this);
    this.onCameraMapClick = this.onCameraMapClick.bind(this);

    window.addEventListener('resize', this.onResize);
    this.restartButton.addEventListener('click', this.restart);
    if (this.cameraMap) {
      this.cameraMap.addEventListener('click', this.onCameraMapClick);
    }
  }

  async init() {
    const textures = await this.assetLoader.loadAll();
    this.setupScene(textures);
    this.setupAudio();

    this.encounterSystem = new EncounterSystem(this.characterMesh);
    this.state = 'running';
    this.runtimeClock.start();
    this.playBackgroundMusic();
    requestAnimationFrame(this.loop);
  }

  setupScene(textures) {
    this.textures = textures;
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

    this.updateBackgroundForView();
    this.updateCameraHud();
  }

  setupAudio() {
    this.backgroundMusic = new Audio('./sound-effects/scary-background-music.mp3');
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.45;

    this.jumpscareSound = new Audio('./sound-effects/jumpscare.mp3');
    this.jumpscareSound.loop = false;
    this.jumpscareSound.volume = 1;

    const unlockOnFirstInteraction = () => {
      this.playBackgroundMusic();
      window.removeEventListener('pointerdown', unlockOnFirstInteraction);
      window.removeEventListener('keydown', unlockOnFirstInteraction);
    };

    window.addEventListener('pointerdown', unlockOnFirstInteraction, { once: true });
    window.addEventListener('keydown', unlockOnFirstInteraction, { once: true });
  }

  playBackgroundMusic() {
    if (!this.backgroundMusic || this.jumpscareActive || this.state !== 'running') return;
    if (this.backgroundMusic.paused) {
      this.backgroundMusic.currentTime = 0;
      this.backgroundMusic.play().catch(() => {});
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
    if (!this.securityCameraActive) {
      const lookAxis = this.inputSystem.getLookAxis();
      this.lookOffset += lookAxis * deltaSeconds * 2.1;
      const mouseOffset = (this.inputSystem.mouseX - 0.5) * 3.5;
      const mouseVerticalOffset = (0.5 - this.inputSystem.mouseY) * 0.9;

      this.lookOffset = THREE.MathUtils.clamp(this.lookOffset, -2.8, 2.8);
      const totalOffset = THREE.MathUtils.clamp(this.lookOffset + mouseOffset, -3.3, 3.3);
      this.lookTilt = THREE.MathUtils.lerp(this.lookTilt, mouseVerticalOffset, 0.08);
      this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, totalOffset, 0.1);
      this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, this.lookTilt, 0.1);
    } else {
      this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, 0, 0.15);
      this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, 0, 0.15);
    }

    this.backgroundLayer.position.x = this.camera.position.x * -0.15;
    this.backgroundLayer.position.y = this.camera.position.y * -0.05;

    this.midLayer.position.x = this.camera.position.x * -0.34;
    this.midLayer.position.y = this.camera.position.y * -0.1;

    this.foregroundLayer.position.x = this.camera.position.x * -0.62;
    this.foregroundLayer.position.y = -0.75 + this.camera.position.y * -0.16;

    const flashlightOn = this.inputSystem.flashlightHeld && !this.securityCameraActive;
    this.flashlightSystem.setEnabled(flashlightOn);
    this.flashlightSystem.update(this.inputSystem.mouseX);

    this.encounterSystem.syncHour(this.clockSystem.currentHour);
    const lookingTowardCharacter = Math.abs(this.camera.position.x - this.characterMesh.position.x) < 1.45;
    this.encounterSystem.update(deltaSeconds, flashlightOn, lookingTowardCharacter);
    this.characterMesh.visible = !this.securityCameraActive && this.encounterSystem.isCharacterVisible();

    this.clockLabel.textContent = this.clockSystem.getTimeText();
    const statusText = this.securityCameraActive
      ? `Viewing ${this.securityRooms[this.activeSecurityRoomIndex].label} security camera`
      : flashlightOn
        ? 'Flashlight active - watch for movement'
        : 'Survive until 6:00 AM';
    this.flashlightSystem.setStatus(statusText);

    if (this.encounterSystem.shouldLose()) {
      this.endGame(false, 'You were caught in the dark. Use the flashlight when the threat appears.');
    } else if (this.clockSystem.isNightOver) {
      this.endGame(true, '6:00 AM. You made it through the night.');
    }
  }

  updateJumpscare(deltaSeconds) {
    if (!this.jumpscareActive || !this.jumpscareOverlay) return;
    this.jumpscareElapsed += deltaSeconds;
    const progress = THREE.MathUtils.clamp(this.jumpscareElapsed / this.jumpscareDuration, 0, 1);
    const eased = 1 - (1 - progress) * (1 - progress);
    const pulse = Math.sin(progress * 45) * (1 - progress) * 0.07;
    const scale = 0.85 + eased * 1.65 + pulse;
    const brightness = 0.55 + eased * 0.95;
    const contrast = 1.1 + eased * 0.7;
    const saturate = 1 + eased * 0.55;
    const shakeX = Math.sin(progress * 130) * (1 - progress) * 28;
    const shakeY = Math.cos(progress * 95) * (1 - progress) * 18;

    this.jumpscareOverlay.style.transform = `translate(${shakeX}px, ${shakeY}px) scale(${scale})`;
    this.jumpscareOverlay.style.opacity = `${0.1 + eased * 0.9}`;
    this.jumpscareOverlay.style.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturate})`;
    this.renderer.toneMappingExposure = 1.05 + eased * 0.65;

    if (progress >= 1) {
      this.jumpscareActive = false;
      this.renderer.toneMappingExposure = 1;
    }
  }

  endGame(won, message) {
    this.state = 'ended';
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }

    if (!won) {
      this.triggerJumpscare();
    }

    this.endPanel.classList.remove('hidden');
    this.endTitle.textContent = won ? 'Shift Complete' : 'Game Over';
    this.endMessage.textContent = message;
    this.flashlightSystem.setEnabled(false);
  }

  triggerJumpscare() {
    this.jumpscareElapsed = 0;
    this.jumpscareActive = true;
    if (this.jumpscareOverlay) {
      this.jumpscareOverlay.classList.add('active');
      this.jumpscareOverlay.style.opacity = '0';
    }
    if (this.jumpscareSound) {
      this.jumpscareSound.currentTime = 0;
      this.jumpscareSound.play().catch(() => {});
    }
  }

  restart() {
    this.endPanel.classList.add('hidden');
    this.clockSystem.reset();
    this.encounterSystem.reset();
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.lookOffset = 0;
    this.lookTilt = 0;
    this.securityCameraActive = false;
    this.activeSecurityRoomIndex = 0;
    this.updateBackgroundForView();
    this.updateCameraHud();
    this.jumpscareElapsed = 0;
    this.jumpscareActive = false;
    this.renderer.toneMappingExposure = 1;
    if (this.jumpscareOverlay) {
      this.jumpscareOverlay.classList.remove('active');
      this.jumpscareOverlay.style.transform = 'translate(0, 0) scale(1)';
      this.jumpscareOverlay.style.opacity = '0';
      this.jumpscareOverlay.style.filter = 'none';
    }
    if (this.jumpscareSound) {
      this.jumpscareSound.pause();
      this.jumpscareSound.currentTime = 0;
    }
    this.state = 'running';
    this.instructionsPanel.reset();
    this.flashlightSystem.setStatus('Survive until 6:00 AM');
    this.runtimeClock.getDelta();
    this.playBackgroundMusic();
  }

  loop() {
    const deltaSeconds = Math.min(this.runtimeClock.getDelta(), 0.1);

    if (this.inputSystem.consumeRestartRequest()) {
      this.restart();
    }

    if (this.inputSystem.consumeToggleSecurityCameraRequest()) {
      this.toggleSecurityCamera();
    }
    if (this.inputSystem.consumeNextSecurityCameraRequest()) {
      this.shiftSecurityCamera(1);
    }

    if (this.state === 'running') {
      this.updateRunning(deltaSeconds);
    }
    this.updateJumpscare(deltaSeconds);

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

  toggleSecurityCamera() {
    if (this.state !== 'running') return;
    this.securityCameraActive = !this.securityCameraActive;
    this.updateBackgroundForView();
    this.updateCameraHud();
  }

  shiftSecurityCamera(direction) {
    if (this.state !== 'running' || !this.securityCameraActive) return;
    const roomCount = this.securityRooms.length;
    this.activeSecurityRoomIndex = (this.activeSecurityRoomIndex + direction + roomCount) % roomCount;
    this.updateBackgroundForView();
    this.updateCameraHud();
  }

  setSecurityCameraByRoom(roomId) {
    if (this.state !== 'running') return;
    const nextIndex = this.securityRooms.findIndex((room) => room.id === roomId);
    if (nextIndex < 0) return;
    this.activeSecurityRoomIndex = nextIndex;
    this.securityCameraActive = true;
    this.updateBackgroundForView();
    this.updateCameraHud();
  }

  onCameraMapClick(event) {
    const cameraNode = event.target.closest('[data-camera-room]');
    if (!cameraNode) return;
    this.setSecurityCameraByRoom(cameraNode.dataset.cameraRoom);
  }

  updateBackgroundForView() {
    if (!this.backgroundLayer || !this.backgroundLayer.material || !this.textures) return;
    const texture = this.securityCameraActive
      ? this.textures[this.securityRooms[this.activeSecurityRoomIndex].textureKey]
      : this.textures.officeBackground;
    this.backgroundLayer.material.map = texture || null;
    this.backgroundLayer.material.needsUpdate = true;
  }

  updateCameraHud() {
    if (!this.cameraModeLabel || !this.cameraRoomLabel || !this.cameraMap) return;
    this.cameraModeLabel.textContent = this.securityCameraActive
      ? 'Security Camera: ON (C to close)'
      : 'Security Camera: OFF (C to open)';
    this.cameraRoomLabel.textContent = this.securityCameraActive
      ? `Current feed: ${this.securityRooms[this.activeSecurityRoomIndex].label} (Space to switch)`
      : 'Current feed: Office view';
    this.cameraMap.classList.toggle('active', this.securityCameraActive);

    this.cameraMapNodes.forEach((node) => {
      node.classList.toggle('active', node.dataset.cameraRoom === this.securityRooms[this.activeSecurityRoomIndex].id);
    });
  }
}
