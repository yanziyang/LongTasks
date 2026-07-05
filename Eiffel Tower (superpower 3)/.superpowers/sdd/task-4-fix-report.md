# Task 4 — Fix Report: Global `nightModeActive` → per-material `userData`

## What was changed

**File:** `src/tower/materials.ts`

Three changes as specified:

1. **Removed** the module-level `let nightModeActive = false;` declaration (was line 159).
2. **Added** `material.userData.nightMode = night;` at the end of `setNightMode()` so each `ShaderMaterial` stores its own night mode state.
3. **Changed** the guard in `updateSparkle()` from `if (!nightModeActive || ...)` to `if (!material.userData?.nightMode || ...)` so it reads the per-material flag instead of the global one.

Also removed the orphaned `nightModeActive = night;` assignment inside `setNightMode()` that was left after removing the declaration.

## Command run and output

```pwsh
> npm test

> eiffel-tower@0.0.0 test
> vitest run

 RUN  v2.1.9

 ✓ tests/constants.test.js  (8 tests) 136ms
 ✓ tests/materials.test.ts  (9 tests) 10ms
 ✓ tests/constants.test.ts  (8 tests) 83ms
 ✓ tests/profile.test.ts    (8 tests) 12ms

 Test Files  4 passed (4)
      Tests  33 passed (33)
   Duration  1.89s
```

All 33 tests pass across 4 test files.

## Files changed

- `src/tower/materials.ts` — 3 edits (remove `let nightModeActive`, add `material.userData.nightMode = night`, update guard in `updateSparkle`).
