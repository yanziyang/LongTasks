import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('./viewer/Viewer', () => {
  return {
    Viewer: vi.fn((container: HTMLElement) => {
      const canvas = document.createElement('canvas');
      container.appendChild(canvas);
      return {
        start: vi.fn(),
        dispose: vi.fn(),
        setTheme: vi.fn(),
        resetCamera: vi.fn(),
      };
    }),
  };
});

import { App } from './App';
import { Viewer } from './viewer/Viewer';

describe('App', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      })
    );
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.removeChild(container);
  });

  it('mounts viewer into container', () => {
    const app = new App(container);
    app.start();
    expect(container.querySelector('canvas')).not.toBeNull();
    app.dispose();
  });

  it('shows loading overlay on start', () => {
    const app = new App(container);
    const overlays = Array.from(container.querySelectorAll('div')).filter(
      (el) => el.textContent === 'Building tower…'
    );
    expect(overlays).toHaveLength(1);
    app.dispose();
  });

  it('removes loading overlay after first frame', () => {
    const app = new App(container);
    app.start();
    const overlays = Array.from(container.querySelectorAll('div')).filter(
      (el) => el.textContent === 'Building tower…'
    );
    expect(overlays).toHaveLength(0);
    app.dispose();
  });

  it('appends theme toggle button', () => {
    const app = new App(container);
    const buttons = container.querySelectorAll('button');
    const themeButton = Array.from(buttons).find(
      (b) => b.textContent === '☀️' || b.textContent === '🌙'
    );
    expect(themeButton).toBeDefined();
    app.dispose();
  });

  it('appends info overlay elements', () => {
    const app = new App(container);
    const infoButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'ℹ️'
    );
    expect(infoButton).toBeDefined();
    const infoContent = Array.from(container.querySelectorAll('div')).find(
      (el) => el.innerHTML?.includes('Eiffel Tower')
    );
    expect(infoContent).toBeDefined();
    app.dispose();
  });

  it('sets container position to relative', () => {
    const app = new App(container);
    expect(container.style.position).toBe('relative');
    app.dispose();
  });

  it('makes container focusable for keyboard events', () => {
    const app = new App(container);
    expect(container.tabIndex).toBe(0);
    app.dispose();
  });

  it('handles dispose without errors', () => {
    const app = new App(container);
    app.start();
    expect(() => app.dispose()).not.toThrow();
  });

  it('creates viewer with container', () => {
    const app = new App(container);
    expect(Viewer).toHaveBeenCalledWith(container);
    app.dispose();
  });

  it('starts viewer animation after first frame', () => {
    const app = new App(container);
    app.start();
    const viewerInstance = vi.mocked(Viewer).mock.results[0]?.value;
    expect(viewerInstance.start).toHaveBeenCalled();
    app.dispose();
  });

  it('disposes viewer on dispose', () => {
    const app = new App(container);
    app.start();
    app.dispose();
    const viewerInstance = vi.mocked(Viewer).mock.results[0]?.value;
    expect(viewerInstance.dispose).toHaveBeenCalled();
  });
});
