export const HEIGHT_TOTAL = 330;
export const HEIGHT_TOP = 300;
export const ANTENNA_HEIGHT = 30;
export const BASE_HALF_WIDTH = 62.5;
export const PLATFORM_HEIGHTS = [57, 115, 276] as const;
export const PLATFORM_HALF_WIDTHS: Record<number, number> = {
  57: 32.5,
  115: 18.8,
  276: 9,
};
export const SCENE_SCALE = 0.01;
export const RING_COUNT = 120;
export const TOWER_COLOR = 0x6b5b47;
export const ANTENNA_COLOR = 0x2a2a2a;
export const SPARKLE_LIGHT_COUNT = 40;
export const SPARKLE_INTERVAL_MS = 60_000;
export const SPARKLE_DURATION_MS = 5_000;

if (BASE_HALF_WIDTH <= 0) throw new Error('BASE_HALF_WIDTH must be positive');
if (HEIGHT_TOP <= 0) throw new Error('HEIGHT_TOP must be positive');
