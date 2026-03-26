import { ENCOUNTER_HOURS, GAME_CONFIG } from "./config.js";

export function createGame(state, ui, scene, input) {
  let last = performance.now();
  const encounterSchedule = new Map();

  function rebuildEncounters() {
    encounterSchedule.clear();
    for (const hour of ENCOUNTER_HOURS) {
      encounterSchedule.set(hour, {
        startMinute: 6 + Math.floor(Math.random() * 24),
        durationMinutes: 11 + Math.floor(Math.random() * 10),
      });
    }
  }

  function updateClock() {
    const gameHourRaw = GAME_CONFIG.gameStartHour + state.gameTimeHours;
    const displayHour = gameHourRaw >= 24 ? gameHourRaw - 24 : gameHourRaw;

    state.activeHour = displayHour;
    ui.setClock(displayHour);

    if (displayHour === GAME_CONFIG.gameEndHour) {
      state.running = false;
      ui.toggleInstructions(true);
      const prior = document.getElementById("resultMessage");
      if (prior) prior.remove();

      const result = document.createElement("p");
      result.id = "resultMessage";
      result.innerHTML = "<b>You survived the shift.</b> Press Start Night to play again.";
      document.getElementById("instructions").appendChild(result);
    }
  }

  function updateCreature() {
    const currentHour = state.activeHour;
    const schedule = encounterSchedule.get(currentHour);
    const minute = Math.floor((state.gameTimeHours % 1) * 60);

    let visible = false;
    if (schedule) {
      visible = minute >= schedule.startMinute && minute <= schedule.startMinute + schedule.durationMinutes;
    }

    state.creatureVisible = visible;

    scene.creature.visible = visible && state.flashlightOn;
    scene.placeholderHead.visible = visible && !state.flashlightOn;
  }

  function tick(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    if (state.running) {
      state.gameTimeHours += dt / GAME_CONFIG.secondsPerGameHour;
      updateClock();
      updateCreature();
      input.update(dt, GAME_CONFIG);

      scene.camera.position.x = state.cameraX;
      scene.camera.position.z = state.cameraZ;
      scene.syncFlashlight(state.flashlightOn);
    }

    scene.render();
    requestAnimationFrame(tick);
  }

  function start() {
    state.running = true;
    state.flashlightOn = false;
    state.cameraX = 0;
    state.cameraZ = 3.9;
    state.gameTimeHours = 0;
    const prior = document.getElementById("resultMessage");
    if (prior) prior.remove();

    ui.setClock(12);
    ui.setFlashlightLabel();
    rebuildEncounters();
  }

  updateClock();
  ui.setFlashlightLabel();
  requestAnimationFrame(tick);

  return { start };
}
