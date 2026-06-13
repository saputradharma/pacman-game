import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LEVEL_CONFIG } from '../constants/Constants';

describe('UI', () => {
  let GameScene: any;
  let MenuScene: any;
  let GameOverScene: any;

  beforeEach(async () => {
    const gs = await import('../scenes/GameScene');
    GameScene = gs.GameScene;
    const ms = await import('../scenes/MenuScene');
    MenuScene = ms.MenuScene;
    const gos = await import('../scenes/GameOverScene');
    GameOverScene = gos.GameOverScene;
  });

  describe('MenuScene', () => {
    function createMenuScene(): any {
      const scene = new MenuScene();
      scene.scene.start = vi.fn();
      scene.input.keyboard.on = vi.fn();
      scene.create();
      return scene;
    }

    it('should display PAC-MAN title text centered', async () => {
      const scene = createMenuScene();
      const textCalls = scene.add.text.mock.calls;
      const titleCall = textCalls.find(
        (call: any) => typeof call[2] === 'string' && call[2].includes('PAC-MAN'),
      );
      expect(titleCall).toBeDefined();
    });

    it('should display a start prompt text', async () => {
      const scene = createMenuScene();
      const textCalls = scene.add.text.mock.calls;
      const promptCall = textCalls.find(
        (call: any) =>
          typeof call[2] === 'string' &&
          /press.*key|start/i.test(call[2]),
      );
      expect(promptCall).toBeDefined();
    });

    it('should transition to GameScene on keypress', async () => {
      const scene = createMenuScene();
      const keydownHandler = scene.input.keyboard.on.mock.calls.find(
        (call: any) => call[0] === 'keydown',
      );
      expect(keydownHandler).toBeDefined();

      keydownHandler[1]();
      expect(scene.scene.start).toHaveBeenCalledWith('GameScene');
    });
  });

  describe('HUD in GameScene', () => {
    function createScene(): any {
      const scene = new GameScene();
      scene.events.on = vi.fn();
      scene.events.emit = vi.fn();
      scene.create();
      return scene;
    }

    it('should create a score text element', async () => {
      const scene = createScene();
      const textCalls = scene.add.text.mock.calls;
      const scoreCall = textCalls.find(
        (call: any) => typeof call[2] === 'string' && /score/i.test(call[2]),
      );
      expect(scoreCall).toBeDefined();
    });

    it('should create a lives text element', async () => {
      const scene = createScene();
      const textCalls = scene.add.text.mock.calls;
      const livesCall = textCalls.find(
        (call: any) => typeof call[2] === 'string' && /lives/i.test(call[2]),
      );
      expect(livesCall).toBeDefined();
    });

    it('score text starts at 0', async () => {
      const scene = createScene();
      const textCalls = scene.add.text.mock.calls;
      const scoreCall = textCalls.find(
        (call: any) => typeof call[2] === 'string' && /score/i.test(call[2]),
      );
      expect(scoreCall).toBeDefined();
      expect(scoreCall[2]).toContain('0');
    });

    it('lives text starts at PLAYER_LIVES', async () => {
      const scene = createScene();
      const textCalls = scene.add.text.mock.calls;
      const livesCall = textCalls.find(
        (call: any) => typeof call[2] === 'string' && /lives/i.test(call[2]),
      );
      expect(livesCall).toBeDefined();
      expect(livesCall[2]).toContain(String(LEVEL_CONFIG.PLAYER_LIVES));
    });
  });

  describe('GameOverScene', () => {
    function createGameOverScene(data?: any): any {
      const scene = new GameOverScene();
      scene.scene.start = vi.fn();
      scene.input.keyboard.on = vi.fn();
      scene.create(data);
      return scene;
    }

    it('should display GAME OVER text', async () => {
      const scene = createGameOverScene();
      const textCalls = scene.add.text.mock.calls;
      const gameOverCall = textCalls.find(
        (call: any) => typeof call[2] === 'string' && /game\s*over/i.test(call[2]),
      );
      expect(gameOverCall).toBeDefined();
    });

    it('should display final score', async () => {
      const scene = createGameOverScene({ score: 500 });
      const textCalls = scene.add.text.mock.calls;
      const scoreCall = textCalls.find(
        (call: any) => typeof call[2] === 'string' && /500/.test(call[2]),
      );
      expect(scoreCall).toBeDefined();
    });

    it('should display score of 0 when no data passed', async () => {
      const scene = createGameOverScene();
      const textCalls = scene.add.text.mock.calls;
      const scoreCall = textCalls.find(
        (call: any) => typeof call[2] === 'string' && /0/.test(call[2]),
      );
      expect(scoreCall).toBeDefined();
    });

    it('should transition to MenuScene on keypress', async () => {
      const scene = createGameOverScene();
      const keydownHandler = scene.input.keyboard.on.mock.calls.find(
        (call: any) => call[0] === 'keydown',
      );
      expect(keydownHandler).toBeDefined();

      keydownHandler[1]();
      expect(scene.scene.start).toHaveBeenCalledWith('MenuScene');
    });
  });
});
