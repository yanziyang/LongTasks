# AGENTS.md

## Commands

```pwsh
npm run dev       # vite dev server (--open, localhost:5173)
npm run build     # tsc typecheck + vite bundle (must pass both)
npm run preview   # serve production build
npm test          # vitest run (single pass)
npx tsc --noEmit  # typecheck only
npx vitest run tests/constants.test.ts  # single test file
```

`npm run build` runs `tsc` first — `noUnusedLocals` and `noUnusedParameters` are enabled. Unused imports block the build.

## Architecture

```
src/
  main.ts                  # entry: WebGL check → App.start()
  App.ts                   # wires Viewer + UI + keyboard shortcuts (R/T/I)
  constants.ts             # every real-world dimension — single source of truth
  viewer/                  # Viewer, EnvironmentTheme, CameraRig
  tower/
    Tower.ts               # buildTower() — composition root
    profile.ts             # pure math: w(z) exponential curve (no Three.js dep)
    materials.ts           # custom GLSL ShaderMaterial (3-tone gradient + sparkle)
    builders/
      LegTrussBuilder.ts   # 4 independent truss legs, 0-57m
      InterLegLatticeBuilder.ts  # merged body 57-300m + curved arch panels 0-57m
      PlatformBuilder.ts   # decks + railings at 57/115/276m
      CabinBuilder.ts      # summit enclosure
      AntennaBuilder.ts    # tapered mast 300-330m
  controls/                # OrbitControlsSetup
  ui/                      # ThemeToggle, InfoOverlay, LoadingOverlay
```

**Two-phase geometry:** Below 57m, four independent square lattice trusses (4 chords each, X-bracing on all faces). At 57m they merge into a single body lattice with 3-tier density.

## Critical Patterns

### heightRatio vertex attribute

The custom ShaderMaterial reads `attribute float heightRatio` to produce the 3-tone graduated paint. **Every builder MUST set this attribute on all meshes it creates.** Use the established pattern:

```typescript
group.updateMatrixWorld();  // ← required before traverse
group.traverse((child) => {
  if (child instanceof THREE.Mesh && child.geometry.attributes.position) {
    const positions = child.geometry.attributes.position;
    const heightRatios = new Float32Array(positions.count);
    const vertex = new THREE.Vector3();
    const matrix = child.matrixWorld;
    for (let i = 0; i < positions.count; i++) {
      vertex.set(positions.getX(i), positions.getY(i), positions.getZ(i));
      vertex.applyMatrix4(matrix);
      heightRatios[i] = vertex.y / HEIGHT_TOP;  // 300, not 330
    }
    child.geometry.setAttribute('heightRatio', new THREE.BufferAttribute(heightRatios, 1));
  }
});
```

Omit `updateMatrixWorld()` and the attribute will be zero on rotated meshes.

### beamBetween helper

Both builders duplicate `beamBetween` intentionally (builder independence). It shares a module-level `CYLINDER_GEO` that is cloned per beam:

```typescript
const CYLINDER_GEO = new THREE.CylinderGeometry(1, 1, 1, 6);

function beamBetween(a: THREE.Vector3, b: THREE.Vector3, mat: THREE.Material, radius: number): THREE.Mesh | null {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  if (len < 0.01) return null;
  const geo = CYLINDER_GEO.clone();
  geo.scale(radius, len, radius);
  // ... position and orient
  return mesh;
}
```

Returns `Mesh | null` — callers must null-guard before `group.add()`.

### Builder interface

Every builder exports a function with this signature:

```typescript
(materials: THREE.Material[] | THREE.Material, fallback: boolean): THREE.Group
```

- `fallback = true` → use `materials[section]` (the 3-zone MeshStandardMaterial array)
- `fallback = false` → use `materials` as the single ShaderMaterial
- Return empty `Group` on missing/invalid inputs

### Shader fallback

`createTowerMaterial()` returns `THREE.Material` — Tower.ts checks `instanceof THREE.ShaderMaterial`. If the shader fails to compile, the three-zone `MeshStandardMaterial` array is used instead.

### Constants

All dimensions in `constants.ts`. New constants must include runtime validation. The tower is built in real meters then scaled by `SCENE_SCALE = 0.01` in Tower.ts.

## Testing

- Vitest, Node environment (no DOM by default)
- `smoke.test.ts` shows the jsdom setup pattern for tests that need DOM globals
- Builder tests verify mesh count thresholds, bounding box spans, and `heightRatio` attribute presence — not exact geometry positions
- `profile.test.ts` is the only pure-math unit (tests real-world anchor dimensions)

## Documentation

- `docs/superpowers/specs/` — design specifications
- `docs/superpowers/plans/` — implementation plans
- `skills-lock.json` — Superpowers skill definitions (do not edit)
