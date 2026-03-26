import * as THREE from 'three';

export class AssetLoader {
  constructor() {
    this.textureLoader = new THREE.TextureLoader();
  }

  async loadTexture(path) {
    return new Promise((resolve) => {
      this.textureLoader.load(
        path,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          resolve(texture);
        },
        undefined,
        () => resolve(null),
      );
    });
  }

  async loadAll() {
    const [officeBackground, flashlightOverlay, characterSprite] = await Promise.all([
      this.loadTexture('./assets/office-background.png'),
      this.loadTexture('./assets/flashlight-overlay.png'),
      this.loadTexture('./assets/spider-spritesheet.png'),
    ]);

    return {
      officeBackground,
      flashlightOverlay,
      characterSprite,
    };
  }
}
