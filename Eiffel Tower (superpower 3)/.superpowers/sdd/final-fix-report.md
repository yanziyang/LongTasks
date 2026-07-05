# Final Fix Report: InterLegLattice Density Tier + LegTruss updateMatrixWorld

**Status:** Fixed and verified
**Commit:** `e0da3c7`
**Date:** 2026-07-05

---

## Issue 1: Body Lattice Missing Middle Density Tier

**File:** `src/tower/builders/InterLegLatticeBuilder.ts`

**Problem:** The old `sectionForHeight` function returned only two tiers for the body lattice (h < 115 → section 1, h >= 115 → section 2). Section 2 applied the same `bay % 3 !== 0` sparse skip to both 115-276m and 276-300m ranges, meaning the 115-276m range had no dedicated medium-density tier.

**Fix:** Replaced `sectionForHeight` with `densityTier` that returns three tiers:
- **Tier 0** (h < 115m): 6-member dense lattice, all bays — no skip
- **Tier 1** (115 ≤ h < 276m): 4-member medium lattice, every other bay — `skip = bay % 2 === 1`
- **Tier 2** (h ≥ 276m): 2-member sparse lattice, every 3rd bay — `skip = bay % 3 !== 0`

---

## Issue 2: Missing updateMatrixWorld in LegTrussBuilder

**File:** `src/tower/builders/LegTrussBuilder.ts`

**Problem:** The `group.traverse(...)` block at line 141 reads `child.matrixWorld` to compute vertex world positions for `heightRatio`, but `group.updateMatrixWorld()` was never called beforehand. If a child's world matrix hadn't been computed yet by some other path, `heightRatio` values would be incorrect.

**Fix:** Added `group.updateMatrixWorld();` on line 141, before the `group.traverse(...)` block, ensuring all child world matrices are up-to-date before they're read.

---

## Verification

| Check | Result |
|-------|--------|
| `npm test` (63 tests) | All 63 passed |
| `npm run build` | Succeeded |
| Commit | `e0da3c7` — "fix: add middle density tier and updateMatrixWorld in LegTrussBuilder" |
