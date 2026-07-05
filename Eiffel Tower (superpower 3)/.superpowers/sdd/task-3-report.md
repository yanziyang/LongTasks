# Task 3 Report: Tower Profile (Pure Math)

## What You Implemented

Created the tower's profile curve — a pure math function mapping height to tower half-width using Eiffel's constant-stress exponential decay formula `wTop + (wBase - wTop) * exp(-k*h)`. Calibrated against platform anchor points at h=57 (w=32.5) and h=276 (w=9) via a logarithmic sweep + fine-grained search to solve for k and wTop.

## TDD Evidence

### RED Phase
- Created `tests/profile.test.ts` with 8 tests
- Ran `npm test` — **FAIL**: `src/tower/profile.ts` does not exist (module load error)
- 16 existing constants tests passed; profile file had 0 tests

### GREEN Phase
- Created `src/tower/profile.ts` with calibration solver + profile function
- Ran `npm test` — **PASS**: 24 tests passed (16 constants + 8 profile)

## Files Changed

| File | Action | Lines |
|------|--------|-------|
| `src/tower/profile.ts` | Created | 41 |
| `tests/profile.test.ts` | Created | 48 |

## Test Results

```
✓ tests/constants.test.js  (8 tests)
✓ tests/constants.test.ts  (8 tests)
✓ tests/profile.test.ts    (8 tests)

Test Files  3 passed (3)
     Tests  24 passed (24)
```

### Profile test breakdown:
1. ✅ `profile(0)` ≈ 62.5 (base half-width)
2. ✅ `profile(57)` ≈ 32.5 (first platform anchor)
3. ✅ `profile(276)` ≈ 9 (third platform anchor)
4. ✅ `profile(115)` ∈ (16, 22) (verification point)
5. ✅ Monotonically decreasing for h ∈ [0, 300]
6. ✅ No NaN/Infinity for h ∈ [0, 300] step 3
7. ✅ Throws RangeError for h=-1 and h=301
8. ✅ CALIBRATION: k > 0, wTop > 0, wBase = 62.5

## Self-Review Findings

- **Pure math, no Three.js** — correctly isolated from rendering concerns
- **Module boundary** — imports from `../constants` (correct for `src/tower/` location)
- **Exponential fit** — uses logarithmic sweep (10^-8 to 10^2) followed by fine-grained refinement; finds k that minimizes squared error at both anchor points
- **Edge cases covered** — range validation with RangeError, monotonicity verified, finite output guaranteed
- **No test pollution** — existing constants tests unaffected (both .ts and .js variants still pass)
- **Exports typed** — `profile(h: number): number` and `CALIBRATION: { k: number; wTop: number; wBase: number }`

## Issues

None.
