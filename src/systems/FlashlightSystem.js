export class FlashlightSystem {
  constructor(overlayElement, statusElement) {
    this.overlayElement = overlayElement;
    this.statusElement = statusElement;
    this.enabled = false;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    this.overlayElement.style.opacity = enabled ? '1' : '0';
  }

  update(mouseX) {
    if (!this.enabled) return;
    this.overlayElement.style.background = `radial-gradient(circle at ${Math.round(mouseX * 100)}% 50%, rgba(255,255,220,0.09) 0, rgba(255,255,220,0.05) 14%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.96) 100%)`;
  }

  setStatus(text) {
    this.statusElement.textContent = text;
  }
}
