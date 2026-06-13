# Pacman2 Game — Agent Guide

## Commands

```sh
npm run dev       # vite dev server
npm test          # vitest run (all tests)
npm test -- -t "Phase 2"   # run single phase test file
npx tsc --noEmit  # typecheck only
npm run build     # tsc + vite build (checks types + bundles)
```

## TDD Workflow

Follow PLAN.md phases strictly. Each phase: Plan → Write failing tests (RED) → Implement (GREEN) → Run `npx tsc --noEmit && npm test` before declaring done.

## Testing

- **Environment**: jsdom (vitest.config.ts). Phaser is mocked in `src/__tests__/setup.ts`.
- **Mock constraints**: Phaser.Scene mock only provides `scene`, `events`, `add.rectangle(...)`, `cameras.main.setBackgroundColor`. Any other Phaser API used in scenes must be added to the mock first.
- Test files are `src/__tests__/phase*.test.ts`, one per phase.
- Tests use `await import(...)` for lazy-loading scene classes.

## Architecture

| Path | Purpose |
|------|---------|
| `src/main.ts` | Entrypoint, Phaser config, canvas size = `GRID_COLS*TILE_SIZE` × `GRID_ROWS*TILE_SIZE` |
| `src/constants/Constants.ts` | `TILE` enum, `LEVEL_CONFIG` (speeds, sizes, scores) |
| `src/levels/` | Maze: `mazeData.ts` (28×31 array), `Grid.ts` (tile↔pixel, wall detection) |
| `src/scenes/` | Scene lifecycle: `BootScene` → `MenuScene` → `GameScene` → `GameOverScene` |
| `src/entities/` | Not yet implemented (future: Pacman, Ghost) |

## Key conventions

- **Tile coordinate system**: 28×31 grid, 16px tiles. `tileToPixel()` returns **center** of tile. `pixelToTile()` floors to tile index.
- **Scene communication**: Use Phaser scene events (`this.events.emit` / `on`), not direct coupling.
- **Maze data**: 2D array of `TILE` values. Border is all `TILE.WALL`. `Grid.isWall()` treats out-of-bounds as wall.
- **Input handling**: Buffered `nextDirection` variable in Pacman entity (not yet implemented).
- TypeScript: strict mode, `noUnusedLocals`/`noUnusedParameters` on. Fix these before treating build as clean.
- Maze rendering uses `this.add.rectangle()` per tile (no sprites yet).
