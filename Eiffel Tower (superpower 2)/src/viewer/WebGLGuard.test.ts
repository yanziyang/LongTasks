import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkWebGLSupport, showFallback } from './WebGLGuard';

describe('checkWebGLSupport', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true when WebGL is available', () => {
    const getContext = vi.fn().mockReturnValue({});
    vi.spyOn(document, 'createElement').mockReturnValue({
      getContext,
    } as unknown as HTMLCanvasElement);
    vi.stubGlobal('WebGLRenderingContext', function () {});

    expect(checkWebGLSupport()).toBe(true);
    expect(getContext).toHaveBeenCalledWith('webgl');
  });

  it('returns true when only experimental-webgl is available', () => {
    const getContext = vi.fn((type: string) =>
      type === 'experimental-webgl' ? {} : null
    );
    vi.spyOn(document, 'createElement').mockReturnValue({
      getContext,
    } as unknown as HTMLCanvasElement);
    vi.stubGlobal('WebGLRenderingContext', function () {});

    expect(checkWebGLSupport()).toBe(true);
    expect(getContext).toHaveBeenCalledWith('experimental-webgl');
  });

  it('returns false when neither context is available', () => {
    const getContext = vi.fn().mockReturnValue(null);
    vi.spyOn(document, 'createElement').mockReturnValue({
      getContext,
    } as unknown as HTMLCanvasElement);
    vi.stubGlobal('WebGLRenderingContext', function () {});

    expect(checkWebGLSupport()).toBe(false);
  });

  it('returns false when WebGLRenderingContext is missing', () => {
    const getContext = vi.fn().mockReturnValue({});
    vi.spyOn(document, 'createElement').mockReturnValue({
      getContext,
    } as unknown as HTMLCanvasElement);
    vi.stubGlobal('WebGLRenderingContext', undefined);

    expect(checkWebGLSupport()).toBe(false);
  });

  it('returns false when createElement throws', () => {
    vi.spyOn(document, 'createElement').mockImplementation(() => {
      throw new Error('not supported');
    });

    expect(checkWebGLSupport()).toBe(false);
  });
});

describe('showFallback', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sets container innerHTML with the message', () => {
    const container = document.createElement('div');
    showFallback(container, 'WebGL is not supported in this browser.');
    expect(container.innerHTML).toContain(
      'WebGL is not supported in this browser.'
    );
  });
});
