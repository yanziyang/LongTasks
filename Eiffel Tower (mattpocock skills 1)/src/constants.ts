import * as THREE from 'three';

export const HEIGHT_TOTAL = 330;
export const HEIGHT_TOP = 300;
export const ANTENNA_HEIGHT = HEIGHT_TOTAL - HEIGHT_TOP;
export const BASE_HALF_WIDTH = 62.5;

export const PLATFORM_HEIGHTS = [57, 115, 276] as const;

export const PLATFORM_HALF_WIDTHS: Record<number, number> = {
  57: 32.5,
  115: 18.8,
  276: 9,
};

export const SCENE_SCALE = 0.01;
export const RING_COUNT = 150;

export const SPARKLE_INTERVAL_MS = 180_000;
export const SPARKLE_DURATION_MS = 20_000;
export const SPARKLE_ENTER_DURATION_MS = 10_000;

export const TOWER_COLOR_LOWER = new THREE.Color(0x5a3d2b);
export const TOWER_COLOR_MIDDLE = new THREE.Color(0x6b5b47);
export const TOWER_COLOR_UPPER = new THREE.Color(0x7a6e5d);
export const ANTENNA_COLOR = 0x2a2a2a;

export const CAMERA_INITIAL_POSITION = new THREE.Vector3(250, 120, 250);
export const CAMERA_TARGET = new THREE.Vector3(0, 150, 0);
export const AUTO_ROTATION_SPEED = 0.15;
export const AUTO_ROTATION_RECOVERY_S = 3;

export const LEG_TRUSS_WIDTH_BASE = 9.0;
export const LEG_TRUSS_WIDTH_TOP = 3.5;
export const LEG_TRUSS_BAY_HEIGHT = 3.0;
export const LEG_SECTION_HEIGHT = 57;
export const BODY_BAY_HEIGHT = 4.0;
export const ARCH_MAX_HEIGHT = 45;
export const ARCH_SEGMENTS = 30;
export const ARCH_RING_SPACING = 2.0;

// ── PIERS & ESPLANADE ──
export const PIER_HEIGHT = 26;
export const PIER_BASE_HALF = 12.5;
export const PIER_TOP_HALF = 7.5;
export const PIER_COLOR = 0xb8b0a0;
export const ESPLANADE_HEIGHT_OFFSET = 0.2;

// ── GROUND PLANE ──
export const SEINE_Y = -8;
export const CHAMP_DE_MARS_Y = 0;
export const TROCADERO_Y = 15;
export const GROUND_TILE_SIZE = 400;
export const RIVER_COLOR = 0x3a6b8c;
export const GRASS_COLOR = 0x4a7c3f;
export const TROCADERO_COLOR = 0x8a8a7a;

// ── ELEVATORS ──
export const ELEVATOR_SHAFT_HALF = 1.5;
export const ELEVATOR_LEGS: readonly number[] = [0, 1];
export const ELEVATOR_TOP = 115;
export const ELEVATOR_MID = 57;
export const ELEVATOR_BAY_HEIGHT = 3.0;
export const ELEVATOR_MACHINERY_HEIGHT = 6;

// ── PLATFORM CROSS-GIRDERS ──
export const CROSS_GIRDER_DEPTHS: Record<number, number> = {
  57: 4,
  115: 3,
  276: 2,
};
export const CROSS_GIRDER_GRID_COUNT = 3;

// ── PAVILIONS ──
export const PAVILION_1ST_AREA_RATIO = 0.6;
export const PAVILION_2ND_AREA_RATIO = 0.4;
export const PAVILION_HEIGHT = 10;
export const PAVILION_GLASS_OPACITY = 0.45;
export const PAVILION_FRAME_THICKNESS = 0.15;

// ── SPIRAL STAIRCASE ──
export const STAIRCASE_INNER_OFFSET = 2;
export const STAIRCASE_TURNS = 28;
export const STAIRCASE_TUBE_RADIUS = 0.15;

