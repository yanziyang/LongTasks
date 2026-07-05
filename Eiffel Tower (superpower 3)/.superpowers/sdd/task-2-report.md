# Task 2 Report: Constants Module with Validation

## What Was Implemented

Created `src/constants.ts` with all Eiffel Tower constants and runtime validation checks, plus `tests/constants.test.ts` with 8 TDD tests.

**Exported constants:**
- `HEIGHT_TOTAL` (330), `HEIGHT_TOP` (300), `ANTENNA_HEIGHT` (30), `BASE_HALF_WIDTH` (62.5)
- `PLATFORM_HEIGHTS` ([57, 115, 276]), `PLATFORM_HALF_WIDTHS` ({57: 32.5, 115: 18.8, 276: 9})
- `SCENE_SCALE` (0.01), `RING_COUNT` (150)
- `SPARKLE_INTERVAL_MS` (180000), `SPARKLE_DURATION_MS` (20000), `SPARKLE_ENTER_DURATION_MS` (10000)
- `TOWER_COLOR_LOWER/MIDDLE/UPPER` (THREE.Color), `ANTENNA_COLOR` (0x2a2a2a)
- `CAMERA_INITIAL_POSITION`, `CAMERA_TARGET` (THREE.Vector3)
- `AUTO_ROTATION_SPEED` (0.15), `AUTO_ROTATION_RECOVERY_S` (3)

**Runtime validations:** BASE_HALF_WIDTH > 0, HEIGHT_TOP > 0, ANTENNA_HEIGHT > 0, SCENE_SCALE in (0,1), RING_COUNT >= 10, sparkle interval > duration, enter duration <= duration, platform heights ascending.

## TDD Evidence

### RED Phase
```
vitest run
  × constants > has positive base half width
    → Failed to load url ../src/constants (resolved id: ../src/constants) ... Does the file exist?
...
 Test Files  1 failed (1)
      Tests  8 failed (8)
```

### GREEN Phase
```
vitest run
  ✓ tests/constants.test.ts (8 tests)

 Test Files  1 passed (1)
      Tests  8 passed (8)
```

## Files Changed

- Created: `src/constants.ts` (96 lines)
- Created: `tests/constants.test.ts` (63 lines)

## Test Results

All 8 tests pass:
1. ✅ has positive base half width
2. ✅ has positive total height
3. ✅ total height exceeds top height
4. ✅ antenna height equals total minus top
5. ✅ platform heights are ascending
6. ✅ platform half widths are positive and decreasing
7. ✅ scene scale is positive and less than 1
8. ✅ camera initial position has valid values

## Self-Review Findings

- Test file matches brief exactly — uses dynamic `import()` to avoid initialization-side-effect errors from Three.js constructors at import time
- Implementation matches brief exactly — all values and validations verbatim
- TypeScript compiles with zero errors (`npx tsc --noEmit`)
- Vite build fails only because `index.html` references `src/main.ts` (not created yet — expected)

## Issues/Concerns

None. Task completed cleanly.
