export function createInitialState() {
  return {
    running: false,
    flashlightOn: false,
    cameraX: 0,
    cameraZ: 3.9,
    gameTimeHours: 0,
    activeHour: 12,
    creatureVisible: false,
    creatureFoundThisHour: false,
    hourTransitions: new Set(),
    keyState: new Set(),
  };
}
