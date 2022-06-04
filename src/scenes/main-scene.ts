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
  positionGround!: number;
  heroSpeedX = adjustForPixelRatio(100);
  heroSpeedY = adjustForPixelRatio(-400);
  problems!: Problem[];
  enemyByProblem = new Map<any, any[]>();
  // solutions! Solution[];

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
    this.positionGround = this.hoyde - tilesSize * 5;

    this.map = this.make.tilemap({ key: 'map' });
    const tiles = this.map.addTilesetImage('tiles', 'tiles');

    // const platformLayer = this.map.createLayer(`level${this.level}`, [tiles]);
    const platformLayer = this.map.createLayer(`level1`, [tiles]);
    platformLayer.setCollisionByProperty({ ground: true });

    this.enemyGroup = this.physics.add.group({
      allowGravity: false,
    });

    const numberOfProblems = 10;
    this.problems = this.createProblems(this.level, numberOfProblems);
    const spaceBetweenProblems = 300;
    for (let index = 0; index < numberOfProblems; index++) {
      const problem = this.problems[index];
      const answers = [problem.correctAnswer, problem.wrongAnswer];
      this.shuffle(answers);
      const [answer1, answer2] = answers;
      const x = adjustForPixelRatio(400 + spaceBetweenProblems * index);
      this.createProblemAndAnswerBoxes(problem.problem, answer1, answer2, x, index);
    }

    this.hero = this.physics.add.sprite(0, 0, 'sprites', 'hero-001.png');
    this.hero.setPosition(this.hero.width / 2 + adjustForPixelRatio(10), this.positionGround - this.hero.height / 2);

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
      }
    });

    this.cameras.main.startFollow(this.hero);
    this.cameras.main.setFollowOffset(this.hero.width / 2 - this.bredde / 2 + adjustForPixelRatio(100));
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    this.physics.add.collider(this.hero, platformLayer);

    this.physics.add.overlap(this.hero, this.enemyGroup, (_helt, enemy: any) => {
      const [index, problemBox, answear1Box, answear2Box] = this.enemyByProblem.get(enemy) as any[];

      this.enemyGroup.remove(answear1Box);
      this.enemyGroup.remove(answear2Box);

      answear1Box.setBackgroundColor('#838387');
      answear2Box.setBackgroundColor('#838387');

      const problem = this.problems[index];
      if (enemy.text === problem.correctAnswer) {
        this.points++;
        console.log('Correct');
        problemBox.setTintFill(0x0e5219);
        enemy.setBackgroundColor('#3ac250');
      } else {
        this.points--;
        console.log('Wrong');
        problemBox.setTintFill(0xff3333);
        enemy.setBackgroundColor('#ff3333');
      }

      this.updateText();

      // console.log('Matteoppgave???', _enemy.x, _enemy.y, _enemy.problemIndex);
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
    text += ` Poeng: ${this.points}`;
    // if (this.pointsBest > 0) {
    //   text += ` Rekord: ${this.pointsBest}`;
    // }

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

    this.level++;

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

  private createProblemAndAnswerBoxes(problem: string, answer1: string, answer2: string, x: number, index: number) {
    const yProblem = this.positionGround + adjustForPixelRatio(8);
    const yAnswer1 = adjustForPixelRatio(140);
    const yAnswer2 = this.positionGround - adjustForPixelRatio(50);

    const problemBox = this.createProblemBox(problem, x, yProblem);

    const answear1Box = this.createAnswerBox(answer1, x, yAnswer1);
    const answear2Box = this.createAnswerBox(answer2, x, yAnswer2);

    this.enemyGroup.add(answear1Box);
    this.enemyGroup.add(answear2Box);

    // To be able to make a lookup
    this.enemyByProblem.set(answear1Box, [index, problemBox, answear1Box, answear2Box]);
    this.enemyByProblem.set(answear2Box, [index, problemBox, answear1Box, answear2Box]);
  }

  private createProblemBox(text: string, x: number, y: number): Phaser.GameObjects.GameObject {
    return this.add.text(x, y, text, {
      fontSize: `${adjustForPixelRatio(24)}px`,
      fontFamily: 'sans-serif, Arial, Helvetica, sans-serif',
      color: '#000',
      fontStyle: 'bold',
      fixedWidth: adjustForPixelRatio(80),
      align: 'center',
    });
  }

  private createAnswerBox(text: string, x: number, y: number): Phaser.GameObjects.GameObject {
    return this.add.text(x, y, text, {
      fontSize: `${adjustForPixelRatio(24)}px`,
      color: '#fff',
      fontStyle: 'bold',
      backgroundColor: '#2013d1',
      fixedHeight: adjustForPixelRatio(50),
      fixedWidth: adjustForPixelRatio(80),
      align: 'center',
      padding: { y: adjustForPixelRatio(15) },
    });
  }

  private createProblems(level: number, count: number): Problem[] {
    const problems: Problem[] = [];
    for (let index = 0; index < count; index++) {
      const mathProblem = this.createMathProblem(level);
      let wrongAnswer = -1;
      while (wrongAnswer === mathProblem.answer || wrongAnswer < 0) {
        wrongAnswer = this.getRandomIntInclusive(mathProblem.answer - 10, mathProblem.answer + 10);
      }
      const problem: Problem = {
        problem: `${mathProblem.number1}${mathProblem.operator}${mathProblem.number2}`,
        correctAnswer: `${mathProblem.answer}`,
        wrongAnswer: `${wrongAnswer}`,
      };
      problems.push(problem);
    }
    return problems;
  }

  private createMathProblem(level: number): MathProblem {
    const multiply = (a: number, b: number) => a * b;

    const numbers: number[] = [];
    numbers.push(level <= 10 ? level : this.getRandomIntInclusive(0, 10));
    numbers.push(this.getRandomIntInclusive(1, 10));
    this.shuffle(numbers);

    const [number1, number2] = numbers;
    const answer = multiply(number1, number2);

    const mathProblem: MathProblem = {
      number1,
      number2,
      operator: 'x',
      answer,
    };
    return mathProblem;
  }

  private getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
  }

  private shuffle(array: any[]): any[] {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
  }
}

interface Problem {
  problem: string;
  correctAnswer: string;
  wrongAnswer: string;
}

interface MathProblem {
  number1: number;
  number2: number;
  operator: string;
  answer: number;
}
