# Task 5 Report: LegBuilder — Four Curved Edge Beams

## What was implemented

- Created `src/tower/builders/` directory
- Created `src/tower/builders/LegBuilder.ts` with `buildLegs()` function
- Created `tests/builders.test.ts` with 3 tests

## TDD Evidence

### RED
- Before implementation: `tests/builders.test.ts` failed to load because `src/tower/builders/LegBuilder.ts` did not exist

### GREEN
- After implementation: `tests/builders.test.ts` — 3 tests passing
- All 36 tests in suite pass

## Files changed

| File | Action |
|------|--------|
| `src/tower/builders/LegBuilder.ts` | Created |
| `tests/builders.test.ts` | Created |

## Test results

```
 ✓ tests/builders.test.ts (3 tests)  32ms
 ✓ tests/profile.test.ts (8 tests)   13ms
 ✓ tests/materials.test.ts (9 tests) 10ms
 ✓ tests/constants.test.ts (8 tests) 129ms
 ✓ tests/constants.test.js (8 tests) 78ms

 Test Files  5 passed (5)
      Tests  36 passed (36)
```

## Self-review findings

- `buildLegs` accepts both `THREE.Material[] | THREE.Material` and uses `fallback` flag to decide material assignment
- Each leg is a `TubeGeometry` along a `CatmullRomCurve3` traced through `RING_COUNT` profile points
- `heightRatio` attribute is computed per-vertex for the shader material (supports gradient coloring)
- Corner point logic uses sign conventions: corners 0 (--), 1 (+-), 2 (++), 3 (-+) in (x,z) plane
- PIER_RADIUS of 1.2 creates reasonable tubular leg thickness for a 300m tower
