import * as THREE from 'https://unpkg.com/three@0.166.1/build/three.module.js';

export class OfficeScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-8, 8, 4.5, -4.5, 0.1, 20);
    this.camera.position.z = 5;

    this.backgroundPlane = null;
    this.flashlightOverlay = null;
    this.intruderSprite = null;

    this.centerLight = new THREE.SpotLight(0xfff6cf, 0);
    this.centerLight.position.set(0, 1, 6);
    this.centerLight.target.position.set(0, 0, 0);
    this.scene.add(this.centerLight, this.centerLight.target);

    this.placeholderMat = new THREE.MeshBasicMaterial({ color: 0x242424 });

    window.addEventListener('resize', () => this.resize());
  }

  async init() {
    const loader = new THREE.TextureLoader();
    const [backgroundTex, overlayTex, intruderTex] = await Promise.all([
      loader.loadAsync('./assets/office-background.png').catch(() => null),
      loader.loadAsync('./assets/flashlight-overlay.png').catch(() => null),
      loader.loadAsync('./assets/spider-spritesheet.png').catch(() => null),
    ]);

    this.backgroundPlane = this.createBackground(backgroundTex);
    this.flashlightOverlay = this.createFlashlightOverlay(overlayTex);
    this.intruderSprite = this.createIntruder(intruderTex);

    this.scene.add(this.backgroundPlane, this.flashlightOverlay, this.intruderSprite);
    this.resize();
  }

  createBackground(texture) {
    const geometry = new THREE.PlaneGeometry(20, 10);
    const material = texture
      ? new THREE.MeshBasicMaterial({ map: texture })
      : this.placeholderMat;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = -2;
    return mesh;
  }

  createFlashlightOverlay(texture) {
    const geometry = new THREE.PlaneGeometry(16, 9);
    const material = texture
      ? new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0 })
      : new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = 3;
    return mesh;
  }

  createIntruder(texture) {
    if (texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.repeat.set(0.25, 1);
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0 });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(3, 3, 1);
      sprite.position.set(0, -0.25, 1);
      return sprite;
    }

    const geometry = new THREE.CircleGeometry(1.2, 24);
    const material = new THREE.MeshBasicMaterial({ color: 0xaa2222, transparent: true, opacity: 0 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 1);
    return mesh;
  }

  updateCameraPan(deltaPan) {
    this.camera.position.x += deltaPan;
  }

  setFlashlightEnabled(enabled) {
    this.centerLight.intensity = enabled ? 2.7 : 0;
    this.flashlightOverlay.material.opacity = enabled ? 1 : 0;
  }

  setIntruderVisibility(alpha) {
    this.intruderSprite.material.opacity = alpha;
  }

  animateIntruder(frameIndex) {
    const map = this.intruderSprite.material.map;
    if (!map) return;
    map.offset.x = frameIndex * 0.25;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    const aspect = w / h;
    const baseHeight = 9;
    this.camera.left = (-baseHeight * aspect) / 2;
    this.camera.right = (baseHeight * aspect) / 2;
    this.camera.top = baseHeight / 2;
    this.camera.bottom = -baseHeight / 2;
    this.camera.updateProjectionMatrix();
  }
}
