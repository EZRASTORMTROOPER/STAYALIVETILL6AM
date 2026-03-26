export class InputSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.mouseX = 0;
    this.mouseY = 0;
    this.flashlightHeld = false;
    this.restartRequested = false;

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('mousemove', this.onMouseMove);
  }

  onKeyDown(event) {
    const key = event.key.toLowerCase();
    this.keys.add(key);
    if (key === 'f') this.flashlightHeld = true;
    if (key === 'r') this.restartRequested = true;
  }

  onKeyUp(event) {
    const key = event.key.toLowerCase();
    this.keys.delete(key);
    if (key === 'f') this.flashlightHeld = false;
  }

  onMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0) return;
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    this.mouseX = Math.max(0, Math.min(1, x));
    this.mouseY = Math.max(0, Math.min(1, y));
  }

  getLookAxis() {
    const left = this.keys.has('a') || this.keys.has('arrowleft');
    const right = this.keys.has('d') || this.keys.has('arrowright');
    if (left && !right) return -1;
    if (right && !left) return 1;
    return 0;
  }

  consumeRestartRequest() {
    const requested = this.restartRequested;
    this.restartRequested = false;
    return requested;
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('mousemove', this.onMouseMove);
  }
}
