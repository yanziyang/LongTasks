// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { createOverlay } from '../src/ui/Overlay';

describe('createOverlay', () => {
  it('mounts a panel with real dimensions text', () => {
    const parent = document.createElement('div');
    const { el } = createOverlay(parent);
    expect(parent.contains(el)).toBe(true);
    expect(el.textContent).toContain('330');
    expect(el.textContent).toContain('125');
    expect(el.textContent).toContain('57');
    expect(el.textContent).toContain('115');
    expect(el.textContent).toContain('276');
  });
});
