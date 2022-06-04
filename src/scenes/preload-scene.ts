import { adjustForPixelRatio } from '@jostein-skaar/common-game';
import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'preload-scene' });
  }

  preload() {
    console.log('preload-scene');

    this.load.multiatlas('sprites', `/assets/sprites@${adjustForPixelRatio(1)}.json?v={VERSJON}`, '/assets');

    this.load.image('tiles', `/assets/tiles@${adjustForPixelRatio(1)}.png?v={VERSJON}`);

    this.load.tilemapTiledJSON('map', `assets/levels@${adjustForPixelRatio(1)}.json?v={VERSJON}`);
  }
}
