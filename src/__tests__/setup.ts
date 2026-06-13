import { vi } from 'vitest';

vi.mock('phaser', () => {
  class MockScene {
    scene: any;
    events: any;
    add: any;
    cameras: any;
    input: any;
    constructor(config?: any) {
      this.scene = { key: config?.key, start: vi.fn() };
      this.events = { on: vi.fn(), emit: vi.fn() };
      this.add = {
        rectangle: vi.fn().mockReturnValue({ setVisible: vi.fn(), setDepth: vi.fn() }),
        circle: vi.fn().mockReturnValue({
          x: 0, y: 0,
          setPosition: vi.fn(),
          setVisible: vi.fn(),
          setDepth: vi.fn(),
          destroy: vi.fn(),
        }),
        text: vi.fn().mockReturnValue({
          _text: '',
          get text() { return this._text; },
          set text(v: string) { this._text = v; },
          setText: vi.fn(function (this: any, t: string) { this._text = t; return this; }),
          setPosition: vi.fn().mockReturnThis(),
          setVisible: vi.fn().mockReturnThis(),
          setDepth: vi.fn().mockReturnThis(),
          setOrigin: vi.fn().mockReturnThis(),
          setStyle: vi.fn().mockReturnThis(),
          setFontSize: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        }),
      };
      this.cameras = { main: { setBackgroundColor: vi.fn() } };
      this.input = {
        keyboard: {
          createCursorKeys: vi.fn().mockReturnValue({
            up: { isDown: false },
            down: { isDown: false },
            left: { isDown: false },
            right: { isDown: false },
          }),
          on: vi.fn(),
        },
      };
    }
  }

  return {
    default: {
      Scene: MockScene,
      AUTO: 0,
      CANVAS: 1,
      HEADLESS: 2,
      Game: class {
        constructor(_config: any) {}
      },
    },
    Scene: MockScene,
  };
});
