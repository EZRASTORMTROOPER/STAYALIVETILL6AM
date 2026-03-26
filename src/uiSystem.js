export class UiSystem {
  constructor() {
    this.clockEl = document.getElementById('clock');
    this.powerEl = document.getElementById('power');
    this.statusEl = document.getElementById('status-banner');
  }

  setClock(label) {
    this.clockEl.textContent = label;
  }

  setPower(value) {
    this.powerEl.textContent = `Power: ${Math.max(0, Math.floor(value))}%`;
  }

  setStatus(message) {
    this.statusEl.textContent = message;
  }
}
