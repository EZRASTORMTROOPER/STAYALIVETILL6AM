export class EncounterSystem {
  constructor({ startHour, intruderHours, intruderWindowSeconds, nightDurationSeconds }) {
    this.startHour = startHour;
    this.intruderHours = intruderHours;
    this.windowSeconds = intruderWindowSeconds;
    this.nightDurationSeconds = nightDurationSeconds;
    this.events = intruderHours.map((hour) => ({
      hour,
      triggered: false,
      startAtSeconds: this.hourToSeconds(hour),
    }));
    this.activeEvent = null;
    this.frameTimer = 0;
    this.frame = 0;
  }

  hourToSeconds(hour24) {
    const normalizedStart = this.startHour % 24;
    const normalizedHour = hour24 % 24;
    const diffHours = normalizedHour >= normalizedStart
      ? normalizedHour - normalizedStart
      : 24 - normalizedStart + normalizedHour;
    const totalHours = 6;
    return (diffHours / totalHours) * this.nightDurationSeconds;
  }

  update(clockElapsedSeconds, flashlightOn) {
    for (const event of this.events) {
      if (!event.triggered && clockElapsedSeconds >= event.startAtSeconds) {
        event.triggered = true;
        this.activeEvent = {
          hour: event.hour,
          endAt: clockElapsedSeconds + this.windowSeconds,
        };
        break;
      }
    }

    if (this.activeEvent && clockElapsedSeconds > this.activeEvent.endAt) {
      this.activeEvent = null;
    }

    const intruderVisible = Boolean(this.activeEvent) && flashlightOn;
    return {
      intruderVisible,
      eventHour: this.activeEvent?.hour ?? null,
      animFrame: this.nextFrame(),
    };
  }

  nextFrame() {
    this.frameTimer += 1;
    if (this.frameTimer % 11 === 0) {
      this.frame = (this.frame + 1) % 4;
    }
    return this.frame;
  }
}
