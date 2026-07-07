import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('test runner works', () => {
    expect(1 + 1).toBe(2);
  });

  it('DOM globals are set up', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
    expect(typeof HTMLElement).toBe('function');
  });
});
