import Phaser from "phaser";
import {
  TILE,
  LEVEL_CONFIG,
  EVENTS,
  SNAP_THRESHOLD,
} from "../constants/Constants";
import { Grid } from "../levels/Grid";

export enum Direction {
  NONE = "NONE",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  UP = "UP",
  DOWN = "DOWN",
}

const R = LEVEL_CONFIG.TILE_SIZE / 2 - 1;
const MAX_MOUTH = 0.35;
const MOUTH_SPEED = 6;

const DIR_ANGLES: Record<string, number> = {
  LEFT: Math.PI,
  RIGHT: 0,
  UP: -Math.PI / 2,
  DOWN: Math.PI / 2,
};

export class Pacman {
  tileX: number;
  tileY: number;
  pixelX: number;
  pixelY: number;
  direction: Direction = Direction.NONE;
  nextDirection: Direction = Direction.NONE;
  speed: number;
  graphic: Phaser.GameObjects.Graphics;

  private scene: Phaser.Scene;
  private grid: Grid;
  private startTileX: number;
  private startTileY: number;
  private mouthPhase: number = 0;

  constructor(scene: Phaser.Scene, grid: Grid, tileX: number, tileY: number) {
    this.scene = scene;
    this.grid = grid;
    this.startTileX = tileX;
    this.startTileY = tileY;
    this.tileX = tileX;
    this.tileY = tileY;
    const center = grid.tileToPixel(tileX, tileY);
    this.pixelX = center.x;
    this.pixelY = center.y;
    this.speed = LEVEL_CONFIG.PLAYER_SPEED;
    this.graphic = scene.add.graphics();
    this.graphic.setPosition(this.pixelX, this.pixelY);
    this.drawPacman(Direction.NONE, 0);
  }

  reset(): void {
    this.tileX = this.startTileX;
    this.tileY = this.startTileY;
    const center = this.grid.tileToPixel(this.tileX, this.tileY);
    this.pixelX = center.x;
    this.pixelY = center.y;
    this.direction = Direction.NONE;
    this.nextDirection = Direction.NONE;
    this._wasAtCenter = false;
    this.mouthPhase = 0;
    this.graphic.setPosition(this.pixelX, this.pixelY);
    this.drawPacman(Direction.NONE, 0);
  }

  setNextDirection(dir: Direction): void {
    if (this.direction === Direction.NONE) {
      const nextTile = this.nextTileInDirection(dir);
      if (!this.grid.isWall(nextTile.x, nextTile.y)) {
        this.direction = dir;
        this.nextDirection = Direction.NONE;
        return;
      }
    }

    if (this.isOpposite(dir, this.direction)) {
      this.direction = dir;
      this.nextDirection = Direction.NONE;
      return;
    }

    this.nextDirection = dir;
  }

  private _wasAtCenter = false;

