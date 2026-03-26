export function createUI(state) {
  const clockEl = document.getElementById("clock");
  const flashlightStateEl = document.getElementById("flashlightState");
  const instructionsEl = document.getElementById("instructions");
  const startBtn = document.getElementById("startBtn");

  function setFlashlightLabel() {
    flashlightStateEl.textContent = `Flashlight: ${state.flashlightOn ? "ON" : "OFF"}`;
  }

  function formatClock(hour) {
    if (hour === 0 || hour === 12) return "12:00 AM";
    return `${hour}:00 AM`;
  }

  function setClock(hour) {
    clockEl.textContent = formatClock(hour);
  }

  function toggleInstructions(forceShow) {
    const shouldShow =
      typeof forceShow === "boolean" ? forceShow : instructionsEl.classList.contains("hidden");
    instructionsEl.classList.toggle("hidden", !shouldShow);
  }

  function bindStart(onStart) {
    startBtn.addEventListener("click", () => {
      toggleInstructions(false);
      onStart();
    });
  }

  return {
    bindStart,
    setClock,
    setFlashlightLabel,
    toggleInstructions,
  };
}
