import { describe, it, expect, vi } from 'vitest';
import { TILE, LEVEL_CONFIG, GhostMode, GhostType, SCATTER_TARGETS, GHOST_HOUSE_TARGET, GHOST_COLORS } from '../constants/Constants';
import { mazeData } from '../levels/mazeData';
import { Grid } from '../levels/Grid';
import { Direction } from '../entities/Pacman';

const _ghostPath = ['..', 'entities', 'Ghost'].join('/');
function importGhost(): Promise<any> {
  return import(_ghostPath);
}

function makeSmallGrid(w: number, h: number): number[][] {
  const grid: number[][] = [];
  for (let y = 0; y < h; y++) {
    const row: number[] = [];
    for (let x = 0; x < w; x++) {
      if (y === 0 || y === h - 1 || x === 0 || x === w - 1) {
        row.push(TILE.WALL);
      } else {
        row.push(TILE.EMPTY);
      }
    }
    grid.push(row);
  }
  return grid;
}

function createMockScene(): any {
  return {
    events: { on: vi.fn(), emit: vi.fn() },
    add: {
      circle: vi.fn().mockReturnValue({
        x: 0, y: 0,
        setPosition: vi.fn(),
        setVisible: vi.fn(),
        setDepth: vi.fn(),
        destroy: vi.fn(),
      }),
    },
    input: {
      keyboard: {
        createCursorKeys: vi.fn().mockReturnValue({
          up: { isDown: false },
          down: { isDown: false },
          left: { isDown: false },
          right: { isDown: false },
        }),
      },
    },
  };
}

