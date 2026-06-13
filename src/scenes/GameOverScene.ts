import Phaser from 'phaser';
import { LEVEL_CONFIG } from '../constants/Constants';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data?: { score?: number }): void {
    const centerX = (LEVEL_CONFIG.GRID_COLS * LEVEL_CONFIG.TILE_SIZE) / 2;
    const centerY = (LEVEL_CONFIG.GRID_ROWS * LEVEL_CONFIG.TILE_SIZE) / 2;
    const score = data?.score ?? 0;

    this.add.text(centerX, centerY - 30, 'GAME OVER', {
      fontSize: '24px',
      color: '#ff0000',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(centerX, centerY + 10, `Score: ${score}`, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(centerX, centerY + 40, 'Press any key to restart', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.input.keyboard!.on('keydown', () => {
      this.scene.start('MenuScene');
    });
  }
}
