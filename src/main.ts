import './style.css';

import Phaser from 'phaser';
// import { createGameConfig } from './config';
import { reloadWhenResize } from '@jostein-skaar/common-game';
import { createGameConfig } from './config';

reloadWhenResize(window);

let isDebug = true;

if (import.meta.env.PROD) {
  isDebug = false;
}

// TODO: GET ALL THIS FROM  common-game package

const maxWantedWidth = 640;
// Height should always be 640px. This is from the tilemap.
const height = 640;
// Width is not that important, but shouldn't be to wide.
let width = maxWantedWidth;

let scaleModePhaser = Phaser.Scale.ScaleModes.NONE;
let centerModePhaser = Phaser.Scale.Center.NO_CENTER;
if (window.innerHeight < height) {
  scaleModePhaser = Phaser.Scale.ScaleModes.FIT;
  const scaleRatio = window.innerHeight / height;
  console.log('scaleRatio', scaleRatio);
  // Compensate scale ratio to be able to fill width of screen when FIT is used.
  width = Math.min(window.innerWidth / scaleRatio, maxWantedWidth);
} else {
  width = Math.min(window.innerWidth, maxWantedWidth);
}

if (width < window.innerWidth) {
  centerModePhaser = Phaser.Scale.Center.CENTER_BOTH;
}

console.table({ width, height, scaleModePhaser, centerModePhaser });

const gameConfig = createGameConfig(width, height, scaleModePhaser, centerModePhaser, isDebug);
const phaserGame = new Phaser.Game(gameConfig);

document.querySelector<HTMLDivElement>('button.start')!.addEventListener('click', () => {
  startGame();
});

function startGame() {
  phaserGame.scene.start('main-scene', { playerName: 'anonym' });
  const home = document.querySelector<HTMLDivElement>('#home')!;
  const game = document.querySelector<HTMLDivElement>('#game')!;
  home.style.display = 'none';
  game.style.display = 'block';
}

window.onload = () => {
  const loader = document.querySelector<HTMLDivElement>('#loader')!;
  const home = document.querySelector<HTMLDivElement>('#home')!;
  const game = document.querySelector<HTMLDivElement>('#game')!;

  loader.style.display = 'none';
  home.style.display = 'block';
  game.style.display = 'none';

  setTimeout(() => {
    startGame();
  }, 100);
};
