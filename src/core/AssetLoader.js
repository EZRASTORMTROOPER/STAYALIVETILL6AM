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
    const [officeBackground, kidscoRoomBackground, partyRoomBackground, mainHallBackground, flashlightOverlay, characterSprite, jumpscareFrame] = await Promise.all([
      this.loadTexture('./assets/office-background.png'),
      this.loadTexture('./assets/kids-co-room-bg.png'),
      this.loadTexture('./assets/party-room-bg.png'),
      this.loadTexture('./assets/main-hall-bg.png'),
      this.loadTexture('./assets/flashlight-overlay.png'),
      this.loadTexture('./assets/spider-spritesheet.png'),
      this.loadTexture('./assets/spider-jumpscare.png'),
    ]);

    return {
      officeBackground,
      kidscoRoomBackground,
      partyRoomBackground,
      mainHallBackground,
      flashlightOverlay,
      characterSprite,
      jumpscareFrame,
    };
  }
}