describe('Ghost', () => {
  describe('GhostMode enum', () => {
    it('defines all five states', async () => {
      const { Ghost } = await importGhost();
      expect(Ghost).toBeDefined();
      expect(GhostMode.SCATTER).toBe('SCATTER');
      expect(GhostMode.CHASE).toBe('CHASE');
      expect(GhostMode.FRIGHTENED).toBe('FRIGHTENED');
      expect(GhostMode.EATEN).toBe('EATEN');
      expect(GhostMode.IN_HOUSE).toBe('IN_HOUSE');
    });
  });

  describe('GhostType enum', () => {
    it('defines all four ghost types', () => {
      expect(GhostType.BLINKY).toBe('BLINKY');
      expect(GhostType.PINKY).toBe('PINKY');
      expect(GhostType.INKY).toBe('INKY');
      expect(GhostType.CLYDE).toBe('CLYDE');
    });
  });

  describe('Scatter targets', () => {
    it('Blinky scatter target is top-right corner', () => {
      expect(SCATTER_TARGETS.BLINKY).toEqual({ x: 27, y: 0 });
    });

    it('Pinky scatter target is top-left corner', () => {
      expect(SCATTER_TARGETS.PINKY).toEqual({ x: 0, y: 0 });
    });

    it('Inky scatter target is bottom-right corner', () => {
      expect(SCATTER_TARGETS.INKY).toEqual({ x: 27, y: 30 });
    });

    it('Clyde scatter target is bottom-left corner', () => {
      expect(SCATTER_TARGETS.CLYDE).toEqual({ x: 0, y: 30 });
    });
  });

  describe('Ghost colors', () => {
    it('defines colors for each ghost type', () => {
      expect(GHOST_COLORS.BLINKY).toBe(0xff0000);
      expect(GHOST_COLORS.PINKY).toBe(0xffb8ff);
      expect(GHOST_COLORS.INKY).toBe(0x00ffff);
      expect(GHOST_COLORS.CLYDE).toBe(0xffb852);
    });
  });

  describe('Ghost construction', () => {
    it('can be constructed with (scene, grid, tileX, tileY, ghostType)', async () => {
      const { Ghost } = await importGhost();
      const grid = new Grid(mazeData);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 14, 14, GhostType.BLINKY);
      expect(ghost).toBeDefined();
    });

    it('initial tileX / tileY match constructor arguments', async () => {
      const { Ghost } = await importGhost();
      const grid = new Grid(mazeData);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 12, 15, GhostType.BLINKY);
      expect(ghost.tileX).toBe(12);
      expect(ghost.tileY).toBe(15);
    });

    it('initial pixelX / pixelY match grid.tileToPixel center', async () => {
      const { Ghost } = await importGhost();
      const grid = new Grid(mazeData);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 3, 5, GhostType.BLINKY);
      const center = grid.tileToPixel(3, 5);
      expect(ghost.pixelX).toBe(center.x);
      expect(ghost.pixelY).toBe(center.y);
    });

    it('initial mode is IN_HOUSE', async () => {
      const { Ghost } = await importGhost();
      const grid = new Grid(mazeData);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 14, 14, GhostType.BLINKY);
      expect(ghost.mode).toBe(GhostMode.IN_HOUSE);
    });

    it('initial direction is NONE', async () => {
      const { Ghost } = await importGhost();
      const grid = new Grid(mazeData);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 14, 14, GhostType.BLINKY);
      expect(ghost.direction).toBe(Direction.NONE);
    });

    it('ghostType matches constructor argument', async () => {
      const { Ghost } = await importGhost();
      const grid = new Grid(mazeData);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 14, 14, GhostType.INKY);
      expect(ghost.ghostType).toBe(GhostType.INKY);
    });
  });

  describe('Mode transitions', () => {
    it('setMode changes the ghost mode', async () => {
      const { Ghost } = await importGhost();
      const grid = new Grid(mazeData);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 14, 14, GhostType.BLINKY);
      ghost.setMode(GhostMode.CHASE);
      expect(ghost.mode).toBe(GhostMode.CHASE);
    });

    it('setMode transitions through all states', async () => {
      const { Ghost } = await importGhost();
      const grid = new Grid(mazeData);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 14, 14, GhostType.BLINKY);

      ghost.setMode(GhostMode.SCATTER);
      expect(ghost.mode).toBe(GhostMode.SCATTER);

      ghost.setMode(GhostMode.CHASE);
      expect(ghost.mode).toBe(GhostMode.CHASE);

      ghost.setMode(GhostMode.FRIGHTENED);
      expect(ghost.mode).toBe(GhostMode.FRIGHTENED);

      ghost.setMode(GhostMode.EATEN);
      expect(ghost.mode).toBe(GhostMode.EATEN);
    });
  });

  describe('Blinky targeting', () => {
    it('Blinky CHASE target equals pacman tile', async () => {
      const { Ghost } = await importGhost();
      const grid = new Grid(mazeData);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 14, 14, GhostType.BLINKY);
      ghost.setMode(GhostMode.CHASE);

      const target = ghost.getTargetTile({ x: 10, y: 15 }, Direction.RIGHT);
      expect(target.x).toBe(10);
      expect(target.y).toBe(15);
    });

    it('Blinky SCATTER target is top-right corner', async () => {
      const { Ghost } = await importGhost();
      const grid = new Grid(mazeData);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 14, 14, GhostType.BLINKY);
      ghost.setMode(GhostMode.SCATTER);

      const target = ghost.getTargetTile({ x: 10, y: 15 }, Direction.RIGHT);
      expect(target.x).toBe(27);
      expect(target.y).toBe(0);
    });
  });

  describe('Pinky targeting', () => {
    it('Pinky CHASE target is 4 tiles ahead of pacman (RIGHT)', async () => {
      const { Ghost } = await importGhost();
      const grid = new Grid(mazeData);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 14, 14, GhostType.PINKY);
      ghost.setMode(GhostMode.CHASE);

      const target = ghost.getTargetTile({ x: 10, y: 15 }, Direction.RIGHT);
      expect(target.x).toBe(14);
      expect(target.y).toBe(15);
    });

    it('Pinky CHASE target is 4 tiles ahead of pacman (UP) — original bug: also offsets x by -4', async () => {
      const { Ghost } = await importGhost();
      const grid = new Grid(mazeData);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 14, 14, GhostType.PINKY);
      ghost.setMode(GhostMode.CHASE);

      const target = ghost.getTargetTile({ x: 10, y: 15 }, Direction.UP);
      expect(target.x).toBe(6);
      expect(target.y).toBe(11);
    });

    it('Pinky CHASE target is 4 tiles ahead of pacman (LEFT)', async () => {
      const { Ghost } = await importGhost();
      const grid = new Grid(mazeData);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 14, 14, GhostType.PINKY);
      ghost.setMode(GhostMode.CHASE);

      const target = ghost.getTargetTile({ x: 10, y: 15 }, Direction.LEFT);
      expect(target.x).toBe(6);
      expect(target.y).toBe(15);
    });

    it('Pinky SCATTER target is top-left corner', async () => {
      const { Ghost } = await importGhost();
      const grid = new Grid(mazeData);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 14, 14, GhostType.PINKY);
      ghost.setMode(GhostMode.SCATTER);

      const target = ghost.getTargetTile({ x: 10, y: 15 }, Direction.RIGHT);
      expect(target.x).toBe(0);
      expect(target.y).toBe(0);
    });
  });

  describe('Inky targeting', () => {
    it('Inky CHASE target uses blinky position', async () => {
      const { Ghost } = await importGhost();
      const grid = new Grid(mazeData);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 14, 14, GhostType.INKY);
      ghost.setMode(GhostMode.CHASE);

      // 2 tiles ahead of pacman at (10,15) moving RIGHT = (12,15)
      // Vector from blinky (5,10) to (12,15) = (7,5), doubled = (14,10)
      // Target = (12+7, 15+5) = (19, 20)
      const target = ghost.getTargetTile({ x: 10, y: 15 }, Direction.RIGHT, { x: 5, y: 10 });
      expect(target.x).toBe(19);
      expect(target.y).toBe(20);
    });

    it('Inky SCATTER target is bottom-right corner', async () => {
      const { Ghost } = await importGhost();
      const grid = new Grid(mazeData);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 14, 14, GhostType.INKY);
      ghost.setMode(GhostMode.SCATTER);

      const target = ghost.getTargetTile({ x: 10, y: 15 }, Direction.RIGHT);
      expect(target.x).toBe(27);
      expect(target.y).toBe(30);
    });
  });

  describe('Clyde targeting', () => {
    it('Clyde CHASE target is pacman tile when far away', async () => {
      const { Ghost } = await importGhost();
      const grid = new Grid(mazeData);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 3, 3, GhostType.CLYDE);
      ghost.setMode(GhostMode.CHASE);

      const target = ghost.getTargetTile({ x: 20, y: 25 }, Direction.LEFT);
      expect(target.x).toBe(20);
      expect(target.y).toBe(25);
    });

    it('Clyde CHASE target is scatter corner when close to pacman', async () => {
      const { Ghost } = await importGhost();
      const grid = new Grid(mazeData);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 10, 10, GhostType.CLYDE);
      ghost.setMode(GhostMode.CHASE);

      // Distance to pacman at (12,12) is ~2.8, less than 8
      const target = ghost.getTargetTile({ x: 12, y: 12 }, Direction.LEFT);
      expect(target.x).toBe(0);
      expect(target.y).toBe(30);
    });

    it('Clyde SCATTER target is bottom-left corner', async () => {
      const { Ghost } = await importGhost();
      const grid = new Grid(mazeData);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 14, 14, GhostType.CLYDE);
      ghost.setMode(GhostMode.SCATTER);

      const target = ghost.getTargetTile({ x: 10, y: 15 }, Direction.RIGHT);
      expect(target.x).toBe(0);
      expect(target.y).toBe(30);
    });
  });

  describe('Wall-hit behavior', () => {
    it('ghost does not get stuck oscillating after hitting a wall (provides pacmanTile)', async () => {
      const { Ghost } = await importGhost();
      // 10x4 grid: 2 rows of open tiles, walls on border
      const data = makeSmallGrid(10, 4);
      const grid = new Grid(data);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 8, 1, GhostType.BLINKY);

      ghost.direction = Direction.RIGHT;
      const pacmanTile = { x: 1, y: 1 };
      const pacmanDir = Direction.RIGHT;

      // Run many frames — ghost should reach (8,1) wall, turn, and move away
      for (let i = 0; i < 200; i++) ghost.update(0, 16, pacmanTile, pacmanDir);

      // Ghost should NOT be stuck oscillating between (8,1) and (8,2).
      // After escaping the dead end, tileY should be different from 1 or 2,
      // OR tileX should be less than 8 (moved left).
      const stuckOscillating = ghost.tileX === 8 && (ghost.tileY === 1 || ghost.tileY === 2);
      expect(stuckOscillating).toBe(false);
    });

    it('ghost prefers continuing straight at intersections', async () => {
      const { Ghost } = await importGhost();
      // 5x5 grid: ghost in straight corridor, should continue same direction
      const data = makeSmallGrid(5, 5);
      const grid = new Grid(data);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 2, 2, GhostType.BLINKY);

      ghost.direction = Direction.RIGHT;
      ghost.setMode(GhostMode.SCATTER);
      const pacmanTile = { x: 3, y: 1 };
      const pacmanDir = Direction.RIGHT;

      ghost.update(0, 16, pacmanTile, pacmanDir);
      // At center of (2,2), current direction RIGHT is available
      // With the "prefer current direction" fix, direction should stay RIGHT
      expect(ghost.direction).toBe(Direction.RIGHT);
    });
  });

  describe('Basic movement', () => {
    it('setting direction and updating moves ghost in that direction', async () => {
      const { Ghost } = await importGhost();
      const data = makeSmallGrid(4, 4);
      const grid = new Grid(data);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 1, 1, GhostType.BLINKY);

      ghost.direction = Direction.RIGHT;
      ghost.update(0, 16);

      expect(ghost.pixelX).toBeGreaterThan(grid.tileToPixel(1, 1).x);
    });

    it('ghost advances multiple tiles in a straight corridor', async () => {
      const { Ghost } = await importGhost();
      const data = makeSmallGrid(10, 4);
      const grid = new Grid(data);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 1, 1, GhostType.BLINKY);

      ghost.direction = Direction.RIGHT;
      for (let i = 0; i < 60; i++) ghost.update(0, 16);

      expect(ghost.tileX).toBeGreaterThan(3);
    });

    it('ghost moves left across tiles', async () => {
      const { Ghost } = await importGhost();
      const data = makeSmallGrid(10, 4);
      const grid = new Grid(data);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 8, 1, GhostType.BLINKY);

      ghost.direction = Direction.LEFT;
      for (let i = 0; i < 60; i++) ghost.update(0, 16);

      expect(ghost.tileX).toBeLessThan(5);
    });

    it('ghost with direction NONE stays in place', async () => {
      const { Ghost } = await importGhost();
      const data = makeSmallGrid(4, 4);
      const grid = new Grid(data);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 2, 2, GhostType.BLINKY);

      const px = ghost.pixelX;
      const py = ghost.pixelY;
      ghost.update(0, 16);

      expect(ghost.pixelX).toBe(px);
      expect(ghost.pixelY).toBe(py);
    });
  });

  describe('Available directions', () => {
    it('getAvailableDirections returns open paths excluding reverse', async () => {
      const { Ghost } = await importGhost();
      // 5x5 grid, center at (2,2). Moving RIGHT, cannot reverse to LEFT
      const data = makeSmallGrid(5, 5);
      const grid = new Grid(data);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 2, 2, GhostType.BLINKY);

      ghost.direction = Direction.RIGHT;
      const dirs = ghost.getAvailableDirections();

      expect(dirs).toContain(Direction.UP);
      expect(dirs).toContain(Direction.DOWN);
      expect(dirs).toContain(Direction.RIGHT);
      expect(dirs).not.toContain(Direction.LEFT);
    });

    it('getAvailableDirections allows reverse in dead end', async () => {
      const { Ghost } = await importGhost();
      // Corridor: only tiles (1,1) and (2,1) are open, (3,1) is wall
      const data = [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 1, 1],
        [1, 1, 1, 1, 1],
      ];
      const grid = new Grid(data);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 1, 1, GhostType.BLINKY);

      ghost.direction = Direction.RIGHT;
      // At tile (1,1), RIGHT leads to (2,1) which is open
      let dirs = ghost.getAvailableDirections();
      expect(dirs).toContain(Direction.RIGHT);

      // Move to tile (2,1) — RIGHT would lead to wall at (3,1)
      ghost.tileX = 2;
      dirs = ghost.getAvailableDirections();
      expect(dirs).toContain(Direction.LEFT);
    });
  });

  describe('Frightened mode', () => {
    it('entering FRIGHTENED reverses direction', async () => {
      const { Ghost } = await importGhost();
      const data = makeSmallGrid(10, 4);
      const grid = new Grid(data);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 5, 1, GhostType.BLINKY);

      ghost.direction = Direction.RIGHT;
      ghost.setMode(GhostMode.FRIGHTENED);

      expect(ghost.direction).toBe(Direction.LEFT);
    });

    it('exiting FRIGHTENED reverses direction', async () => {
      const { Ghost } = await importGhost();
      const data = makeSmallGrid(10, 4);
      const grid = new Grid(data);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 5, 1, GhostType.BLINKY);

      ghost.direction = Direction.RIGHT;
      ghost.setMode(GhostMode.FRIGHTENED);
      expect(ghost.direction).toBe(Direction.LEFT);

      ghost.setMode(GhostMode.CHASE);
      expect(ghost.direction).toBe(Direction.RIGHT);
    });

    it('SCATTER to CHASE does not reverse direction', async () => {
      const { Ghost } = await importGhost();
      const data = makeSmallGrid(10, 4);
      const grid = new Grid(data);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 5, 1, GhostType.BLINKY);

      ghost.direction = Direction.RIGHT;
      ghost.setMode(GhostMode.SCATTER);
      expect(ghost.direction).toBe(Direction.RIGHT);

      ghost.setMode(GhostMode.CHASE);
      expect(ghost.direction).toBe(Direction.RIGHT);
    });
  });

  describe('EATEN mode', () => {
    it('EATEN target is ghost house', async () => {
      const { Ghost } = await importGhost();
      const grid = new Grid(mazeData);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 14, 14, GhostType.BLINKY);
      ghost.setMode(GhostMode.EATEN);

      const target = ghost.getTargetTile({ x: 10, y: 15 }, Direction.RIGHT);
      expect(target.x).toBe(GHOST_HOUSE_TARGET.x);
      expect(target.y).toBe(GHOST_HOUSE_TARGET.y);
    });
  });

  describe('Ghost house target constant', () => {
    it('GHOST_HOUSE_TARGET is at center of maze', () => {
      expect(GHOST_HOUSE_TARGET).toEqual({ x: 14, y: 14 });
    });
  });

  describe('Ghost speed', () => {
    it('ghost speed matches LEVEL_CONFIG.GHOST_SPEED', async () => {
      const { Ghost } = await importGhost();
      const grid = new Grid(mazeData);
      const scene = createMockScene();
      const ghost = new Ghost(scene, grid, 14, 14, GhostType.BLINKY);
      expect(ghost.speed).toBe(LEVEL_CONFIG.GHOST_SPEED);
    });
  });

  describe('GameScene ghost integration', () => {
    it('GameScene creates 4 ghosts on create()', async () => {
      const { GameScene } = await import('../scenes/GameScene');
      const scene = new GameScene();
      scene.create();
      expect(scene.ghosts).toBeDefined();
      expect(scene.ghosts.length).toBe(4);
    });

    it('Ghosts are set to SCATTER mode after GameScene.create()', async () => {
      const { GameScene } = await import('../scenes/GameScene');
      const scene = new GameScene();
      scene.create();
      for (const ghost of scene.ghosts) {
        expect(ghost.mode).toBe(GhostMode.SCATTER);
      }
    });

    it('Ghosts have LEFT direction after GameScene.create()', async () => {
      const { GameScene } = await import('../scenes/GameScene');
      const scene = new GameScene();
      scene.create();
      for (const ghost of scene.ghosts) {
        expect(ghost.direction).toBe(Direction.LEFT);
      }
    });
  });
});
