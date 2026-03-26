import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";

export function createScene(cfg) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x040404, 5, 16);

  const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 60);
  camera.position.set(0, 0, 3.9);

  const loader = new THREE.TextureLoader();

  const officeTexture = loader.load("./assets/office-background.png");
  officeTexture.colorSpace = THREE.SRGBColorSpace;
  const officeMat = new THREE.MeshBasicMaterial({ map: officeTexture, transparent: false });
  const officeGeo = new THREE.PlaneGeometry(12, 6.75);
  const office = new THREE.Mesh(officeGeo, officeMat);
  office.position.set(0, 0, -3.8);
  scene.add(office);

  const overlayTexture = loader.load("./assets/flashlight-overlay.png");
  overlayTexture.colorSpace = THREE.SRGBColorSpace;
  const overlay = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.MeshBasicMaterial({ map: overlayTexture, transparent: true, opacity: 0.65, depthTest: false })
  );
  overlay.position.set(0, 0, -0.5);
  camera.add(overlay);
  overlay.visible = false;

  const ambient = new THREE.AmbientLight(0xffffff, cfg.baseLightIntensity);
  scene.add(ambient);

  const flashlight = new THREE.SpotLight(0xfaf3c4, cfg.flashlightIntensity, 17, Math.PI / 7, 0.4, 1.2);
  flashlight.position.set(0, 0.2, 0.8);
  flashlight.target.position.set(0, 0, -3.5);
  camera.add(flashlight);
  camera.add(flashlight.target);
  flashlight.visible = false;

  const creatureTexture = loader.load("./assets/spider-spritesheet.png");
  creatureTexture.colorSpace = THREE.SRGBColorSpace;
  const creature = new THREE.Mesh(
    new THREE.PlaneGeometry(1.3, 1.2),
    new THREE.MeshBasicMaterial({ map: creatureTexture, transparent: true, opacity: 0.92 })
  );
  creature.position.set(0.5, -0.5, -3.2);
  creature.visible = false;
  scene.add(creature);

  const placeholderHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 20, 20),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, emissive: 0x220000, emissiveIntensity: 0.7 })
  );
  placeholderHead.position.set(-0.6, -0.6, -3.1);
  placeholderHead.visible = false;
  scene.add(placeholderHead);

  scene.add(camera);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return {
    camera,
    creature,
    placeholderHead,
    render() {
      renderer.render(scene, camera);
    },
    syncFlashlight(isOn) {
      flashlight.visible = isOn;
      overlay.visible = isOn;
      ambient.intensity = isOn ? cfg.baseLightIntensity + 0.12 : cfg.baseLightIntensity;
    },
  };
}
