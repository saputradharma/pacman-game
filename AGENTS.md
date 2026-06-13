# Pacman2 Game — Agent Guide

## Commands

```sh
npm run dev       # vite dev server
npm test          # vitest run (all tests)
npm test -- -t "Ghost"  # run single test file matching pattern
npx tsc --noEmit  # typecheck only
npm run build     # tsc + vite build (checks types + bundles)
```

Verify in order: `npx tsc --noEmit && npm test`.

## TDD Workflow

Follow PLAN.md phases strictly. Each phase: Plan → Write failing tests (RED) → Implement (GREEN) → Run `npx tsc --noEmit && npm test` before declaring done. Tests use `await import()` for lazy-loading scene classes.

## Testing

- **Environment**: jsdom (vitest.config.ts). Phaser is mocked in `src/__tests__/setup.ts`.
- **Mock constraints**: The Phaser mock only provides `Scene`, `add.rectangle/circle/text(...)`, `events.on/emit`, `cameras.main.setBackgroundColor`, `input.keyboard.on/createCursorKeys`, `WEBGL`/`AUTO`/`CANVAS`/`HEADLESS` constants. Any other Phaser API used in scenes/entities must be added to the mock first.
- **Test files** (one per domain): `constants.test.ts`, `grid.test.ts`, `pacman.test.ts`, `ghost.test.ts`, `gameMechanics.test.ts`, `scenes.test.ts`, `ui.test.ts`.
- **Test patterns**: Tests create scenes via `new GameScene()`, call `scene.create()` directly (no Phaser.Game needed — mock handles this), and drive entities with manual `update()` calls. Helper `createMockScene()` gives a minimal Phaser.Scene stub for entity-only tests. `scene.scene.start` is a vi.fn() — assert against it.

## Architecture

| Path | Purpose |
|------|---------|
| `src/main.ts` | Entrypoint, Phaser config, canvas size = `GRID_COLS*TILE_SIZE` × `GRID_ROWS*TILE_SIZE` |
| `src/constants/Constants.ts` | `TILE` enum, `LEVEL_CONFIG`, `EVENTS`, `GhostMode`, `GhostType`, colors, targets, `SNAP_THRESHOLD = 2` |
| `src/levels/` | Maze: `mazeData.ts` (28×31 array), `Grid.ts` (tile↔pixel conversion, wall detection) |
| `src/scenes/` | Scene lifecycle: `BootScene` → `MenuScene` → `GameScene` → `GameOverScene` |
| `src/entities/` | `Pacman.ts` (movement, input buffering, pellet consumption, events) + `Ghost.ts` (AI, mode machine, 4 ghost types) |

- **Engine**: Phaser 4 (migrated from v3). Uses `Phaser.WEBGL` with `roundPixels: true`.
- **Entities do not extend Phaser game objects**. They are plain classes holding `graphic: Phaser.GameObjects.Arc`, updated via `graphic.setPosition(x, y)` each frame. No Phaser physics.
- **Scene communication**: Uses Phaser scene events (`this.events.emit` / `on`), not direct coupling.

## Key conventions

- **Tile coordinate system**: 28×31 grid, 16px tiles. `Grid.tileToPixel()` returns **center** of tile. `Grid.pixelToTile()` floors to tile index.
- **Maze**: 2D array of `TILE` values. Border is all `TILE.WALL`. `Grid.isWall()` treats out-of-bounds as wall.
- **Maze rendering**: `GameScene.renderMaze()` uses `add.rectangle()` for walls/doors/house, `add.circle()` for pellets (radius 2) and power pellets (radius 5). All stored in `pelletGraphics: Map<string, Arc>` keyed by `"col,row"`.
- **Entity movement**: Tile-snapped movement with `SNAP_THRESHOLD = 2`. `Pacman` uses buffered `nextDirection` for responsive turns at intersections; reverse direction is applied immediately. Ghosts choose direction at tile centers using target-based scoring (no pathfinding).
- **Input**: Arrow keys + WASD in `GameScene.create()`. `event.preventDefault()` is called. `input.keyboard.on('keydown', ...)`.
- **Pellet consumption**: `Pacman.consumePellet()` emits `EVENTS.PELLET_EATEN` / `EVENTS.POWER_PELLET_EATEN` via `scene.events.emit()`. GameScene handles these to remove graphics and update score/ghost mode.
- **TypeScript**: strict mode, `noUnusedLocals`/`noUnusedParameters` on. Fix these before treating build as clean.
- `src/map/` directory exists but is empty (maze data lives in `src/levels/`).
