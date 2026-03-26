export class InputController {
  constructor(target = window) {
    this.target = target;
    this.left = false;
    this.right = false;
    this.flashlightHeld = false;
    this.helpToggleRequested = false;

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);

    this.target.addEventListener('keydown', this.onKeyDown);
    this.target.addEventListener('keyup', this.onKeyUp);
    this.target.addEventListener('mousedown', this.onMouseDown);
    this.target.addEventListener('mouseup', this.onMouseUp);
  }

  onKeyDown(event) {
    if (event.repeat) return;

    if (event.code === 'KeyA' || event.code === 'ArrowLeft') this.left = true;
    if (event.code === 'KeyD' || event.code === 'ArrowRight') this.right = true;
    if (event.code === 'KeyF') this.flashlightHeld = true;
    if (event.code === 'KeyH') this.helpToggleRequested = true;
  }

  onKeyUp(event) {
    if (event.code === 'KeyA' || event.code === 'ArrowLeft') this.left = false;
    if (event.code === 'KeyD' || event.code === 'ArrowRight') this.right = false;
    if (event.code === 'KeyF') this.flashlightHeld = false;
  }

  onMouseDown(event) {
    if (event.button === 0) this.flashlightHeld = true;
  }

  onMouseUp(event) {
    if (event.button === 0) this.flashlightHeld = false;
  }

  consumeHelpToggle() {
    const value = this.helpToggleRequested;
    this.helpToggleRequested = false;
    return value;
  }

  dispose() {
    this.target.removeEventListener('keydown', this.onKeyDown);
    this.target.removeEventListener('keyup', this.onKeyUp);
    this.target.removeEventListener('mousedown', this.onMouseDown);
    this.target.removeEventListener('mouseup', this.onMouseUp);
  }
}
