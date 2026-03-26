export class UIController {
  constructor() {
    this.clockEl = document.getElementById('clock');
    this.powerEl = document.getElementById('power');
    this.instructionsEl = document.getElementById('instructions');
    this.resultEl = document.getElementById('result');
    this.resultTitleEl = document.getElementById('result-title');
    this.resultTextEl = document.getElementById('result-text');
    this.startBtn = document.getElementById('start-button');
    this.restartBtn = document.getElementById('restart-button');

    this.startHandler = null;
    this.restartHandler = null;

    this.startBtn.addEventListener('click', () => this.startHandler?.());
    this.restartBtn.addEventListener('click', () => this.restartHandler?.());
  }

  onStart(handler) {
    this.startHandler = handler;
  }

  onRestart(handler) {
    this.restartHandler = handler;
  }

  setClock(label) {
    this.clockEl.textContent = label;
  }

  setPower(power) {
    const clamped = Math.max(0, Math.round(power));
    this.powerEl.textContent = `Power: ${clamped}%`;
  }

  showInstructions(show) {
    this.instructionsEl.classList.toggle('hidden', !show);
  }

  setResult(title, text) {
    this.resultTitleEl.textContent = title;
    this.resultTextEl.textContent = text;
    this.resultEl.classList.remove('hidden');
  }

  hideResult() {
    this.resultEl.classList.add('hidden');
  }
}
