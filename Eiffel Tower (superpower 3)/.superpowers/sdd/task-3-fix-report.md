# Task 3: InterLegLatticeBuilder Fix Report

## Changes Made

### Issue 1: Dense lattice section unreachable

**Root cause**: `sectionForHeight(h0)` never returns 0 for body lattice bays (h0 starts at 57, which maps to section 1). The dense 6-member code gated behind `if (section === 0)` was dead code.

**Fix**: Swapped the section mappings in the `buildBodyLattice` if-else chain:
- `if (section === 1)` → dense 6-member (57-115m, every bay)
- `else if (section === 2)` → medium 4-member (115+m)
- `else` → sparse 2-member

Also removed the skip line `if (section === 1) skip = bay % 2 === 1;` so section 1 builds ALL bays as specified for the dense lattice. Removed the unused `BASE_HALF_WIDTH` import to fix a pre-existing TypeScript error.

### Issue 2: heightRatio values incorrect for body lattice meshes

**Root cause**: The traverse in `buildInterLegLattice` read `child.matrixWorld` but the group was never added to a scene, so `matrixWorld` was identity for rotated/translated meshes (e.g., cylinders from `beamBetween`).

**Fix**: Added `group.updateMatrixWorld();` immediately before the `group.traverse(...)` block (line 247). This computes all child world matrices from local transforms before the traverse reads them.

## Command Results

### `npm test` — 9 test files, 72 tests, all passed

### `npm run build` — TypeScript compiled clean, Vite bundled successfully

## Test Summary

```
 Test Files  9 passed (9)
      Tests  72 passed (72)
```

All test suites passing:
- materials.test.ts (9)
- constants.test.ts (16)
- builders.test.ts (16)
- environment.test.ts (5)
- leg-truss.test.ts (6)
- inter-leg-lattice.test.ts (5)
- profile.test.ts (8)
- tower.test.ts (6)
- smoke.test.ts (1)
