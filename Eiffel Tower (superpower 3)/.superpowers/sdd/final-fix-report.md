# Final Review Fix Report

## Fixes Applied

### Issue 1: Duplicate .js files alongside .ts files
- Deleted all compiled `.js` files in `src/` and `tests/` that had corresponding `.ts` files
- Added `"noEmit": true` to `tsconfig.json` to prevent `tsc` from regenerating them

### Issue 2: LatticeBuilder shared geometry
- Added module-level `LATTICE_CYLINDER_GEO` (shared `CylinderGeometry`)
- `beamBetween` now clones and scales via `geo.scale(1, len, 1)` instead of creating per-beam geometry

### Issue 3: ShaderMaterial catch block
- Changed `createTowerMaterial()` return type to `THREE.ShaderMaterial | null`
- Catch block now returns `null` instead of a fallback ShaderMaterial
- `Tower.ts` updated to check `shaderMat instanceof THREE.ShaderMaterial` instead of checking vertexShader length

### Issue 4: Hardcoded height-ratio denominators
- `ArchBuilder.ts`: `heightRatios[i] = vertex.y / HEIGHT_TOP` (was `330`)
- `PlatformBuilder.ts`: `heightRatios[i] = vertex.y / HEIGHT_TOP` (was `301`)
- `CabinBuilder.ts`: `heightRatios[i] = vertex.y / HEIGHT_TOP` (was `301`)
- All import `HEIGHT_TOP` from constants

### Issue 5: beamBetween returns empty Mesh
- `beamBetween` in `LatticeBuilder.ts` and `ArchBuilder.ts` now returns `THREE.Mesh | null`
- Short spans (< 0.01) return `null`
- Call sites wrapped with `if (mesh) group.add(mesh)` guards

### Issue 6: Dead nightModeActive variable
- No `nightModeActive` variable existed — no action needed

### Issue 7: resetCamera hardcodes target Y
- `Viewer.ts` `resetCamera()` now uses `CAMERA_TARGET.y * SCENE_SCALE` instead of `1.5`

### Issue 8: buildCabin hardcodes height 276
- `CabinBuilder.ts` uses `PLATFORM_HEIGHTS[2]` instead of `276`

### Issue 9: Light direction uniform updated every frame
- Removed sun direction update from animate loop
- Added `setupLightDirection()` method called once after tower build
- Animate loop only updates sparkle during night mode

## Verification
- `npm test`: **53 tests passed** (7 test files)
- `npm run build`: **Build succeeded** (tsc + vite)
- No `.js` files regenerated (thanks to `noEmit: true`)

## Commit
- `e264a34` — `fix: address final review issues`
- Modified: 9 source files + 1 test file + 1 config
- Deleted: 2 tracked `.js` files
