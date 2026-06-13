import { TILE } from '../constants/Constants';

const W = TILE.WALL;
const E = TILE.EMPTY;
const P = TILE.PELLET;
const O = TILE.POWER_PELLET;


export const mazeData: number[][] = [
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
  [W,P,P,P,P,P,P,P,P,P,P,P,P,W,W,P,P,P,P,P,P,P,P,P,P,P,P,W],
  [W,P,W,W,W,W,P,W,W,W,W,W,P,W,W,P,W,W,W,W,W,P,W,W,W,W,P,W],
  [W,O,W,W,W,W,P,W,W,W,W,W,P,W,W,P,W,W,W,W,W,P,W,W,W,W,O,W],
  [W,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,W],
  [W,P,W,W,W,W,P,W,W,P,W,W,W,W,W,W,W,W,P,W,W,P,W,W,W,W,P,W],
  [W,P,W,W,W,W,P,W,W,P,W,W,W,W,W,W,W,W,P,W,W,P,W,W,W,W,P,W],
  [W,P,P,P,P,P,P,W,W,P,P,P,P,W,W,P,P,P,P,W,W,P,P,P,P,P,P,W],
  [W,W,W,W,W,W,P,W,W,W,W,W,P,W,W,P,W,W,W,W,W,P,W,W,W,W,W,W],
  [W,W,W,W,W,W,P,W,W,W,W,W,P,W,W,P,W,W,W,W,W,P,W,W,W,W,W,W],
  [W,P,P,P,P,P,P,W,W,P,P,P,P,E,E,P,P,P,P,W,W,P,P,P,P,P,P,W],
  [W,P,W,W,W,W,P,W,W,P,W,W,E,E,E,E,W,W,P,W,W,P,W,W,W,W,P,W],
  [W,P,W,W,W,W,P,W,W,P,W,W,E,E,E,E,W,W,P,W,W,P,W,W,W,W,P,W],
  [W,W,W,P,P,W,W,W,W,P,P,P,P,E,E,P,P,P,P,W,W,W,W,P,P,W,W,W],
  [W,E,W,P,P,W,W,W,W,P,P,P,P,E,E,P,P,P,P,W,W,W,W,P,P,W,E,W],
  [W,E,W,P,P,W,W,W,W,P,W,W,E,E,E,E,W,W,P,W,W,W,W,P,P,W,E,W],
  [W,W,W,P,P,W,W,W,W,P,W,W,E,E,E,E,W,W,P,W,W,W,W,P,P,W,W,W],
  [W,P,P,P,P,P,P,P,P,P,P,P,P,E,E,P,P,P,P,P,P,P,P,P,P,P,P,W],
  [W,P,W,W,W,W,P,W,W,W,W,W,P,W,W,P,W,W,W,W,W,P,W,W,W,W,P,W],
  [W,P,W,W,W,W,P,W,W,W,W,W,P,W,W,P,W,W,W,W,W,P,W,W,W,W,P,W],
  [W,P,P,P,W,W,P,P,P,P,P,P,E,E,E,E,P,P,P,P,P,P,W,W,P,P,P,W],
  [W,W,W,P,W,W,P,W,W,W,W,P,W,W,W,W,P,W,W,W,W,P,W,W,P,W,W,W],
  [W,W,W,P,W,W,P,W,W,W,W,P,W,W,W,W,P,W,W,W,W,P,W,W,P,W,W,W],
  [W,P,P,P,P,P,P,W,W,P,P,P,P,W,W,P,P,P,P,W,W,P,P,P,P,P,P,W],
  [W,P,W,W,W,W,W,W,W,P,W,W,W,W,W,W,W,W,P,W,W,W,W,W,W,W,P,W],
  [W,P,W,W,W,W,W,W,W,P,W,W,W,W,W,W,W,W,P,W,W,W,W,W,W,W,P,W],
  [W,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,W],
  [W,P,W,W,W,W,P,W,W,W,W,W,P,W,W,P,W,W,W,W,W,P,W,W,W,W,P,W],
  [W,P,W,W,W,W,P,W,W,W,W,W,P,W,W,P,W,W,W,W,W,P,W,W,W,W,P,W],
  [W,O,W,W,W,W,P,P,P,P,P,P,E,E,E,E,P,P,P,P,P,P,W,W,W,W,O,W],
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
];
