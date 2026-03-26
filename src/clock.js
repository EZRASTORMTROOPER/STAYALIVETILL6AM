import { END_HOUR, NIGHT_DURATION_SECONDS, START_HOUR } from './config.js';

export class NightClock {
  constructor() {
    this.elapsed = 0;
  }

  reset() {
    this.elapsed = 0;
  }

  update(deltaSeconds) {
    this.elapsed += deltaSeconds;
    if (this.elapsed > NIGHT_DURATION_SECONDS) this.elapsed = NIGHT_DURATION_SECONDS;
  }

  getProgress() {
    return this.elapsed / NIGHT_DURATION_SECONDS;
  }

  getCurrentHour() {
    const normalized = this.getProgress();
    const hoursSpan = (END_HOUR + 12) - START_HOUR;
    const virtualHour = START_HOUR + normalized * hoursSpan;
    let displayHour = Math.floor(virtualHour);

    if (displayHour >= 12) displayHour -= 12;
    if (displayHour === 0) displayHour = 12;

    return displayHour;
  }

  getDisplayString() {
    return `${this.getCurrentHour()}:00 AM`;
  }

  isNightComplete() {
    return this.elapsed >= NIGHT_DURATION_SECONDS;
  }
}
