import Phaser from 'phaser';
import { LEVEL_CONFIG } from '../constants/Constants';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const centerX = (LEVEL_CONFIG.GRID_COLS * LEVEL_CONFIG.TILE_SIZE) / 2;
    const centerY = (LEVEL_CONFIG.GRID_ROWS * LEVEL_CONFIG.TILE_SIZE) / 2;

    this.add.text(centerX, centerY - 40, 'PAC-MAN', {
      fontSize: '24px',
      color: '#ffff00',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(centerX, centerY + 20, 'Press any key to start', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.input.keyboard!.on('keydown', () => {
      this.scene.start('GameScene');
    });
  }
}
