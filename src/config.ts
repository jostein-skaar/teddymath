import { adjustForPixelRatio } from '@jostein-skaar/common-game';
import { LostScene } from './scenes/lost-scene';
import { MainScene } from './scenes/main-scene';
import { PreloadScene } from './scenes/preload-scene';

export function createGameConfig(
  width: number,
  height: number,
  scalingModePhaser: Phaser.Scale.ScaleModes,
  centerModePhaser: Phaser.Scale.Center,
  isDebug: boolean
): Phaser.Types.Core.GameConfig {
  const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    // type: Phaser.CANVAS,
    scene: [PreloadScene, MainScene, LostScene],
    width: adjustForPixelRatio(width),
    height: adjustForPixelRatio(height),
    backgroundColor: 0x87ceeb,
    autoFocus: true,
    parent: 'game',

    render: {
      antialias: true, // Using this to prevent flickering presents when moving (at least on iPhone with pixelRatio 3).
      // antialias: false, er default, giving a crisper appearance.
      // antialias: true, // giving a smooth appearance.
      // roundPixels: true, round pixel values to whole integers? Prevent sub-pixel aliasing. (false er default)
      // pixelArt: true, gir antialias=false og roundPixels=true
    },

    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: adjustForPixelRatio(300) },
        debug: isDebug,
      },
    },

    scale: {
      // Vi har denne som FIT først, for da vil canvas.style.width og .height settes automatisk.
      // Må fjernes etterpå, ellers vil rare ting skje i forbindelse med resize.
      mode: scalingModePhaser,
      autoCenter: centerModePhaser,
      // mode: Phaser.Scale.ScaleModes.NONE,
      // mode: Phaser.Scale.ScaleModes.FIT,
      // autoCenter: Phaser.Scale.Center.CENTER_BOTH,
      // autoCenter: Phaser.Scale.Center.CENTER_HORIZONTALLY,
      // autoCenter: Phaser.Scale.Center.CENTER_VERTICALLY,
      // expandParent: true

      zoom: 1 / adjustForPixelRatio(1),
      // autoRound: true,
    },
  };

  return gameConfig;
}
