import * as THREE from 'three';
export const HEIGHT_TOTAL = 330;
export const HEIGHT_TOP = 300;
export const ANTENNA_HEIGHT = HEIGHT_TOTAL - HEIGHT_TOP;
export const BASE_HALF_WIDTH = 62.5;
export const PLATFORM_HEIGHTS = [57, 115, 276];
export const PLATFORM_HALF_WIDTHS = {
    57: 32.5,
    115: 18.8,
    276: 9,
};
export const SCENE_SCALE = 0.01;
export const RING_COUNT = 150;
export const SPARKLE_INTERVAL_MS = 180_000; // 3 minutes
export const SPARKLE_DURATION_MS = 20_000;
export const SPARKLE_ENTER_DURATION_MS = 10_000;
export const TOWER_COLOR_LOWER = new THREE.Color(0x5a3d2b);
export const TOWER_COLOR_MIDDLE = new THREE.Color(0x6b5b47);
export const TOWER_COLOR_UPPER = new THREE.Color(0x7a6e5d);
export const ANTENNA_COLOR = 0x2a2a2a;
export const CAMERA_INITIAL_POSITION = new THREE.Vector3(250, 120, 250);
export const CAMERA_TARGET = new THREE.Vector3(0, 150, 0);
export const AUTO_ROTATION_SPEED = 0.15; // rad/min
export const AUTO_ROTATION_RECOVERY_S = 3; // seconds to recover speed after drag
if (BASE_HALF_WIDTH <= 0)
    throw new Error('BASE_HALF_WIDTH must be positive');
if (HEIGHT_TOP <= 0)
    throw new Error('HEIGHT_TOP must be positive');
if (ANTENNA_HEIGHT <= 0)
    throw new Error('ANTENNA_HEIGHT must be positive');
if (SCENE_SCALE <= 0 || SCENE_SCALE >= 1)
    throw new Error('SCENE_SCALE must be between 0 and 1');
if (RING_COUNT < 10)
    throw new Error('RING_COUNT must be at least 10');
if (SPARKLE_INTERVAL_MS <= SPARKLE_DURATION_MS)
    throw new Error('sparkle interval must exceed sparkle duration');
if (SPARKLE_ENTER_DURATION_MS > SPARKLE_DURATION_MS)
    throw new Error('enter sparkle must not exceed regular sparkle duration');
for (let i = 1; i < PLATFORM_HEIGHTS.length; i++) {
    if (PLATFORM_HEIGHTS[i] <= PLATFORM_HEIGHTS[i - 1]) {
        throw new Error('platform heights must be ascending');
    }
}
