const DISPLAY_HOURS = [12, 1, 2, 3, 4, 5, 6];
const HOUR_SECONDS = 18;

export class ClockSystem {
  constructor() {
    this.reset();
  }

  reset() {
    this.elapsed = 0;
    this.hourIndex = 0;
    this.currentHour = DISPLAY_HOURS[this.hourIndex];
    this.isNightOver = false;
  }

  update(deltaSeconds) {
    if (this.isNightOver) return;

    this.elapsed += deltaSeconds;
    const progressedHours = Math.floor(this.elapsed / HOUR_SECONDS);
    this.hourIndex = Math.min(progressedHours, DISPLAY_HOURS.length - 1);
    this.currentHour = DISPLAY_HOURS[this.hourIndex];

    if (this.currentHour === 6) {
      this.isNightOver = true;
    }
  }

  getTimeText() {
    return `${this.currentHour}:00 AM`;
  }
}
