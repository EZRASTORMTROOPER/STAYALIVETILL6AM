import { CAMERA, POWER } from './config.js';
import { NightClock } from './clock.js';
import { AnimatronicController } from './animatronic.js';

export class Game {
  constructor({ input, ui, scene }) {
    this.input = input;
    this.ui = ui;
    this.scene = scene;

    this.clock = new NightClock();
    this.animatronic = new AnimatronicController();

    this.running = false;
    this.power = POWER.max;
    this.cameraX = CAMERA.baseX;
    this.lastTime = 0;

    this.loop = this.loop.bind(this);
  }

  start() {
    this.running = true;
    this.clock.reset();
    this.animatronic.reset();
    this.power = POWER.max;
    this.cameraX = CAMERA.baseX;
    this.lastTime = performance.now();

    this.ui.hideResult();
    this.ui.showInstructions(false);

    requestAnimationFrame(this.loop);
  }

  end(win, message) {
    this.running = false;
    this.ui.setResult(win ? '6:00 AM - You Survived!' : 'Game Over', message);
    this.scene.setAnimatronicVisible(true);
    this.scene.setFlashlight(false);
  }

  loop(time) {
    const dt = Math.min(0.05, (time - this.lastTime) / 1000);
    this.lastTime = time;

    if (this.running) {
      this.update(dt);
    }

    this.scene.render();

    if (this.running) {
      requestAnimationFrame(this.loop);
    }
  }

  update(dt) {
    if (this.input.consumeHelpToggle()) {
      const currentlyHidden = this.ui.instructionsEl.classList.contains('hidden');
      this.ui.showInstructions(currentlyHidden);
    }

    const axis = (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);
    this.cameraX += axis * CAMERA.speed * dt;
    this.cameraX = Math.max(CAMERA.minX, Math.min(CAMERA.maxX, this.cameraX));
    this.scene.setCameraX(this.cameraX);

    const flashlightOn = this.input.flashlightHeld;
    this.scene.setFlashlight(flashlightOn);

    this.clock.update(dt);
    this.animatronic.update(this.clock.getProgress(), flashlightOn);

    const seesAnimatronic = this.animatronic.isFlashlightCatch(flashlightOn);
    this.scene.setAnimatronicVisible(seesAnimatronic);

    const drain = POWER.drainPerSecond + (flashlightOn ? POWER.extraFlashlightDrain : 0);
    this.power -= drain * dt;

    this.ui.setClock(this.clock.getDisplayString());
    this.ui.setPower(this.power);

    if (this.power <= 0) {
      this.end(false, 'The office lost power before 6:00 AM.');
      return;
    }

    if (this.animatronic.isThreatening(flashlightOn)) {
      this.end(false, 'You missed a hallway check. The animatronic got in.');
      return;
    }

    if (this.clock.isNightComplete()) {
      this.end(true, 'You made it through the night shift.');
    }
  }
}
