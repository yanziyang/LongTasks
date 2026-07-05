import { describe, it, expect } from 'vitest';
import { createLoadingOverlay } from './LoadingOverlay';

describe('LoadingOverlay', () => {
  it('displays building text', () => {
    const overlay = createLoadingOverlay();
    expect(overlay.textContent).toContain('Building tower');
  });

  it('returns a div element', () => {
    const overlay = createLoadingOverlay();
    expect(overlay.tagName).toBe('DIV');
  });

  it('has full-screen overlay styling', () => {
    const overlay = createLoadingOverlay();
    expect(overlay.style.position).toBe('absolute');
    expect(overlay.style.inset).toBe('0');
    expect(overlay.style.zIndex).toBe('20');
  });
});