  update(_time: number, delta: number): void {
    if (delta <= 0 || !isFinite(delta)) {
      this.graphic.setPosition(this.pixelX, this.pixelY);
      this.drawPacman(this.direction, this.mouthPhase);
      return;
    }

    this.consumePellet();

    if (this.direction === Direction.NONE) {
      if (this.nextDirection !== Direction.NONE) {
        const nextTile = this.nextTileInDirection(this.nextDirection);
        if (!this.grid.isWall(nextTile.x, nextTile.y)) {
          this.direction = this.nextDirection;
          this.nextDirection = Direction.NONE;
        }
      }
      if (this.direction === Direction.NONE) {
        this.graphic.setPosition(this.pixelX, this.pixelY);
        this.drawPacman(this.direction, 0);
        return;
      }
    }

    const center = this.grid.tileToPixel(this.tileX, this.tileY);
    const dx = this.pixelX - center.x;
    const dy = this.pixelY - center.y;
    const distFromCenter = Math.sqrt(dx * dx + dy * dy);

    if (distFromCenter < SNAP_THRESHOLD) {
      if (!this._wasAtCenter) {
        this.pixelX = center.x;
        this.pixelY = center.y;
        this._wasAtCenter = true;
      }

      if (this.nextDirection !== Direction.NONE) {
        const nextTile = this.nextTileInDirection(this.nextDirection);
        if (!this.grid.isWall(nextTile.x, nextTile.y)) {
          this.direction = this.nextDirection;
          this.nextDirection = Direction.NONE;
        }
      }

      const ahead = this.nextTileInDirection(this.direction);
      if (this.grid.isWall(ahead.x, ahead.y)) {
        this.graphic.setPosition(this.pixelX, this.pixelY);
        this.drawPacman(this.direction, this.mouthPhase);
        return;
      }
    } else {
      this._wasAtCenter = false;
    }

    const step = this.speed * (delta / 1000);
    switch (this.direction) {
      case Direction.LEFT:
        this.pixelX -= step;
        break;
      case Direction.RIGHT:
        this.pixelX += step;
        break;
      case Direction.UP:
        this.pixelY -= step;
        break;
      case Direction.DOWN:
        this.pixelY += step;
        break;
    }

    const nextTile = this.nextTileInDirection(this.direction);
    const nextCenter = this.grid.tileToPixel(nextTile.x, nextTile.y);
    const distToNext = Math.sqrt(
      (this.pixelX - nextCenter.x) ** 2 + (this.pixelY - nextCenter.y) ** 2,
    );

    let passed = false;
    switch (this.direction) {
      case Direction.LEFT:
        passed = this.pixelX <= nextCenter.x;
        break;
      case Direction.RIGHT:
        passed = this.pixelX >= nextCenter.x;
        break;
      case Direction.UP:
        passed = this.pixelY <= nextCenter.y;
        break;
      case Direction.DOWN:
        passed = this.pixelY >= nextCenter.y;
        break;
    }

    if (distToNext < SNAP_THRESHOLD || passed) {
      this.pixelX = nextCenter.x;
      this.pixelY = nextCenter.y;
      this.tileX = nextTile.x;
      this.tileY = nextTile.y;
      this.consumePellet();
    }

    this.mouthPhase += delta * MOUTH_SPEED * 0.001;
    this.graphic.setPosition(this.pixelX, this.pixelY);
    this.drawPacman(this.direction, this.mouthPhase);
  }

  private drawPacman(dir: Direction, phase: number): void {
    const g = this.graphic;
    g.clear();

    const angle = DIR_ANGLES[dir];
    if (angle === undefined) {
      g.fillStyle(0xffff00);
      g.fillCircle(0, 0, R);
      return;
    }
    const mouth = Math.abs(Math.sin(phase)) * MAX_MOUTH;

    g.fillStyle(0xffff00);
    g.beginPath();
    g.moveTo(0, 0);
    g.arc(0, 0, R, angle + mouth, angle - mouth, false);
    g.closePath();
    g.fillPath();
  }

  private nextTileInDirection(dir: Direction): { x: number; y: number } {
    switch (dir) {
      case Direction.LEFT:
        return { x: this.tileX - 1, y: this.tileY };
      case Direction.RIGHT:
        return { x: this.tileX + 1, y: this.tileY };
      case Direction.UP:
        return { x: this.tileX, y: this.tileY - 1 };
      case Direction.DOWN:
        return { x: this.tileX, y: this.tileY + 1 };
      default:
        return { x: this.tileX, y: this.tileY };
    }
  }

  private isOpposite(a: Direction, b: Direction): boolean {
    return (
      (a === Direction.LEFT && b === Direction.RIGHT) ||
      (a === Direction.RIGHT && b === Direction.LEFT) ||
      (a === Direction.UP && b === Direction.DOWN) ||
      (a === Direction.DOWN && b === Direction.UP)
    );
  }

  private consumePellet(): void {
    const tile = this.grid.getTile(this.tileX, this.tileY);
    if (tile === TILE.PELLET) {
      this.grid.setTile(this.tileX, this.tileY, TILE.EMPTY);
      this.scene.events.emit(EVENTS.PELLET_EATEN, this.tileX, this.tileY);
    } else if (tile === TILE.POWER_PELLET) {
      this.grid.setTile(this.tileX, this.tileY, TILE.EMPTY);
      this.scene.events.emit(EVENTS.POWER_PELLET_EATEN, this.tileX, this.tileY);
    }
  }
}
