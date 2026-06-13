import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  TILE, LEVEL_CONFIG, GhostMode,
} from '../constants/Constants';
import { mazeData } from '../levels/mazeData';

describe('Game Mechanics', () => {
  let GameScene: any;

  beforeEach(async () => {
    const gs = await import('../scenes/GameScene');
    GameScene = gs.GameScene;
  });

  function createScene(): any {
    const scene = new GameScene();
    scene.events.on = vi.fn();
    scene.events.emit = vi.fn();
    scene.create();
    return scene;
  }

  function tileCenter(tileX: number, tileY: number): { x: number; y: number } {
    return {
      x: tileX * LEVEL_CONFIG.TILE_SIZE + LEVEL_CONFIG.TILE_SIZE / 2,
      y: tileY * LEVEL_CONFIG.TILE_SIZE + LEVEL_CONFIG.TILE_SIZE / 2,
    };
  }

  function isNonWall(tileX: number, tileY: number): boolean {
    if (tileX < 0 || tileX >= LEVEL_CONFIG.GRID_COLS || tileY < 0 || tileY >= LEVEL_CONFIG.GRID_ROWS) {
      return false;
    }
    return mazeData[tileY][tileX] !== TILE.WALL && mazeData[tileY][tileX] !== TILE.GHOST_HOUSE;
  }

  describe('Power Pellet triggers FRIGHTENED', () => {
    it('POWER_PELLET_EATEN event sets all SCATTER/CHASE ghosts to FRIGHTENED', async () => {
      const scene = createScene();
      // Verify ghosts start in non-FRIGHTENED state
      for (const ghost of scene.ghosts) {
        expect(ghost.mode).not.toBe(GhostMode.FRIGHTENED);
      }

      // Simulate power pellet eaten
      scene.handlePowerPelletEaten(5, 5);

      // All ghosts should now be FRIGHTENED
      for (const ghost of scene.ghosts) {
        expect(ghost.mode).toBe(GhostMode.FRIGHTENED);
      }
    });

    it('POWER_PELLET_EATEN does not affect ghosts in EATEN mode', async () => {
      const scene = createScene();
      scene.ghosts[0].setMode(GhostMode.EATEN);

      scene.handlePowerPelletEaten(5, 5);

      expect(scene.ghosts[0].mode).toBe(GhostMode.EATEN);
      for (let i = 1; i < scene.ghosts.length; i++) {
        expect(scene.ghosts[i].mode).toBe(GhostMode.FRIGHTENED);
      }
    });

    it('frightened timer counts down and ghosts revert after expiry', async () => {
      const scene = createScene();
      scene.handlePowerPelletEaten(5, 5);

      expect(scene.frightenedTimer).toBeGreaterThan(0);

      // Simulate expiry — set timer low so delta consumes it
      scene.frightenedTimer = 10;
      scene.update(0, 20);

      expect(scene.frightenedTimer).toBe(0);
      for (const ghost of scene.ghosts) {
        if (ghost.mode !== GhostMode.EATEN) {
          expect(ghost.mode).toBe(GhostMode.SCATTER);
        }
      }
    });
  });

  describe('Scoring', () => {
    it('score starts at 0', async () => {
      const scene = createScene();
      expect(scene.score).toBe(0);
    });

    it('pellet eaten increases score by PELLET_SCORE', async () => {
      const scene = createScene();
      scene.handlePelletEaten(1, 1);
      expect(scene.score).toBe(LEVEL_CONFIG.PELLET_SCORE);
    });

    it('power pellet eaten increases score by POWER_PELLET_SCORE', async () => {
      const scene = createScene();
      scene.handlePowerPelletEaten(1, 1);
      expect(scene.score).toBe(LEVEL_CONFIG.POWER_PELLET_SCORE);
    });

    it('ghost eaten increases score by 200', async () => {
      const scene = createScene();
      scene.handleGhostEaten(1, 1);
      expect(scene.score).toBe(200);
    });

    it('multiple score events accumulate', async () => {
      const scene = createScene();
      scene.handlePelletEaten(1, 1);
      scene.handlePelletEaten(2, 2);
      scene.handlePowerPelletEaten(3, 3);
      scene.handleGhostEaten(4, 4);
      const expected = LEVEL_CONFIG.PELLET_SCORE * 2 + LEVEL_CONFIG.POWER_PELLET_SCORE + 200;
      expect(scene.score).toBe(expected);
    });
  });

  describe('Pacman vs Ghost collision', () => {
    function setPosition(entity: any, tileX: number, tileY: number): void {
      const center = tileCenter(tileX, tileY);
      entity.tileX = tileX;
      entity.tileY = tileY;
      entity.pixelX = center.x;
      entity.pixelY = center.y;
      entity._wasAtCenter = true;
    }

    it('Pacman collides with FRIGHTENED ghost → ghost eaten', async () => {
      const scene = createScene();
      const tileX = 10;
      const tileY = 10;
      if (!isNonWall(tileX, tileY)) return; // skip if wall

      setPosition(scene.pacman, tileX, tileY);
      const ghost = scene.ghosts[0];
      setPosition(ghost, tileX, tileY);
      ghost.setMode(GhostMode.FRIGHTENED);

      // Clear event emit spy and set ghosts spy
      const scoreBefore = scene.score;
      scene.update(0, 0);

      expect(ghost.mode).toBe(GhostMode.EATEN);
      expect(scene.score).toBe(scoreBefore + 200);
    });

    it('Pacman collides with non-frightened ghost → lose a life', async () => {
      const scene = createScene();
      const tileX = 10;
      const tileY = 10;
      if (!isNonWall(tileX, tileY)) return;

      setPosition(scene.pacman, tileX, tileY);
      const ghost = scene.ghosts[0];
      setPosition(ghost, tileX, tileY);
      ghost.setMode(GhostMode.SCATTER);

      const livesBefore = scene.lives;
      scene.update(0, 0);

      expect(scene.lives).toBe(livesBefore - 1);
    });

    it('Pacman collides with EATEN ghost → no effect', async () => {
      const scene = createScene();
      const tileX = 10;
      const tileY = 10;
      if (!isNonWall(tileX, tileY)) return;

      setPosition(scene.pacman, tileX, tileY);
      const ghost = scene.ghosts[0];
      setPosition(ghost, tileX, tileY);
      ghost.setMode(GhostMode.EATEN);

      const livesBefore = scene.lives;
      const scoreBefore = scene.score;
      scene.update(0, 0);

      expect(scene.lives).toBe(livesBefore);
      expect(scene.score).toBe(scoreBefore);
      expect(ghost.mode).toBe(GhostMode.EATEN);
    });

    it('losing all lives transitions to GameOverScene', async () => {
      const scene = createScene();
      const tileX = 10;
      const tileY = 10;
      if (!isNonWall(tileX, tileY)) return;

      // Set to 1 life
      scene.lives = 1;

      setPosition(scene.pacman, tileX, tileY);
      const ghost = scene.ghosts[0];
      setPosition(ghost, tileX, tileY);
      ghost.setMode(GhostMode.SCATTER);

      // Clear previous calls
      scene.scene.start = vi.fn();

      scene.update(0, 0);

      expect(scene.lives).toBe(0);
      expect(scene.scene.start).toHaveBeenCalledWith('GameOverScene', { score: 0 });
    });
  });

  describe('Life management', () => {
    it('lives starts at PLAYER_LIVES (3)', async () => {
      const scene = createScene();
      expect(scene.lives).toBe(LEVEL_CONFIG.PLAYER_LIVES);
    });

    it('after non-fatal death, pacman and ghost positions reset', async () => {
      const scene = createScene();
      const origPacmanTileX = scene.pacman.tileX;
      const origPacmanTileY = scene.pacman.tileY;

      // Move pacman elsewhere
      scene.pacman.tileX = 20;
      scene.pacman.tileY = 20;

      // Kill pacman (non-fatal — lives > 1)
      scene.lives = 2;
      (scene as any).handlePacmanDeath();

      // Pacman should be reset to start position
      expect(scene.pacman.tileX).toBe(origPacmanTileX);
      expect(scene.pacman.tileY).toBe(origPacmanTileY);
      expect(scene.lives).toBe(1);
    });
  });
});
