# Task 1 Report: Add New Engineering-Model Constants

## TDD Evidence

### RED Phase
- Added 8 new test cases in a `describe('engineering-model constants', ...)` block in `tests/constants.test.ts`
- Ran `npm test` → **8 tests failed** as expected (all `undefined` — constants not yet exported)
- Failures: `constants.test.ts` — `engineering-model constants` block, 8/8 new tests failing

### GREEN Phase
- Added 8 constant declarations to `src/constants.ts` (lines after `AUTO_ROTATION_RECOVERY_S`)
- Added 10 runtime validation lines after the existing validation block
- Ran `npm test` → **61 tests passed**, 0 failures (53 pre-existing + 8 new)
- 7 test files all green

## Files Changed
- `src/constants.ts` — added 8 exports + 10 validations (+43 lines)
- `tests/constants.test.ts` — added 1 new `describe` block with 8 tests (+44 lines)

## Test Results
- **Total**: 61 passed, 0 failed
- **New tests**: 8 passed (`engineering-model constants` describe block)
- **Pre-existing tests**: 53 passed (unaffected)
- **Test files**: 7/7 passed

## Self-Review Findings
- All constants use reasonable real-world Eiffel Tower engineering values
- `LEG_SECTION_HEIGHT` correctly equals `PLATFORM_HEIGHTS[0]` (=57)
- `LEG_TRUSS_WIDTH_TOP` < `LEG_TRUSS_WIDTH_BASE` (3.5 < 9.0) — legs taper upward
- `ARCH_MAX_HEIGHT` < `LEG_SECTION_HEIGHT` (45 < 57) — arch stops before first platform
- Validation block covers all constraints tested (positivity, ordering, bounds)
- No concerns — implementation matches the brief exactly
