import { describe, it, expect } from 'vitest';

describe('Scenes', () => {
  it('should export BootScene class', async () => {
    const { BootScene } = await import('../scenes/BootScene');
    expect(BootScene).toBeDefined();
    const instance = new BootScene();
    expect(instance).toBeDefined();
    expect(instance.scene).toBeDefined();
  });

  it('should export MenuScene class', async () => {
    const { MenuScene } = await import('../scenes/MenuScene');
    expect(MenuScene).toBeDefined();
    const instance = new MenuScene();
    expect(instance).toBeDefined();
  });

  it('should export GameScene class', async () => {
    const { GameScene } = await import('../scenes/GameScene');
    expect(GameScene).toBeDefined();
    const instance = new GameScene();
    expect(instance).toBeDefined();
  });

  it('should export GameOverScene class', async () => {
    const { GameOverScene } = await import('../scenes/GameOverScene');
    expect(GameOverScene).toBeDefined();
    const instance = new GameOverScene();
    expect(instance).toBeDefined();
  });

  it('should export a valid Phaser.Types.Core.GameConfig', async () => {
    const { gameConfig } = await import('../main');
    expect(gameConfig).toBeDefined();
    expect(gameConfig.type).toBeDefined();
    expect(gameConfig.width).toBeTypeOf('number');
    expect(gameConfig.width).toBeGreaterThan(0);
    expect(gameConfig.height).toBeTypeOf('number');
    expect(gameConfig.height).toBeGreaterThan(0);
    expect(gameConfig.scene).toBeDefined();
    expect(Array.isArray(gameConfig.scene)).toBe(true);
    expect((gameConfig.scene as any[]).length).toBeGreaterThanOrEqual(1);
  });
});
