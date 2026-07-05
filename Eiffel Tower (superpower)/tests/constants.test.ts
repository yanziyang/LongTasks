import { describe, it, expect } from 'vitest';
import {
  HEIGHT_TOTAL,
  HEIGHT_TOP,
  ANTENNA_HEIGHT,
  BASE_HALF_WIDTH,
  PLATFORM_HEIGHTS,
  PLATFORM_HALF_WIDTHS,
  SCENE_SCALE,
  RING_COUNT,
} from '../src/constants';

describe('constants', () => {
  it('has correct total height', () => {
    expect(HEIGHT_TOTAL).toBe(330);
    expect(HEIGHT_TOP).toBe(300);
    expect(ANTENNA_HEIGHT).toBe(30);
  });

  it('has correct base half-width', () => {
    expect(BASE_HALF_WIDTH).toBe(62.5);
  });

  it('has the three real platform heights', () => {
    expect(PLATFORM_HEIGHTS).toEqual([57, 115, 276]);
  });

  it('has calibrated platform half-widths', () => {
    expect(PLATFORM_HALF_WIDTHS[57]).toBeCloseTo(32.5, 5);
    expect(PLATFORM_HALF_WIDTHS[276]).toBeCloseTo(9, 5);
    expect(PLATFORM_HALF_WIDTHS[115]).toBeCloseTo(18.8, 1);
  });

  it('scales the scene to 1/100', () => {
    expect(SCENE_SCALE).toBe(0.01);
  });

  it('uses enough rings for a smooth curve', () => {
    expect(RING_COUNT).toBeGreaterThanOrEqual(100);
  });
});
