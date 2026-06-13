import { TILE, LEVEL_CONFIG } from '../constants/Constants';

export interface TileCoord {
  x: number;
  y: number;
}

export interface PixelCoord {
  x: number;
  y: number;
}

export class Grid {
  private data: number[][];

  constructor(data: number[][]) {
    this.data = data.map(row => [...row]);
  }

  isWall(tileX: number, tileY: number): boolean {
    if (
      tileX < 0 || tileX >= LEVEL_CONFIG.GRID_COLS ||
      tileY < 0 || tileY >= LEVEL_CONFIG.GRID_ROWS
    ) {
      return true;
    }
    return this.data[tileY][tileX] === TILE.WALL;
  }

  tileToPixel(tileX: number, tileY: number): PixelCoord {
    return {
      x: tileX * LEVEL_CONFIG.TILE_SIZE + LEVEL_CONFIG.TILE_SIZE / 2,
      y: tileY * LEVEL_CONFIG.TILE_SIZE + LEVEL_CONFIG.TILE_SIZE / 2,
    };
  }

  getTile(tileX: number, tileY: number): number {
    if (tileX < 0 || tileX >= LEVEL_CONFIG.GRID_COLS || tileY < 0 || tileY >= LEVEL_CONFIG.GRID_ROWS) {
      return -1;
    }
    return this.data[tileY][tileX];
  }

  setTile(tileX: number, tileY: number, value: number): void {
    if (tileX < 0 || tileX >= LEVEL_CONFIG.GRID_COLS || tileY < 0 || tileY >= LEVEL_CONFIG.GRID_ROWS) {
      return;
    }
    this.data[tileY][tileX] = value;
  }

  pixelToTile(pixelX: number, pixelY: number): TileCoord {
    return {
      x: Math.floor(pixelX / LEVEL_CONFIG.TILE_SIZE),
      y: Math.floor(pixelY / LEVEL_CONFIG.TILE_SIZE),
    };
  }
}
