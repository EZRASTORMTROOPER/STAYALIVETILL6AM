import { GAME_CONFIG } from "./config.js";
import { createGame } from "./game.js";
import { setupInput } from "./input.js";
import { createScene } from "./scene.js";
import { createInitialState } from "./state.js";
import { createUI } from "./ui.js";

const state = createInitialState();
const ui = createUI(state);
const scene = createScene(GAME_CONFIG);
const input = setupInput(state, ui);
const game = createGame(state, ui, scene, input);

ui.bindStart(game.start);