// ── RIVETS ──
export const RIVET_GROUND_ZONE = 20;
export const RIVET_RADIUS = 0.1;
export const RIVET_DENSITY = 6;

// ── NIGHT MODE ──
export const NIGHT_EMISSIVE_COLOR = new THREE.Color(0x4a3020);
export const NIGHT_EMISSIVE_INTENSITY = 0.3;
export const TWINKLE_POINT_COUNT = 80;

if (BASE_HALF_WIDTH <= 0) throw new Error('BASE_HALF_WIDTH must be positive');
if (HEIGHT_TOP <= 0) throw new Error('HEIGHT_TOP must be positive');
if (ANTENNA_HEIGHT <= 0) throw new Error('ANTENNA_HEIGHT must be positive');
if (SCENE_SCALE <= 0 || SCENE_SCALE >= 1) throw new Error('SCENE_SCALE must be between 0 and 1');
if (RING_COUNT < 10) throw new Error('RING_COUNT must be at least 10');
if (SPARKLE_INTERVAL_MS <= SPARKLE_DURATION_MS) throw new Error('sparkle interval must exceed sparkle duration');
if (SPARKLE_ENTER_DURATION_MS > SPARKLE_DURATION_MS) throw new Error('enter sparkle must not exceed regular sparkle duration');

for (let i = 1; i < PLATFORM_HEIGHTS.length; i++) {
  if (PLATFORM_HEIGHTS[i] <= PLATFORM_HEIGHTS[i - 1]) {
    throw new Error('platform heights must be ascending');
  }
}

if (LEG_TRUSS_WIDTH_BASE <= 0) throw new Error('LEG_TRUSS_WIDTH_BASE must be positive');
if (LEG_TRUSS_WIDTH_TOP <= 0) throw new Error('LEG_TRUSS_WIDTH_TOP must be positive');
if (LEG_TRUSS_WIDTH_TOP >= LEG_TRUSS_WIDTH_BASE) throw new Error('LEG_TRUSS_WIDTH_TOP must be less than LEG_TRUSS_WIDTH_BASE');
if (LEG_TRUSS_BAY_HEIGHT <= 0) throw new Error('LEG_TRUSS_BAY_HEIGHT must be positive');
if (LEG_SECTION_HEIGHT <= 0) throw new Error('LEG_SECTION_HEIGHT must be positive');
if (BODY_BAY_HEIGHT <= 0) throw new Error('BODY_BAY_HEIGHT must be positive');
if (ARCH_MAX_HEIGHT <= 0) throw new Error('ARCH_MAX_HEIGHT must be positive');
if (ARCH_MAX_HEIGHT >= LEG_SECTION_HEIGHT) throw new Error('ARCH_MAX_HEIGHT must be less than LEG_SECTION_HEIGHT');
if (ARCH_SEGMENTS < 4) throw new Error('ARCH_SEGMENTS must be at least 4');
if (ARCH_RING_SPACING <= 0) throw new Error('ARCH_RING_SPACING must be positive');

if (PIER_HEIGHT <= 0) throw new Error('PIER_HEIGHT must be positive');
if (PIER_BASE_HALF <= PIER_TOP_HALF) throw new Error('PIER_BASE_HALF must exceed PIER_TOP_HALF');
if (SEINE_Y >= CHAMP_DE_MARS_Y || CHAMP_DE_MARS_Y >= TROCADERO_Y) throw new Error('ground layers must be ascending');
if (ELEVATOR_SHAFT_HALF <= 0) throw new Error('ELEVATOR_SHAFT_HALF must be positive');
if (ELEVATOR_TOP <= ELEVATOR_MID) throw new Error('ELEVATOR_TOP must exceed ELEVATOR_MID');
if (CROSS_GIRDER_GRID_COUNT < 1) throw new Error('CROSS_GIRDER_GRID_COUNT must be at least 1');
if (STAIRCASE_TURNS < 1) throw new Error('STAIRCASE_TURNS must be at least 1');
if (RIVET_GROUND_ZONE <= 0) throw new Error('RIVET_GROUND_ZONE must be positive');
