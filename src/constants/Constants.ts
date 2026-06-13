export const TILE = {
  EMPTY: 0,
  WALL: 1,
  PELLET: 2,
  POWER_PELLET: 3,
  GHOST_HOUSE: 4,
  GHOST_DOOR: 5,
} as const;

export const LEVEL_CONFIG = {
  TILE_SIZE: 16,
  GRID_COLS: 28,
  GRID_ROWS: 31,
  PLAYER_SPEED: 150,
  GHOST_SPEED: 120,
  PELLET_SCORE: 10,
  POWER_PELLET_SCORE: 50,
  GHOST_FRIGHTENED_DURATION: 6000,
  PLAYER_LIVES: 3,
  GHOST_EATEN_SCORE: 200,
} as const;

export enum GhostMode {
  SCATTER = 'SCATTER',
  CHASE = 'CHASE',
  FRIGHTENED = 'FRIGHTENED',
  EATEN = 'EATEN',
  IN_HOUSE = 'IN_HOUSE',
}

export enum GhostType {
  BLINKY = 'BLINKY',
  PINKY = 'PINKY',
  INKY = 'INKY',
  CLYDE = 'CLYDE',
}

export const GHOST_COLORS = {
  BLINKY: 0xff0000,
  PINKY: 0xffb8ff,
  INKY: 0x00ffff,
  CLYDE: 0xffb852,
} as const;

export const SCATTER_TARGETS = {
  BLINKY: { x: 27, y: 0 },
  PINKY: { x: 0, y: 0 },
  INKY: { x: 27, y: 30 },
  CLYDE: { x: 0, y: 30 },
} as const;

export const GHOST_HOUSE_TARGET = { x: 14, y: 14 } as const;

export const EVENTS = {
  PELLET_EATEN: 'pellet_eaten',
  POWER_PELLET_EATEN: 'power_pellet_eaten',
  GHOST_EATEN: 'ghost_eaten',
  PACMAN_DIED: 'pacman_died',
} as const;

export const SNAP_THRESHOLD = 2;
