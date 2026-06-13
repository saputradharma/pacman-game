import Phaser from "phaser";
import {
  LEVEL_CONFIG,
  SNAP_THRESHOLD,
  GhostMode,
  GhostType,
  GHOST_COLORS,
  SCATTER_TARGETS,
  GHOST_HOUSE_TARGET,
} from "../constants/Constants";
import { Direction } from "../entities/Pacman";
import { Grid, TileCoord } from "../levels/Grid";

export class Ghost {
  tileX: number;
  tileY: number;
  pixelX: number;
  pixelY: number;
  direction: Direction = Direction.NONE;
  mode: GhostMode;
  ghostType: GhostType;
  speed: number;
  graphic: Phaser.GameObjects.Arc;

  private grid: Grid;
  private _wasAtCenter = false;
  private startTileX: number;
  private startTileY: number;

  constructor(_scene: Phaser.Scene, grid: Grid, tileX: number, tileY: number, ghostType: GhostType) {
    this.grid = grid;
    this.startTileX = tileX;
    this.startTileY = tileY;
    this.tileX = tileX;
    this.tileY = tileY;
    const center = grid.tileToPixel(tileX, tileY);
    this.pixelX = center.x;
    this.pixelY = center.y;
    this.speed = LEVEL_CONFIG.GHOST_SPEED;
    this.mode = GhostMode.IN_HOUSE;
    this.ghostType = ghostType;
    const color = GHOST_COLORS[ghostType];
    this.graphic = _scene.add.circle(
      this.pixelX,
      this.pixelY,
      LEVEL_CONFIG.TILE_SIZE / 2,
      color,
    );
  }

  reset(): void {
    this.tileX = this.startTileX;
    this.tileY = this.startTileY;
    const center = this.grid.tileToPixel(this.tileX, this.tileY);
    this.pixelX = center.x;
    this.pixelY = center.y;
    this.direction = Direction.NONE;
    this.mode = GhostMode.IN_HOUSE;
    this._wasAtCenter = false;
    this.graphic.setPosition(this.pixelX, this.pixelY);
  }

  setMode(mode: GhostMode): void {
    const wasFrightened = this.mode === GhostMode.FRIGHTENED;
    const enteringFrightened = mode === GhostMode.FRIGHTENED;
    this.mode = mode;
    if (wasFrightened !== enteringFrightened) {
      this.direction = this.getOpposite(this.direction);
    }
  }

  getTargetTile(pacmanTile: TileCoord, pacmanDirection: Direction, blinkyTile?: TileCoord): TileCoord {
    if (this.mode === GhostMode.SCATTER) {
      return { ...SCATTER_TARGETS[this.ghostType] };
    }
    if (this.mode === GhostMode.CHASE) {
      return this.getChaseTarget(pacmanTile, pacmanDirection, blinkyTile);
    }
    if (this.mode === GhostMode.FRIGHTENED) {
      return { x: 0, y: 0 };
    }
    return { ...GHOST_HOUSE_TARGET };
  }

  getAvailableDirections(): Direction[] {
    const opposite = this.getOpposite(this.direction);
    const available: Direction[] = [];
    for (const dir of [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT]) {
      if (dir === opposite) continue;
      const next = this.nextTileInDirection(dir);
      if (!this.grid.isWall(next.x, next.y)) {
        available.push(dir);
      }
    }
    if (available.length === 0) {
      const next = this.nextTileInDirection(opposite);
      if (!this.grid.isWall(next.x, next.y)) {
        available.push(opposite);
      }
    }
    return available;
  }

  private chooseDirection(pacmanTile: TileCoord, pacmanDirection: Direction, blinkyTile?: TileCoord): void {
    const target = this.getTargetTile(pacmanTile, pacmanDirection, blinkyTile);
    const available = this.getAvailableDirections();
    if (available.length === 0) return;

    if (this.mode === GhostMode.FRIGHTENED) {
      this.direction = available[Math.floor(Math.random() * available.length)];
      return;
    }

    if (available.includes(this.direction)) {
      return;
    }

    let bestDir = available[0];
    let bestDist = Infinity;
    for (const dir of available) {
      const next = this.nextTileInDirection(dir);
      const dist = Math.sqrt(
        (next.x - target.x) ** 2 + (next.y - target.y) ** 2,
      );
      if (dist < bestDist) {
        bestDist = dist;
        bestDir = dir;
      }
    }
    this.direction = bestDir;
  }

