import { describe, it, expect } from 'vitest';

describe('constants', () => {
  it('has positive base half width', async () => {
    const { BASE_HALF_WIDTH } = await import('../src/constants');
    expect(BASE_HALF_WIDTH).toBeGreaterThan(0);
  });

  it('has positive total height', async () => {
    const { HEIGHT_TOTAL } = await import('../src/constants');
    expect(HEIGHT_TOTAL).toBeGreaterThan(0);
  });

  it('total height exceeds top height', async () => {
    const { HEIGHT_TOTAL, HEIGHT_TOP } = await import('../src/constants');
    expect(HEIGHT_TOTAL).toBeGreaterThan(HEIGHT_TOP);
  });

  it('antenna height equals total minus top', async () => {
    const { HEIGHT_TOTAL, HEIGHT_TOP, ANTENNA_HEIGHT } = await import('../src/constants');
    expect(ANTENNA_HEIGHT).toBe(HEIGHT_TOTAL - HEIGHT_TOP);
  });

  it('platform heights are ascending', async () => {
    const { PLATFORM_HEIGHTS } = await import('../src/constants');
    for (let i = 1; i < PLATFORM_HEIGHTS.length; i++) {
      expect(PLATFORM_HEIGHTS[i]).toBeGreaterThan(PLATFORM_HEIGHTS[i - 1]);
    }
  });

  it('platform half widths are positive and decreasing', async () => {
    const { PLATFORM_HEIGHTS, PLATFORM_HALF_WIDTHS } = await import('../src/constants');
    const widths = PLATFORM_HEIGHTS.map((h) => PLATFORM_HALF_WIDTHS[h]);
    for (const w of widths) expect(w).toBeGreaterThan(0);
    for (let i = 1; i < widths.length; i++) {
      expect(widths[i]).toBeLessThan(widths[i - 1]);
    }
  });

  it('scene scale is positive and less than 1', async () => {
    const { SCENE_SCALE } = await import('../src/constants');
    expect(SCENE_SCALE).toBeGreaterThan(0);
    expect(SCENE_SCALE).toBeLessThan(1);
  });

  it('camera initial position has valid values', async () => {
    const { CAMERA_INITIAL_POSITION } = await import('../src/constants');
    expect(CAMERA_INITIAL_POSITION.x).toBeGreaterThan(0);
    expect(CAMERA_INITIAL_POSITION.y).toBeGreaterThan(0);
  });
});
