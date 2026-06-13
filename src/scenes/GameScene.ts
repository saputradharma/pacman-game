import Phaser from 'phaser';
import { TILE, LEVEL_CONFIG, EVENTS, GhostMode, GhostType } from '../constants/Constants';
import { mazeData } from '../levels/mazeData';
import { Grid } from '../levels/Grid';
import { Pacman, Direction } from '../entities/Pacman';
import { Ghost } from '../entities/Ghost';

export class GameScene extends Phaser.Scene {
  grid: Grid;
  pacman!: Pacman;
  ghosts!: Ghost[];
  pelletGraphics!: Map<string, Phaser.GameObjects.Arc>;
  score: number = 0;
  lives: number = LEVEL_CONFIG.PLAYER_LIVES;
  frightenedTimer: number = 0;
  scoreText!: Phaser.GameObjects.Text;
  livesText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
    this.grid = new Grid(mazeData);
  }

  create(): void {
    this.score = 0;
    this.lives = LEVEL_CONFIG.PLAYER_LIVES;
    this.frightenedTimer = 0;
    this.pelletGraphics = new Map();
    this.renderMaze();

    this.pacman = new Pacman(this, this.grid, 14, 20);

    this.ghosts = [
      new Ghost(this, this.grid, 14, 11, GhostType.BLINKY),
      new Ghost(this, this.grid, 14, 14, GhostType.PINKY),
      new Ghost(this, this.grid, 12, 15, GhostType.INKY),
      new Ghost(this, this.grid, 15, 15, GhostType.CLYDE),
    ];
    for (const ghost of this.ghosts) {
      ghost.setMode(GhostMode.SCATTER);
      ghost.direction = Direction.LEFT;
    }

    this.scoreText = this.add.text(8, 4, `Score: 0`, {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setDepth(10);

    this.livesText = this.add.text(
      LEVEL_CONFIG.GRID_COLS * LEVEL_CONFIG.TILE_SIZE - 8,
      4,
      `Lives: ${this.lives}`,
      {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'monospace',
      },
    ).setOrigin(1, 0).setDepth(10);

    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault();
          this.pacman.setNextDirection(Direction.LEFT);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault();
          this.pacman.setNextDirection(Direction.RIGHT);
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          event.preventDefault();
          this.pacman.setNextDirection(Direction.UP);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          event.preventDefault();
          this.pacman.setNextDirection(Direction.DOWN);
          break;
      }
    });

    const onPelletRemoved = (tileX: number, tileY: number): void => {
      const key = `${tileX},${tileY}`;
      const graphic = this.pelletGraphics.get(key);
      if (graphic) {
        graphic.destroy();
        this.pelletGraphics.delete(key);
      }
    };
    this.events.on(EVENTS.PELLET_EATEN, onPelletRemoved);
    this.events.on(EVENTS.POWER_PELLET_EATEN, onPelletRemoved);
    this.events.on(EVENTS.PELLET_EATEN, (tileX: number, tileY: number) => this.handlePelletEaten(tileX, tileY));
    this.events.on(EVENTS.POWER_PELLET_EATEN, (tileX: number, tileY: number) => this.handlePowerPelletEaten(tileX, tileY));
  }

  private updateHUD(): void {
    this.scoreText.setText(`Score: ${this.score}`);
    this.livesText.setText(`Lives: ${this.lives}`);
  }

  handlePelletEaten(_tileX: number, _tileY: number): void {
    this.score += LEVEL_CONFIG.PELLET_SCORE;
    this.updateHUD();
  }

  handlePowerPelletEaten(_tileX: number, _tileY: number): void {
    this.score += LEVEL_CONFIG.POWER_PELLET_SCORE;
    this.updateHUD();
    for (const ghost of this.ghosts) {
      if (ghost.mode !== GhostMode.EATEN && ghost.mode !== GhostMode.IN_HOUSE) {
        ghost.setMode(GhostMode.FRIGHTENED);
      }
    }
    this.frightenedTimer = LEVEL_CONFIG.GHOST_FRIGHTENED_DURATION;
  }

  onFrightenedExpired(): void {
    for (const ghost of this.ghosts) {
      if (ghost.mode === GhostMode.FRIGHTENED) {
        ghost.setMode(GhostMode.SCATTER);
      }
    }
  }

  handleGhostEaten(_tileX: number, _tileY: number): void {
    this.score += LEVEL_CONFIG.GHOST_EATEN_SCORE;
    this.updateHUD();
  }

  handlePacmanDeath(): void {
    this.lives--;
    this.updateHUD();
    if (this.lives <= 0) {
      this.scene.start('GameOverScene', { score: this.score });
    } else {
      this.pacman.reset();
      for (const ghost of this.ghosts) {
        ghost.reset();
      }
      for (const ghost of this.ghosts) {
        ghost.setMode(GhostMode.SCATTER);
        ghost.direction = Direction.LEFT;
      }
    }
  }

  private checkCollisions(): void {
    const px = this.pacman.tileX;
    const py = this.pacman.tileY;
    for (const ghost of this.ghosts) {
      if (ghost.tileX === px && ghost.tileY === py) {
        if (ghost.mode === GhostMode.EATEN || ghost.mode === GhostMode.IN_HOUSE) {
          continue;
        }
        if (ghost.mode === GhostMode.FRIGHTENED) {
          ghost.setMode(GhostMode.EATEN);
          this.handleGhostEaten(ghost.tileX, ghost.tileY);
          this.events.emit(EVENTS.GHOST_EATEN, ghost.tileX, ghost.tileY);
        } else {
          this.handlePacmanDeath();
          break;
        }
      }
    }
  }

  private renderMaze(): void {
    const { TILE_SIZE } = LEVEL_CONFIG;
    for (let row = 0; row < mazeData.length; row++) {
      for (let col = 0; col < mazeData[0].length; col++) {
        const tile = mazeData[row][col];
        const x = col * TILE_SIZE + TILE_SIZE / 2;
        const y = row * TILE_SIZE + TILE_SIZE / 2;

        if (tile === TILE.WALL) {
          this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, 0x2121de);
        } else if (tile === TILE.GHOST_HOUSE) {
          this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, 0x333333);
        } else if (tile === TILE.GHOST_DOOR) {
          this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, 0xffb8ff);
        } else if (tile === TILE.EMPTY) {
          this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, 0x000000);
        } else if (tile === TILE.PELLET) {
          const circle = this.add.circle(x, y, 2, 0xffb8ae);
          circle.setDepth(-1);
          this.pelletGraphics.set(`${col},${row}`, circle);
        } else if (tile === TILE.POWER_PELLET) {
          const circle = this.add.circle(x, y, 5, 0xffb8ae);
          circle.setDepth(-1);
          this.pelletGraphics.set(`${col},${row}`, circle);
        }
      }
    }
  }

  update(_time: number, delta: number): void {
    if (this.frightenedTimer > 0) {
      this.frightenedTimer -= delta;
      if (this.frightenedTimer <= 0) {
        this.frightenedTimer = 0;
        this.onFrightenedExpired();
      }
    }

    this.pacman.update(_time, delta);

    const pacmanTile = { x: this.pacman.tileX, y: this.pacman.tileY };
    const pacmanDirection = this.pacman.direction;
    const blinkyTile = this.ghosts[0]
      ? { x: this.ghosts[0].tileX, y: this.ghosts[0].tileY }
      : undefined;

    for (const ghost of this.ghosts) {
      ghost.update(_time, delta, pacmanTile, pacmanDirection, blinkyTile);
    }

    this.checkCollisions();
  }
}
