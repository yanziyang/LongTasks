### Task 2: Constants Module with Validation

**Files:**
- Create: `src/constants.ts`
- Create: `tests/constants.test.ts`

**Interfaces:**
- Produces: `HEIGHT_TOTAL`, `HEIGHT_TOP`, `ANTENNA_HEIGHT`, `BASE_HALF_WIDTH`, `PLATFORM_HEIGHTS`, `PLATFORM_HALF_WIDTHS`, `SCENE_SCALE`, `RING_COUNT`, `SPARKLE_INTERVAL_MS`, `SPARKLE_DURATION_MS`, `SPARKLE_ENTER_DURATION_MS`, `TOWER_COLOR_LOWER`, `TOWER_COLOR_MIDDLE`, `TOWER_COLOR_UPPER`, `ANTENNA_COLOR`, `CAMERA_INITIAL_POSITION`, `CAMERA_TARGET`, `AUTO_ROTATION_SPEED`, `AUTO_ROTATION_RECOVERY_S`

- [ ] **Step 1: Create tests/constants.test.ts**

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL — `src/constants.ts` does not exist.

- [ ] **Step 3: Create src/constants.ts**

```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test
```

Expected: PASS — 8 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/constants.ts tests/constants.test.ts
git commit -m "feat: add constants module with runtime validation"
```
