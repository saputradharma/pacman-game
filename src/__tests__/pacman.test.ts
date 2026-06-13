import { describe, it, expect, vi } from 'vitest';
import { TILE } from '../constants/Constants';
import { mazeData } from '../levels/mazeData';
import { Grid } from '../levels/Grid';

const _pacmanPath = ['..', 'entities', 'Pacman'].join('/');
function importPacman(): Promise<any> {
  return import(_pacmanPath);
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

describe('Pacman', () => {
  describe('Direction enum', () => {
    it('is defined with NONE, LEFT, RIGHT, UP, DOWN', async () => {
      const { Direction } = await importPacman();
      expect(Direction.NONE).toBeDefined();
      expect(Direction.LEFT).toBeDefined();
      expect(Direction.RIGHT).toBeDefined();
      expect(Direction.UP).toBeDefined();
      expect(Direction.DOWN).toBeDefined();
    });
  });

  describe('Construction', () => {
    it('can be constructed with (scene, grid, tileX, tileY)', async () => {
      const { Pacman } = await importPacman();
      const grid = new Grid(mazeData);
      const scene = createMockScene();
      const pacman = new Pacman(scene, grid, 14, 23);
      expect(pacman).toBeDefined();
    });

    it('initial tileX / tileY match constructor arguments', async () => {
      const { Pacman } = await importPacman();
      const grid = new Grid(mazeData);
      const scene = createMockScene();
      const pacman = new Pacman(scene, grid, 14, 23);
      expect(pacman.tileX).toBe(14);
      expect(pacman.tileY).toBe(23);
    });

    it('initial pixelX / pixelY match grid.tileToPixel(tileX, tileY) center', async () => {
      const { Pacman } = await importPacman();
      const grid = new Grid(mazeData);
      const scene = createMockScene();
      const pacman = new Pacman(scene, grid, 3, 5);
      const center = grid.tileToPixel(3, 5);
      expect(pacman.pixelX).toBe(center.x);
      expect(pacman.pixelY).toBe(center.y);
    });

    it('initial direction is Direction.NONE', async () => {
      const { Pacman, Direction } = await importPacman();
      const grid = new Grid(mazeData);
      const scene = createMockScene();
      const pacman = new Pacman(scene, grid, 14, 23);
      expect(pacman.direction).toBe(Direction.NONE);
    });

    it('initial nextDirection is Direction.NONE', async () => {
      const { Pacman, Direction } = await importPacman();
      const grid = new Grid(mazeData);
      const scene = createMockScene();
      const pacman = new Pacman(scene, grid, 14, 23);
      expect(pacman.nextDirection).toBe(Direction.NONE);
    });
  });

  describe('Movement', () => {
    it('setNextDirection(RIGHT) then update(0, 16) increases pixelX', async () => {
      const { Pacman, Direction } = await importPacman();
      const data = makeSmallGrid(4, 4);
      const grid = new Grid(data);
      const scene = createMockScene();
      const pacman = new Pacman(scene, grid, 1, 1);
      const initialX = pacman.pixelX;

      pacman.setNextDirection(Direction.RIGHT);
      pacman.update(0, 16);

      expect(pacman.pixelX).toBeGreaterThan(initialX);
    });

    it('setNextDirection(DOWN) then update(0, 16) increases pixelY', async () => {
      const { Pacman, Direction } = await importPacman();
      const data = makeSmallGrid(4, 4);
      const grid = new Grid(data);
      const scene = createMockScene();
      const pacman = new Pacman(scene, grid, 1, 1);
      const initialY = pacman.pixelY;

      pacman.setNextDirection(Direction.DOWN);
      pacman.update(0, 16);

      expect(pacman.pixelY).toBeGreaterThan(initialY);
    });

    it('facing LEFT from (1,1) — wall at (0,1) — position unchanged', async () => {
      const { Pacman, Direction } = await importPacman();
      const data = makeSmallGrid(4, 4);
      const grid = new Grid(data);
      const scene = createMockScene();
      const pacman = new Pacman(scene, grid, 1, 1);
      const initialX = pacman.pixelX;
      const initialY = pacman.pixelY;

      (pacman as any).direction = Direction.LEFT;
      pacman.update(0, 16);

      expect(pacman.pixelX).toBe(initialX);
      expect(pacman.pixelY).toBe(initialY);
    });

    it('reverse direction: set direction RIGHT, setNextDirection(LEFT), update → direction becomes LEFT immediately', async () => {
      const { Pacman, Direction } = await importPacman();
      const data = makeSmallGrid(4, 4);
      const grid = new Grid(data);
      const scene = createMockScene();
      const pacman = new Pacman(scene, grid, 1, 1);

      (pacman as any).direction = Direction.RIGHT;
      pacman.setNextDirection(Direction.LEFT);
      pacman.update(0, 16);

      expect(pacman.direction).toBe(Direction.LEFT);
    });

    it('moves right continuously across multiple tiles on real maze', async () => {
      const { Pacman, Direction } = await importPacman();
      const p = new Pacman(createMockScene(), new Grid(mazeData), 14, 20);
      p.setNextDirection(Direction.RIGHT);
      for (let i = 0; i < 60; i++) p.update(0, 16);
      expect(p.tileX).toBeGreaterThan(18);
    });

    it('moves left continuously across multiple tiles on real maze', async () => {
      const { Pacman, Direction } = await importPacman();
      const p = new Pacman(createMockScene(), new Grid(mazeData), 14, 20);
      p.setNextDirection(Direction.LEFT);
      for (let i = 0; i < 60; i++) p.update(0, 16);
      expect(p.tileX).toBeLessThan(11);
    });

    it('moves down across multiple tiles', async () => {
      const { Pacman, Direction } = await importPacman();
      const data = [[1,1,1,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,1,1,1]];
      const p = new Pacman(createMockScene(), new Grid(data), 1, 1);
      p.setNextDirection(Direction.DOWN);
      for (let i = 0; i < 60; i++) p.update(0, 16);
      expect(p.tileY).toBeGreaterThan(1);
    });

    it('moves up across multiple tiles', async () => {
      const { Pacman, Direction } = await importPacman();
      const data = [[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1]];
      const p = new Pacman(createMockScene(), new Grid(data), 2, 2);
      p.setNextDirection(Direction.UP);
      for (let i = 0; i < 60; i++) p.update(0, 16);
      expect(p.tileY).toBeLessThan(2);
    });

    it('advances tiles even with large step (low fps)', async () => {
      const { Pacman, Direction } = await importPacman();
      const data = makeSmallGrid(20, 20);
      const p = new Pacman(createMockScene(), new Grid(data), 1, 1);
      p.setNextDirection(Direction.RIGHT);
      for (let i = 0; i < 60; i++) p.update(0, 40);
      expect(p.tileX).toBeGreaterThan(5);
    });
  });

  describe('Buffered turn', () => {
    it('advances tiles after a buffered turn (RIGHT then DOWN)', async () => {
      const { Pacman, Direction } = await importPacman();
      const data = makeSmallGrid(20, 20);
      const grid = new Grid(data);
      const p = new Pacman(createMockScene(), grid, 1, 1);

      p.setNextDirection(Direction.RIGHT);

      let safety = 1000;
      while (p.tileX < 2 && safety > 0) { p.update(0, 16); safety--; }
      expect(p.tileX).toBe(2);
      expect(p.tileY).toBe(1);

      p.setNextDirection(Direction.DOWN);

      const startTileY = p.tileY;
      safety = 1000;
      let framesAfterTurn = 0;
      while (p.tileY < 3 && safety > 0) {
        p.update(0, 16);
        safety--;
        framesAfterTurn++;
        expect(p.tileY).toBeGreaterThanOrEqual(startTileY);
        if (p.tileY === startTileY) {
          expect(p.tileX).toBeGreaterThanOrEqual(2);
        }
      }
      expect(p.tileY).toBeGreaterThanOrEqual(3);
      expect(framesAfterTurn).toBeLessThan(500);
    });
  });

  describe('Pellet consumption', () => {
    it('Pacman at tile with PELLET, update(0, 1000), tile becomes EMPTY', async () => {
      const { Pacman } = await importPacman();
      const data = makeSmallGrid(4, 4);
      data[1][1] = TILE.PELLET;
      const grid = new Grid(data);
      const scene = createMockScene();
      const pacman = new Pacman(scene, grid, 1, 1);

      expect(grid.getTile(1, 1)).toBe(TILE.PELLET);
      pacman.update(0, 1000);
      expect(grid.getTile(1, 1)).toBe(TILE.EMPTY);
    });

    it('Pacman at tile with POWER_PELLET, update(0, 1000), tile becomes EMPTY', async () => {
      const { Pacman } = await importPacman();
      const data = makeSmallGrid(4, 4);
      data[1][1] = TILE.POWER_PELLET;
      const grid = new Grid(data);
      const scene = createMockScene();
      const pacman = new Pacman(scene, grid, 1, 1);

      expect(grid.getTile(1, 1)).toBe(TILE.POWER_PELLET);
      pacman.update(0, 1000);
      expect(grid.getTile(1, 1)).toBe(TILE.EMPTY);
    });
  });

  describe('Events', () => {
    it('When consuming PELLET, scene.events.emit is called with pellet_eaten, tileX, tileY', async () => {
      const { Pacman } = await importPacman();
      const data = makeSmallGrid(4, 4);
      data[1][1] = TILE.PELLET;
      const grid = new Grid(data);
      const scene = createMockScene();
      const pacman = new Pacman(scene, grid, 1, 1);

      pacman.update(0, 1000);

      expect(scene.events.emit).toHaveBeenCalledWith('pellet_eaten', 1, 1);
    });

    it('When consuming POWER_PELLET, scene.events.emit is called with power_pellet_eaten, tileX, tileY', async () => {
      const { Pacman } = await importPacman();
      const data = makeSmallGrid(4, 4);
      data[1][1] = TILE.POWER_PELLET;
      const grid = new Grid(data);
      const scene = createMockScene();
      const pacman = new Pacman(scene, grid, 1, 1);

      pacman.update(0, 1000);

      expect(scene.events.emit).toHaveBeenCalledWith('power_pellet_eaten', 1, 1);
    });
  });
});
