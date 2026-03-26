import * as THREE from 'three';

const ENCOUNTER_HOURS = [2, 3, 4, 5];

export class EncounterSystem {
  constructor(characterMesh) {
    this.characterMesh = characterMesh;
    this.reset();
  }

  reset() {
    this.encounters = new Map();
    for (const hour of ENCOUNTER_HOURS) {
      this.encounters.set(hour, {
        active: false,
        resolved: false,
        spotted: false,
        activeSeconds: 0,
      });
    }
    this.currentHour = 12;
    this.loseTriggered = false;
    this.characterMesh.visible = false;
  }

  syncHour(hour) {
    this.currentHour = hour;
    const encounter = this.encounters.get(hour);
    if (!encounter || encounter.resolved) return;
    encounter.active = true;
    this.characterMesh.visible = true;
  }

  update(deltaSeconds, flashlightOn, lookingTowardCharacter) {
    if (this.loseTriggered) return;

    const encounter = this.encounters.get(this.currentHour);
    if (!encounter || !encounter.active || encounter.resolved) return;

    encounter.activeSeconds += deltaSeconds;
    const illuminated = flashlightOn && lookingTowardCharacter;
    if (illuminated) {
      encounter.spotted = true;
      this.characterMesh.material.color = new THREE.Color('#ffffff');
    } else {
      this.characterMesh.material.color = new THREE.Color('#6c1b2f');
    }

    if (encounter.activeSeconds >= 7) {
      if (!encounter.spotted) {
        this.loseTriggered = true;
        return;
      }
      encounter.resolved = true;
      encounter.active = false;
      this.characterMesh.visible = false;
    }
  }

  shouldLose() {
    return this.loseTriggered;
  }
}
