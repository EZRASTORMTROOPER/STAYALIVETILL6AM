import { InputController } from './input.js';
import { UIController } from './ui.js';
import { GameScene } from './scene.js';
import { Game } from './game.js';

const root = document.getElementById('game-root');
const input = new InputController(window);
const ui = new UIController();
const scene = new GameScene(root);

const game = new Game({ input, ui, scene });

ui.onStart(() => game.start());
ui.onRestart(() => game.start());

scene.render();
