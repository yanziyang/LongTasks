import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { JSDOM } from 'jsdom';

describe('smoke', () => {
  let dom: JSDOM;

  beforeAll(() => {
    dom = new JSDOM('<!DOCTYPE html><div id="app"></div>', {
      url: 'http://localhost',
      pretendToBeVisual: true,
    });
    (globalThis as any).window = dom.window;
    (globalThis as any).document = dom.window.document;
    (globalThis as any).HTMLElement = dom.window.HTMLElement;
    (globalThis as any).HTMLCanvasElement = dom.window.HTMLCanvasElement;
    (globalThis as any).HTMLButtonElement = dom.window.HTMLButtonElement;
    Object.defineProperty(globalThis, 'navigator', {
      value: dom.window.navigator,
      writable: true,
      configurable: true,
    });
    (globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 16) as unknown as number;
    (globalThis as any).cancelAnimationFrame = (id: number) => clearTimeout(id);
    (globalThis as any).performance = { now: () => Date.now() };

    const origGetContext = dom.window.HTMLCanvasElement.prototype.getContext;
    dom.window.HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      contextId: string,
      options?: any,
    ) {
      if (contextId === 'webgl2' || contextId === 'webgl') return null;
      return origGetContext.call(this, contextId, options);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });

  afterAll(() => {
    dom.window.close();
  });

  it('test runner works', () => {
    expect(1 + 1).toBe(2);
  });
});
