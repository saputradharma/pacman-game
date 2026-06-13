import { describe, it, expect } from 'vitest';
import { LEVEL_CONFIG, TILE } from '../constants/Constants';

describe('Constants', () => {
  describe('TILE enum', () => {
    it('should define tile type constants with correct values', () => {
      expect(TILE.EMPTY).toBe(0);
      expect(TILE.WALL).toBe(1);
      expect(TILE.PELLET).toBe(2);
      expect(TILE.POWER_PELLET).toBe(3);
      expect(TILE.GHOST_HOUSE).toBe(4);
      expect(TILE.GHOST_DOOR).toBe(5);
    });
  });

  describe('LEVEL_CONFIG', () => {
    it('should define tile size', () => {
      expect(LEVEL_CONFIG.TILE_SIZE).toBeTypeOf('number');
      expect(LEVEL_CONFIG.TILE_SIZE).toBeGreaterThan(0);
    });

    it('should define grid dimensions', () => {
      expect(LEVEL_CONFIG.GRID_COLS).toBeTypeOf('number');
      expect(LEVEL_CONFIG.GRID_ROWS).toBeTypeOf('number');
      expect(LEVEL_CONFIG.GRID_COLS).toBeGreaterThan(0);
      expect(LEVEL_CONFIG.GRID_ROWS).toBeGreaterThan(0);
    });

    it('should define player speed', () => {
      expect(LEVEL_CONFIG.PLAYER_SPEED).toBeTypeOf('number');
      expect(LEVEL_CONFIG.PLAYER_SPEED).toBeGreaterThan(0);
    });

    it('should define ghost speed', () => {
      expect(LEVEL_CONFIG.GHOST_SPEED).toBeTypeOf('number');
      expect(LEVEL_CONFIG.GHOST_SPEED).toBeGreaterThan(0);
    });

    it('should define pellet score value', () => {
      expect(LEVEL_CONFIG.PELLET_SCORE).toBeTypeOf('number');
      expect(LEVEL_CONFIG.PELLET_SCORE).toBeGreaterThan(0);
    });

    it('should define power pellet score value', () => {
      expect(LEVEL_CONFIG.POWER_PELLET_SCORE).toBeTypeOf('number');
      expect(LEVEL_CONFIG.POWER_PELLET_SCORE).toBeGreaterThan(0);
    });

    it('should define ghost frightened duration', () => {
      expect(LEVEL_CONFIG.GHOST_FRIGHTENED_DURATION).toBeTypeOf('number');
      expect(LEVEL_CONFIG.GHOST_FRIGHTENED_DURATION).toBeGreaterThan(0);
    });

    it('should define player lives', () => {
      expect(LEVEL_CONFIG.PLAYER_LIVES).toBeTypeOf('number');
      expect(LEVEL_CONFIG.PLAYER_LIVES).toBeGreaterThan(0);
    });
  });
});
