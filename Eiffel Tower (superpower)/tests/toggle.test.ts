// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { createDayNightToggle } from '../src/ui/DayNightToggle';

describe('createDayNightToggle', () => {
  it('mounts a button that fires onToggle', () => {
    const parent = document.createElement('div');
    let called = false;
    const { el } = createDayNightToggle(parent, () => {
      called = true;
    });
    expect(parent.contains(el)).toBe(true);
    el.click();
    expect(called).toBe(true);
  });
});
