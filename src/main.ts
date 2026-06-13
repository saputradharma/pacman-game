import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { LEVEL_CONFIG } from './constants/Constants';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  width: LEVEL_CONFIG.GRID_COLS * LEVEL_CONFIG.TILE_SIZE,
  height: LEVEL_CONFIG.GRID_ROWS * LEVEL_CONFIG.TILE_SIZE,
  backgroundColor: '#000000',
  roundPixels: true,
  scene: [BootScene, MenuScene, GameScene, GameOverScene],
};

new Phaser.Game(gameConfig);
