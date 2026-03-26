const LEFT_KEYS = new Set(['KeyA', 'ArrowLeft']);
const RIGHT_KEYS = new Set(['KeyD', 'ArrowRight']);
const FLASHLIGHT_KEYS = new Set(['KeyF', 'Space']);

export class InputSystem {
  constructor() {
    this.turn = 0;
    this.flashlightOn = false;
    this.#bind();
  }

  #bind() {
    window.addEventListener('keydown', (event) => {
      if (LEFT_KEYS.has(event.code)) {
        this.turn = -1;
      }
      if (RIGHT_KEYS.has(event.code)) {
        this.turn = 1;
      }
      if (FLASHLIGHT_KEYS.has(event.code) && !event.repeat) {
        this.flashlightOn = !this.flashlightOn;
      }
    });

    window.addEventListener('keyup', (event) => {
      if ((LEFT_KEYS.has(event.code) && this.turn < 0) || (RIGHT_KEYS.has(event.code) && this.turn > 0)) {
        this.turn = 0;
      }
    });
  }
}
