import { NIGHT_DURATION_SECONDS, SPAWN_HOURS, SPAWN_WINDOW_SECONDS } from './config.js';

export class AnimatronicController {
  constructor() {
    this.timeline = [];
    this.activeSpawn = null;
    this.wasRevealedThisSpawn = false;
    this.generateTimeline();
  }

  generateTimeline() {
    this.timeline = SPAWN_HOURS.map((hour) => {
      const hourStart = ((hour + 12) - 12) / 6;
      const hourEnd = ((hour + 1 + 12) - 12) / 6;
      const spawnAt = hourStart + Math.random() * Math.max(0.001, hourEnd - hourStart - 0.02);
      return {
        hour,
        startProgress: spawnAt,
        durationProgress: SPAWN_WINDOW_SECONDS / NIGHT_DURATION_SECONDS,
        completed: false
      };
    });
  }

  reset() {
    this.activeSpawn = null;
    this.wasRevealedThisSpawn = false;
    this.generateTimeline();
  }

  update(progress, flashlightOn) {
    this.activeSpawn = null;

    for (const spawn of this.timeline) {
      const end = spawn.startProgress + spawn.durationProgress;
      const active = progress >= spawn.startProgress && progress <= end;

      if (active && !spawn.completed) {
        this.activeSpawn = spawn;
        if (flashlightOn) {
          this.wasRevealedThisSpawn = true;
        }
        return;
      }

      if (progress > end && !spawn.completed) {
        spawn.completed = true;
        this.wasRevealedThisSpawn = false;
      }
    }
  }

  isVisible() {
    return Boolean(this.activeSpawn);
  }

  isFlashlightCatch(flashlightOn) {
    return this.isVisible() && flashlightOn;
  }

  isThreatening(flashlightOn) {
    if (!this.activeSpawn) return false;
    return !flashlightOn;
  }
}