  update(_time: number, delta: number, pacmanTile?: TileCoord, pacmanDirection?: Direction, blinkyTile?: TileCoord): void {
    if (delta <= 0 || !isFinite(delta)) {
      this.graphic.setPosition(this.pixelX, this.pixelY);
      return;
    }
    if (this.direction === Direction.NONE) {
      if (pacmanTile) {
        this.chooseDirection(pacmanTile, pacmanDirection ?? Direction.NONE, blinkyTile);
      }
      if (this.direction === Direction.NONE) {
        this.graphic.setPosition(this.pixelX, this.pixelY);
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
        if (pacmanTile) {
          this.chooseDirection(pacmanTile, pacmanDirection ?? Direction.NONE, blinkyTile);
        }
      }
      const ahead = this.nextTileInDirection(this.direction);
      if (this.grid.isWall(ahead.x, ahead.y)) {
        this.graphic.setPosition(this.pixelX, this.pixelY);
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

    const distToNext = Math.sqrt(
      (this.pixelX - nextCenter.x) ** 2 + (this.pixelY - nextCenter.y) ** 2,
    );

    if (distToNext < SNAP_THRESHOLD || passed) {
      this.pixelX = nextCenter.x;
      this.pixelY = nextCenter.y;
      this.tileX = nextTile.x;
      this.tileY = nextTile.y;
    }

    this.graphic.setPosition(this.pixelX, this.pixelY);
  }

  private getChaseTarget(pacmanTile: TileCoord, pacmanDirection: Direction, blinkyTile?: TileCoord): TileCoord {
    switch (this.ghostType) {
      case GhostType.BLINKY:
        return { ...pacmanTile };
      case GhostType.PINKY: {
        const target = { x: pacmanTile.x, y: pacmanTile.y };
        switch (pacmanDirection) {
          case Direction.UP:
            target.y -= 4;
            target.x -= 4;
            break;
          case Direction.DOWN:
            target.y += 4;
            break;
          case Direction.LEFT:
            target.x -= 4;
            break;
          case Direction.RIGHT:
            target.x += 4;
            break;
        }
        return target;
      }
      case GhostType.INKY: {
        if (!blinkyTile) return { ...pacmanTile };
        const ahead = { x: pacmanTile.x, y: pacmanTile.y };
        switch (pacmanDirection) {
          case Direction.UP:
            ahead.y -= 2;
            break;
          case Direction.DOWN:
            ahead.y += 2;
            break;
          case Direction.LEFT:
            ahead.x -= 2;
            break;
          case Direction.RIGHT:
            ahead.x += 2;
            break;
        }
        return {
          x: ahead.x + (ahead.x - blinkyTile.x),
          y: ahead.y + (ahead.y - blinkyTile.y),
        };
      }
      case GhostType.CLYDE: {
        const dist = Math.sqrt(
          (this.tileX - pacmanTile.x) ** 2 + (this.tileY - pacmanTile.y) ** 2,
        );
        if (dist > 8) {
          return { ...pacmanTile };
        }
        return { ...SCATTER_TARGETS[GhostType.CLYDE] };
      }
    }
  }

  private nextTileInDirection(dir: Direction): TileCoord {
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

  private getOpposite(dir: Direction): Direction {
    switch (dir) {
      case Direction.LEFT:
        return Direction.RIGHT;
      case Direction.RIGHT:
        return Direction.LEFT;
      case Direction.UP:
        return Direction.DOWN;
      case Direction.DOWN:
        return Direction.UP;
      default:
        return Direction.NONE;
    }
  }
}
