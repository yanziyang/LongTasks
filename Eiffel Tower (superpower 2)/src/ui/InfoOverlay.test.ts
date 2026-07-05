import { describe, it, expect } from 'vitest';
import { createInfoOverlay } from './InfoOverlay';

describe('InfoOverlay', () => {
  it('creates panel and toggle', () => {
    const { element, toggle } = createInfoOverlay();
    expect(element.tagName).toBe('DIV');
    expect(toggle.tagName).toBe('BUTTON');
  });

  it('displays Eiffel Tower information', () => {
    const { element } = createInfoOverlay();
    expect(element.innerHTML).toContain('Eiffel Tower');
    expect(element.innerHTML).toContain('330 m');
    expect(element.innerHTML).toContain('1887–1889');
  });

  it('toggle button shows/hides panel', () => {
    const { element, toggle } = createInfoOverlay();
    expect(element.style.display).not.toBe('none');
    toggle.click();
    expect(element.style.display).toBe('none');
    toggle.click();
    expect(element.style.display).toBe('block');
  });
});
