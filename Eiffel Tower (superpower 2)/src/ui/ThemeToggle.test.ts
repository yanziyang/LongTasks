import { describe, it, expect } from 'vitest';
import { createThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  it('calls callback on click', () => {
    let called = false;
    const btn = createThemeToggle(() => { called = true; });
    btn.click();
    expect(called).toBe(true);
  });

  it('toggles text content between sun and moon', () => {
    const btn = createThemeToggle(() => {});
    expect(btn.textContent).toBe('☀️');
    btn.click();
    expect(btn.textContent).toBe('🌙');
    btn.click();
    expect(btn.textContent).toBe('☀️');
  });

  it('returns a button element', () => {
    const btn = createThemeToggle(() => {});
    expect(btn.tagName).toBe('BUTTON');
  });
});
