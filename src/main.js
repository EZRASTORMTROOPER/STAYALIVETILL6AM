import { GAME_CONFIG } from './config.js';
import { ClockSystem } from './clockSystem.js';
import { InputSystem } from './input.js';
import { OfficeScene } from './officeScene.js';
import { EncounterSystem } from './encounterSystem.js';
import { UiSystem } from './uiSystem.js';

const canvas = document.getElementById('game-canvas');
const officeScene = new OfficeScene(canvas);
await officeScene.init();

const input = new InputSystem();
const ui = new UiSystem();
const clock = new ClockSystem({
  startHour: GAME_CONFIG.startHour,
  endHour: GAME_CONFIG.endHour,
  durationSeconds: GAME_CONFIG.nightDurationSeconds,
});
const encounters = new EncounterSystem({
  startHour: GAME_CONFIG.startHour,
  intruderHours: GAME_CONFIG.intruderHours,
  intruderWindowSeconds: GAME_CONFIG.intruderWindowSeconds,
  nightDurationSeconds: GAME_CONFIG.nightDurationSeconds,
});

let lastTime = performance.now();
let power = 100;
let gameOver = false;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function loop(now) {
  const delta = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  if (!gameOver) {
    clock.update(delta);
    officeScene.updateCameraPan(input.turn * GAME_CONFIG.panSpeed * delta);
    officeScene.camera.position.x = clamp(officeScene.camera.position.x, -GAME_CONFIG.maxPan, GAME_CONFIG.maxPan);

    const drainRate = GAME_CONFIG.passiveDrainPerSecond + (input.flashlightOn ? GAME_CONFIG.flashlightDrainPerSecond : 0);
    power -= drainRate * delta;
    if (power <= 0) {
      power = 0;
      input.flashlightOn = false;
      gameOver = true;
      ui.setStatus('POWER OUT');
    }

    if (clock.finished) {
      gameOver = true;
      ui.setStatus('6:00 AM — YOU SURVIVED');
    }
  }

  const { intruderVisible, eventHour, animFrame } = encounters.update(clock.elapsed, input.flashlightOn && power > 0);
  officeScene.animateIntruder(animFrame);
  officeScene.setIntruderVisibility(intruderVisible ? 0.95 : 0);

  if (intruderVisible && !gameOver) {
    ui.setStatus(`INTRUDER SPOTTED (${eventHour}:00 AM)`);
  } else if (!gameOver) {
    ui.setStatus('');
  }

  officeScene.setFlashlightEnabled(input.flashlightOn && power > 0);
  ui.setClock(clock.hour12Label);
  ui.setPower(power);

  officeScene.render();
  requestAnimationFrame(loop);
}

ui.setStatus('Hold your nerve...');
requestAnimationFrame(loop);
