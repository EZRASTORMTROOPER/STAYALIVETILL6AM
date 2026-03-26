const LEFT_KEYS = ["KeyA", "ArrowLeft"];
const RIGHT_KEYS = ["KeyD", "ArrowRight"];
const FORWARD_KEYS = ["KeyW", "ArrowUp"];
const BACK_KEYS = ["KeyS", "ArrowDown"];
const FLASH_KEYS = ["KeyF", "Space"];

export function setupInput(state, ui) {
  function onKeyDown(event) {
    state.keyState.add(event.code);

    if (FLASH_KEYS.includes(event.code)) {
      state.flashlightOn = !state.flashlightOn;
      ui.setFlashlightLabel();
      event.preventDefault();
    }

    if (event.code === "KeyH") {
      ui.toggleInstructions();
      event.preventDefault();
    }
  }

  function onKeyUp(event) {
    state.keyState.delete(event.code);
  }

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  return {
    update(dt, cfg) {
      const movingLeft = LEFT_KEYS.some((key) => state.keyState.has(key));
      const movingRight = RIGHT_KEYS.some((key) => state.keyState.has(key));
      const movingForward = FORWARD_KEYS.some((key) => state.keyState.has(key));
      const movingBack = BACK_KEYS.some((key) => state.keyState.has(key));

      if (movingLeft) state.cameraX -= cfg.lookSpeed * dt;
      if (movingRight) state.cameraX += cfg.lookSpeed * dt;
      if (movingForward) state.cameraZ -= cfg.zoomSpeed * dt;
      if (movingBack) state.cameraZ += cfg.zoomSpeed * dt;

      state.cameraX = Math.max(-cfg.maxLookX, Math.min(cfg.maxLookX, state.cameraX));
      state.cameraZ = Math.max(cfg.minCameraZ, Math.min(cfg.maxCameraZ, state.cameraZ));
    },
  };
}
