import { describe, it, expect } from 'vitest';
import { profile, CALIBRATION } from '../src/tower/profile';

describe('profile w(h)', () => {
  it('returns base half-width at h=0', () => {
    expect(profile(0)).toBeCloseTo(62.5, 6);
  });

  it('returns first platform width at h=57 (calibration anchor)', () => {
    expect(profile(57)).toBeCloseTo(32.5, 4);
  });

  it('returns third platform width at h=276 (calibration anchor)', () => {
    expect(profile(276)).toBeCloseTo(9, 3);
  });

  it('passes through h=115 verification point within tolerance', () => {
    const w = profile(115);
    expect(w).toBeGreaterThan(16);
    expect(w).toBeLessThan(22);
  });

  it('is monotonically decreasing', () => {
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

  it('throws for heights outside valid range', () => {
    expect(() => profile(-1)).toThrow();
    expect(() => profile(301)).toThrow();
  });

  it('calibration parameters are positive', () => {
    expect(CALIBRATION.k).toBeGreaterThan(0);
    expect(CALIBRATION.wTop).toBeGreaterThan(0);
    expect(CALIBRATION.wBase).toBe(62.5);
  });
});
