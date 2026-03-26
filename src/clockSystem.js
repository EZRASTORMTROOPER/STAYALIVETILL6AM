export class ClockSystem {
  constructor({ startHour, endHour, durationSeconds }) {
    this.startHour = startHour;
    this.endHour = endHour;
    this.durationSeconds = durationSeconds;
    this.elapsed = 0;
    this.totalHours = this.computeTotalHours();
    this.finished = false;
  }

  computeTotalHours() {
    if (this.endHour >= this.startHour) {
      return this.endHour - this.startHour;
    }
    return 24 - this.startHour + this.endHour;
  }

  update(deltaSeconds) {
    this.elapsed = Math.min(this.durationSeconds, this.elapsed + deltaSeconds);
    if (this.elapsed >= this.durationSeconds) {
      this.finished = true;
    }
  }

  get progress() {
    return this.elapsed / this.durationSeconds;
  }

  get currentHourFloat() {
    return this.startHour + this.totalHours * this.progress;
  }

  get currentHour24() {
    return this.currentHourFloat % 24;
  }

  get hour12Label() {
    const hour24 = Math.floor(this.currentHour24) % 24;
    const hour12 = hour24 % 12 || 12;
    const suffix = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:00 ${suffix}`;
  }

  hasReachedHour(targetHour) {
    const normalized = targetHour === 24 ? 0 : targetHour;
    const start24 = this.startHour % 24;
    const current = this.currentHour24;

    if (start24 <= normalized) {
      return current >= normalized || this.finished;
    }

    return current >= normalized && current < start24;
  }
}
