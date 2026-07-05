import { describe, it, expect } from 'vitest';
import { profile, CALIBRATION } from '../src/tower/profile';

describe('profile w(h)', () => {
  it('hits the base half-width at h=0', () => {
    expect(profile(0)).toBeCloseTo(62.5, 6);
  });

  it('hits the first platform width at h=57 (calibration anchor)', () => {
    expect(profile(57)).toBeCloseTo(32.5, 4);
  });

  it('hits the third platform width at h=276 (calibration anchor)', () => {
    expect(profile(276)).toBeCloseTo(9, 3);
  });

  it('passes through the verification point h=115 within tolerance', () => {
    expect(profile(115)).toBeGreaterThan(16);
    expect(profile(115)).toBeLessThan(22);
  });

  it('returns the asymptotic top width near h=300', () => {
    const w300 = profile(300);
    expect(w300).toBeGreaterThan(CALIBRATION.wTop);
    expect(w300 - CALIBRATION.wTop).toBeLessThan(1.5);
    expect(w300).toBeLessThan(10);
  });

  it('is monotonically decreasing across the full height', () => {
    let prev = profile(0);
    for (let h = 5; h <= 300; h += 5) {
      const cur = profile(h);
      expect(cur).toBeLessThan(prev);
      prev = cur;
    }
  });

  it('never returns NaN or Infinity', () => {
    for (let h = 0; h <= 300; h += 3) {
      expect(Number.isFinite(profile(h))).toBe(true);
    }
  });

  it('throws for heights outside the valid range', () => {
    expect(() => profile(-1)).toThrow();
    expect(() => profile(301)).toThrow();
  });
});
