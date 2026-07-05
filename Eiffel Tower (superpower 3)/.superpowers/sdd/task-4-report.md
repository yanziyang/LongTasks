# Task 4 Report: Custom ShaderMaterial with Vertex-Color Gradient

## What was implemented

Created `src/tower/materials.ts` with:

- **`createTowerMaterial()`** — A `THREE.ShaderMaterial` with:
  - Vertex shader passing `heightRatio` attribute to fragment shader
  - Fragment shader lerping between 3 Eiffel Tower browns (`TOWER_COLOR_LOWER`, `_MIDDLE`, `_UPPER`) based on height
  - Cook-Torrance BRDF for directional lighting (D: GGX, G: Smith-Schlick, F: Schlick approximation)
  - Hemisphere + ambient lighting contributions
  - Emissive golden glow (`vec3(0.831, 0.659, 0.263)`) for night mode
  - Sparkle effect via pseudo-random function modulating emission
  - Try/catch fallback for shader compile failure

- **`createTowerMaterialFallback()`** — Returns 3 `MeshStandardMaterial` (lower/middle/upper) with distinct iron colors

- **`antennaMaterial`** — A `MeshStandardMaterial` with dark antenna color

- **`setNightMode()`** — Toggles emissive glow, cool-tinted lighting, dark sky/ground colors

- **`updateSparkle()`** — Manages periodic sparkle bursts using `SPARKLE_INTERVAL_MS` / `SPARKLE_DURATION_MS` / `SPARKLE_ENTER_DURATION_MS` from constants

- **`updateLightDirection()`** — Syncs shader's light direction with scene's `DirectionalLight`

## TDD Evidence

### RED phase (`npm test` before implementation)
```
❯ tests/materials.test.ts (0 test)
FAIL  tests/materials.test.ts
Error: Failed to load url ../src/tower/materials ...
1 failed | 3 passed
```
— Tests failed because `src/tower/materials.ts` did not exist.

### GREEN phase (`npm test` after implementation)
```
✓ tests/materials.test.ts (9 tests)
4 passed | 33 passed
```
— All 9 materials tests pass + all existing tests.

## Files changed

| File | Action |
|------|--------|
| `src/tower/materials.ts` | Created |
| `tests/materials.test.ts` | Created |

## Test results

```
Test Files  4 passed (4)
     Tests  33 passed (33)
```

9 new tests all passing:
- `createTowerMaterial` — returns `ShaderMaterial`, has all required uniforms
- `createTowerMaterialFallback` — returns 3 `MeshStandardMaterial`, distinct colors
- `antennaMaterial` — is `MeshStandardMaterial`, dark color (r,g,b < 0.3)
- `setNightMode` — sets emissive intensity > 0 on, resets to 0 off
- `updateSparkle` — accepts elapsed time without throwing, does nothing when night mode off

## Self-review findings

- All exports match the interface spec (`createTowerMaterial`, `createTowerMaterialFallback`, `antennaMaterial`, `setNightMode`, `updateSparkle`, `updateLightDirection`)
- Fallback shader material is minimal (just in case of compile failure)
- `updateLightDirection` is exported but not directly tested (used by scene setup code)
- Shader uniforms use `value` wrappers as required by Three.js

## Concerns

None.
