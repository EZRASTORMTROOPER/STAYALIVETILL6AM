import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js';

export class GameScene {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();

    this.camera = new THREE.OrthographicCamera(-5, 5, 2.8125, -2.8125, 0.1, 30);
    this.camera.position.set(0, 0, 10);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);

    this.loader = new THREE.TextureLoader();
    this.officeTexture = this.loader.load('./assets/office-background.png');
    this.flashlightTexture = this.loader.load('./assets/flashlight-overlay.png');

    this.setupBackground();
    this.setupAnimatronic();
    this.setupFlashlightOverlay();
    this.onResize();

    window.addEventListener('resize', () => this.onResize());
  }

  setupBackground() {
    const plane = new THREE.PlaneGeometry(14, 8);
    const mat = new THREE.MeshBasicMaterial({ map: this.officeTexture });
    this.backgroundMesh = new THREE.Mesh(plane, mat);
    this.backgroundMesh.position.z = -2;
    this.scene.add(this.backgroundMesh);

    this.vignette = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 8),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.35
      })
    );
    this.vignette.position.z = 3;
    this.scene.add(this.vignette);
  }

  setupAnimatronic() {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 2.2, 0.1),
      new THREE.MeshBasicMaterial({ color: 0x3f2f22 })
    );
    body.position.set(0, -0.4, 0.3);

    const head = new THREE.Mesh(
      new THREE.CircleGeometry(0.6, 32),
      new THREE.MeshBasicMaterial({ color: 0x5e4637 })
    );
    head.position.set(0, 1.1, 0.4);

    const leftEye = new THREE.Mesh(
      new THREE.CircleGeometry(0.09, 16),
      new THREE.MeshBasicMaterial({ color: 0xff3333 })
    );
    leftEye.position.set(-0.18, 1.2, 0.5);

    const rightEye = leftEye.clone();
    rightEye.position.x = 0.18;

    this.animatronic = new THREE.Group();
    this.animatronic.add(body, head, leftEye, rightEye);
    this.animatronic.position.set(0, -0.2, 0.1);
    this.animatronic.visible = false;
    this.scene.add(this.animatronic);
  }

  setupFlashlightOverlay() {
    this.flashlightOverlay = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 8),
      new THREE.MeshBasicMaterial({
        map: this.flashlightTexture,
        transparent: true,
        opacity: 0
      })
    );
    this.flashlightOverlay.position.z = 2.5;
    this.scene.add(this.flashlightOverlay);

    this.darkMask = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 8),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.55
      })
    );
    this.darkMask.position.z = 2;
    this.scene.add(this.darkMask);
  }

  setCameraX(x) {
    this.camera.position.x = x;
  }

  setFlashlight(active) {
    this.flashlightOverlay.material.opacity = active ? 1 : 0;
    this.darkMask.material.opacity = active ? 0.15 : 0.55;
  }

  setAnimatronicVisible(visible) {
    this.animatronic.visible = visible;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const baseHeight = 5.625;
    this.camera.left = -baseHeight * aspect;
    this.camera.right = baseHeight * aspect;
    this.camera.top = baseHeight;
    this.camera.bottom = -baseHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
