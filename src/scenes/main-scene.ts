import { adjustForPixelRatio } from '@jostein-skaar/common-game';
import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  playerName!: string;

  groundLayer: any;
  bredde!: number;
  hoyde!: number;
  map!: Phaser.Tilemaps.Tilemap;
  hero!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  enemyGroup!: Phaser.Physics.Arcade.Group;
  points = 0;
  pointsBest = 0;
  pointsText!: Phaser.GameObjects.Text;
  isPaused: boolean = false;
  isDead: boolean = false;
  level: number = 1;
  countdownText!: Phaser.GameObjects.Text;
  heroSpeedX = adjustForPixelRatio(100);
  heroSpeedY = adjustForPixelRatio(-400);

  constructor() {
    super('main-scene');
  }

  init(data: any): void {
    this.playerName = data.playerName;
    this.bredde = this.game.scale.gameSize.width;
    this.hoyde = this.game.scale.gameSize.height;
    const tempBestScore = localStorage.getItem(`teddymath-best-score-${this.level}`);
    this.pointsBest = tempBestScore === null ? 0 : +tempBestScore;
  }

  create(): void {
    const tilesSize = adjustForPixelRatio(32);

    this.map = this.make.tilemap({ key: 'map' });
    const tiles = this.map.addTilesetImage('tiles', 'tiles');

    console.log('this.map.widthInPixels', this.map.widthInPixels);

    const platformLayer = this.map.createLayer(`level${this.level}`, [tiles]);
    platformLayer.setCollisionByProperty({ ground: true });

    this.enemyGroup = this.physics.add.group({
      allowGravity: false,
      // immovable: true,
    });

    this.hero = this.physics.add.sprite(0, 0, 'sprites', 'hero-001.png');
    this.hero.setPosition(this.hero.width / 2 + adjustForPixelRatio(10), this.hoyde - this.hero.height / 2 - tilesSize * 5);

    this.hero.anims.create({
      key: 'stand',
      frames: [{ key: 'sprites', frame: 'hero-001.png' }],
      frameRate: 6,
    });
    this.hero.anims.create({
      key: 'walk',
      frames: [
        { key: 'sprites', frame: 'hero-001.png' },
        { key: 'sprites', frame: 'hero-002.png' },
      ],
      frameRate: 6,
    });
    this.hero.anims.create({
      key: 'jump',
      frames: [{ key: 'sprites', frame: 'hero-002.png' }],
      frameRate: 6,
    });

    this.input.on('pointerdown', () => {
      if (this.hero.body.onFloor()) {
        this.hero.setVelocityY(this.heroSpeedY);
        console.log('HOPP: onFloor()');
      } else {
        console.log('HOPP: else');
      }
    });

    this.cameras.main.startFollow(this.hero);
    this.cameras.main.setFollowOffset(this.hero.width / 2 - this.bredde / 2 + adjustForPixelRatio(100));
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    this.physics.add.collider(this.hero, platformLayer);

    this.physics.add.overlap(this.hero, this.enemyGroup, (_helt, _enemy) => {
      console.log('Matteoppgave???');
    });

    this.pointsText = this.add.text(adjustForPixelRatio(16), adjustForPixelRatio(16), '', {
      fontSize: `${adjustForPixelRatio(24)}px`,
      color: '#000',
      backgroundColor: '#ccc',
      padding: { x: adjustForPixelRatio(5), y: adjustForPixelRatio(5) },
    });
    this.pointsText.setScrollFactor(0, 0);

    this.countdownText = this.add
      .text(this.bredde / 2, this.hoyde / 2, '', {
        fontSize: `${adjustForPixelRatio(200)}px`,
        color: '#674B38',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5);

    this.tweens.add({
      targets: this.countdownText,
      // x: this.bredde,
      scale: 1.4,
      ease: 'Power0',
      duration: 250,
      yoyo: true,
      repeat: -1,
    });
    let countdownCounter = 0;
    if (countdownCounter > 0) {
      this.countdownText.setText(countdownCounter.toString());
      const countdownIntervalId = setInterval(() => {
        countdownCounter--;
        this.countdownText.setText(countdownCounter.toString());
        console.log(countdownCounter);
        if (countdownCounter <= 0) {
          this.countdownText.setVisible(false);
          this.startGame();
          clearInterval(countdownIntervalId);
        }
      }, 1000);

      this.isPaused = true;
      this.physics.pause();
    } else {
      this.startGame();
    }

    this.points = 0;
    this.isDead = false;
    this.updateText();
  }

  update(): void {
    this.hero.setVelocityX(this.heroSpeedX);

    // Animasjoner.
    if (!this.isPaused) {
      if (this.hero.body.onFloor() && !this.hero.body.onWall()) {
        this.hero.play('walk', true);
      } else if (!this.hero.body.onFloor()) {
        this.hero.play('jump', true);
      } else {
        this.hero.play('stand', true);
      }
    }
    if (this.hero.x > this.map.widthInPixels) {
      this.lose();
    }

    if (this.hero.y > this.map.heightInPixels) {
      this.lose();
    }
  }

  private updateText() {
    let text = `Level ${this.level}`;
    text += `\nPoeng: ${this.points}`;
    if (this.pointsBest > 0) {
      text += `\nRekord: ${this.pointsBest}`;
    }

    this.pointsText.setText(text);
  }

  private startGame() {
    this.isPaused = false;
    this.physics.resume();
  }

  private lose() {
    if (this.isDead) {
      return;
    }
    this.isDead = true;
    this.scene.pause();
    this.hero.setTint(0xff0000);
    this.cameras.main.setBackgroundColor(0xbababa);
    this.cameras.main.setAlpha(0.5);

    this.pointsBest = Math.max(this.points, this.pointsBest);
    localStorage.setItem(`teddymath-best-score-${this.level}`, this.pointsBest.toString());

    console.log({ resultat: this.points, level: this.level });
    this.scene.launch('lost-scene', { resultat: this.points, level: this.level });

    // const goToHomeTimeout = setTimeout(() => {
    //   // this.scene.restart({ level: this.level });
    //   const home = document.querySelector<HTMLDivElement>('#home')!;
    //   const game = document.querySelector<HTMLDivElement>('#game')!;
    //   home.style.display = 'block';
    //   game.style.display = 'none';
    // }, 3000);

    // setTimeout(() => {
    //   this.input.once('pointerdown', () => {
    //     console.log('Want to try level again');
    //     clearTimeout(goToHomeTimeout);
    //     this.scene.start('main-scene', { level: this.level });
    //   });
    // }, 500);
  }
}
