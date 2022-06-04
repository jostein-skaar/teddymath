import { adjustForPixelRatio } from '@jostein-skaar/common-game';

export class LostScene extends Phaser.Scene {
  bredde!: number;
  hoyde!: number;
  forrigeResultat!: number;
  level!: string;

  constructor() {
    super({ key: 'lost-scene' });
  }

  init(data: any) {
    this.bredde = this.game.scale.gameSize.width;
    this.hoyde = this.game.scale.gameSize.height;
    this.forrigeResultat = data.resultat;
    this.level = data.level;
  }

  create() {
    const tekst = `Du klarte ${this.forrigeResultat}\nTrykk for å prøve igjen\n(Vent for å gå til meny)`;
    this.add
      .text(this.bredde / 2, this.hoyde / 2, tekst, {
        fontFamily: 'arial',
        fontSize: `${adjustForPixelRatio(20)}px`,
        color: '#fff',
        align: 'center',
        backgroundColor: '#0653c7',
        padding: { x: adjustForPixelRatio(15), y: adjustForPixelRatio(15) },
      })
      .setOrigin(0.5, 0.5);

    const goToHomeTimeout = setTimeout(() => {
      this.scene.start('main-scene', { level: this.level });

      // this.scene.stop();
      // const home = document.querySelector<HTMLDivElement>('#home')!;
      // const game = document.querySelector<HTMLDivElement>('#game')!;
      // home.style.display = 'block';
      // game.style.display = 'none';
    }, 5000);

    setTimeout(() => {
      this.input.once('pointerdown', () => {
        clearTimeout(goToHomeTimeout);
        this.scene.start('main-scene', { level: this.level });
      });
    }, 500);
  }
}
