import { describe, it, expect } from 'vitest';
import { TILE, LEVEL_CONFIG } from '../constants/Constants';
import { mazeData } from '../levels/mazeData';
import { Grid } from '../levels/Grid';

describe('Grid', () => {
  describe('Maze data', () => {
    it('should be a 2D array with dimensions 31x28', () => {
      expect(Array.isArray(mazeData)).toBe(true);
      expect(mazeData.length).toBe(LEVEL_CONFIG.GRID_ROWS);
      mazeData.forEach(row => {
        expect(Array.isArray(row)).toBe(true);
        expect(row.length).toBe(LEVEL_CONFIG.GRID_COLS);
      });
    });

    it('should contain only valid tile values (0-5)', () => {
      const valid = new Set([0, 1, 2, 3, 4, 5]);
      mazeData.forEach(row => {
        row.forEach(tile => {
          expect(valid.has(tile)).toBe(true);
        });
      });
    });

    it('should have walls on the border', () => {
      const cols = LEVEL_CONFIG.GRID_COLS;
      const rows = LEVEL_CONFIG.GRID_ROWS;
      for (let x = 0; x < cols; x++) {
        expect(mazeData[0][x]).toBe(TILE.WALL);
        expect(mazeData[rows - 1][x]).toBe(TILE.WALL);
      }
      for (let y = 0; y < rows; y++) {
        expect(mazeData[y][0]).toBe(TILE.WALL);
        expect(mazeData[y][cols - 1]).toBe(TILE.WALL);
      }
    });
  });

  describe('Utility', () => {
    const grid = new Grid(mazeData);

    it('should convert tile coords to pixel coords (center)', () => {
      const px = grid.tileToPixel(1, 1);
      expect(px.x).toBe(24);
      expect(px.y).toBe(24);
    });

    it('should return pixel center of a tile', () => {
      const px = grid.tileToPixel(0, 0);
      expect(px.x).toBe(8);
      expect(px.y).toBe(8);
    });

    it('should convert pixel coords to tile coords (floor)', () => {
      const tile = grid.pixelToTile(25, 41);
      expect(tile.x).toBe(1);
      expect(tile.y).toBe(2);
    });

    it('should detect wall tiles', () => {
      expect(grid.isWall(0, 0)).toBe(true);
    });

    it('should return false for non-wall tiles', () => {
      const interiorTile = grid.isWall(1, 1);
      expect(interiorTile).toBe(false);
    });

    it('should treat out-of-bounds coords as walls', () => {
      expect(grid.isWall(-1, 0)).toBe(true);
      expect(grid.isWall(0, -1)).toBe(true);
      expect(grid.isWall(28, 0)).toBe(true);
      expect(grid.isWall(0, 31)).toBe(true);
    });

    it('should detect ghost house tiles as non-walls', () => {
      const ghostHouse = grid.isWall(12, 14);
      expect(ghostHouse).toBe(false);
    });
  });

  describe('getTile / setTile', () => {
    it('getTile returns correct value for a known wall tile', () => {
      const grid = new Grid(mazeData);
      expect(grid.getTile(0, 0)).toBe(TILE.WALL);
    });

    it('getTile returns correct value for a known pellet tile', () => {
      const grid = new Grid(mazeData);
      expect(grid.getTile(1, 1)).toBe(TILE.PELLET);
    });

    it('setTile modifies internal data', () => {
      const grid = new Grid(mazeData);
      grid.setTile(1, 1, TILE.EMPTY);
      expect(grid.getTile(1, 1)).toBe(TILE.EMPTY);
    });

    it('setTile to EMPTY then getTile returns EMPTY', () => {
      const grid = new Grid(mazeData);
      grid.setTile(1, 1, TILE.EMPTY);
      expect(grid.getTile(1, 1)).toBe(TILE.EMPTY);
    });

    it('out-of-bounds getTile returns -1', () => {
      const grid = new Grid(mazeData);
      expect(grid.getTile(-1, 0)).toBe(-1);
      expect(grid.getTile(0, -1)).toBe(-1);
      expect(grid.getTile(LEVEL_CONFIG.GRID_COLS, 0)).toBe(-1);
      expect(grid.getTile(0, LEVEL_CONFIG.GRID_ROWS)).toBe(-1);
    });

    it('out-of-bounds setTile does nothing', () => {
      const grid = new Grid(mazeData);
      grid.setTile(-1, 0, TILE.EMPTY);
      grid.setTile(0, -1, TILE.EMPTY);
      grid.setTile(LEVEL_CONFIG.GRID_COLS, 0, TILE.EMPTY);
      grid.setTile(0, LEVEL_CONFIG.GRID_ROWS, TILE.EMPTY);
      expect(grid.getTile(1, 1)).toBe(TILE.PELLET);
    });

    it('Grid constructor clones mazeData (mutating source does not affect Grid)', () => {
      const source = [
        [1, 2],
        [3, 4],
      ];
      const grid = new Grid(source);
      source[0][0] = 99;
      expect(grid.getTile(0, 0)).toBe(1);
    });
  });

  describe('Maze rendering integration', () => {
    it('should expose grid instance on GameScene', async () => {
      const { GameScene } = await import('../scenes/GameScene');
      const scene = new GameScene();
      scene.create();
      expect(scene.grid).toBeDefined();
      expect(scene.grid instanceof Grid).toBe(true);
    });
  });
});
