# AGENTS.md

## Repository Structure

Monorepo of "superpower" projects — each top-level directory is an independent project with its own `package.json`. There is no root-level workspace config.

**Active project:** `Eiffel Tower (superpower 2)/` — interactive 3D Eiffel Tower viewer.

## Developer Commands

All commands run from the project directory, not the repo root:

```bash
cd "Eiffel Tower (superpower 2)"

npm test              # run all tests (vitest run)
npm run build         # typecheck (tsc) + production build (vite build)
npm run dev           # dev server on localhost:5173
npm run preview       # serve production build
npx tsc --noEmit      # typecheck only
```

No lint, format, or pre-commit hooks are configured.

## Testing

- Framework: Vitest with `happy-dom` environment
- Test files: `src/**/*.test.ts` (co-located with source)
- Run a single test file: `npm test -- src/viewer/Viewer.test.ts`
- `happy-dom` has no WebGL support — tests that touch `WebGLRenderer` must mock it (see `src/viewer/Viewer.test.ts` and `src/viewer/EnvironmentTheme.test.ts` for patterns)
- Tests run with `globals: false` — import `describe`/`it`/`expect` from `vitest`

## Architecture

```
src/
  main.ts              # entrypoint
  App.ts               # wires viewer + UI + keyboard shortcuts
  viewer/              # Viewer (scene, lights, ground), CameraRig, EnvironmentTheme, WebGLGuard
  tower/
    Tower.ts           # assembles all builders
    builders/          # PierBuilder, ArchBuilder, PlatformBuilder, AntennaBuilder, LatticeBuilder
    materials/         # TowerMaterial (iron PBR)
  math/                # TowerProfile (curvature), LatticePattern (helpers)
  ui/                  # ThemeToggle, InfoOverlay, LoadingOverlay (pure DOM factories)
  controls/            # OrbitControlsSetup
```

- `buildTower()` in `src/tower/Tower.ts` is the composition root for geometry
- `Viewer` class in `src/viewer/Viewer.ts` owns the Three.js scene, renderer, and animation loop
- UI components are stateless DOM factories — no framework, no virtual DOM
- `EnvironmentTheme.applyTheme()` updates scene background AND lights (directional, hemisphere, ambient) for day/night

## Key Patterns

- `InstancedMesh` used for dense lattice members via `buildLattice()` in `src/tower/builders/LatticeBuilder.ts`
- Input validation throws on invalid parameters (see `LatticePattern.ts`, `LatticeBuilder.ts` for convention)
- `createIronMaterial()` from `src/tower/materials/TowerMaterial.ts` is the shared PBR material — use it instead of inline material creation
- Shadow map: `2048×2048` with `PCFSoftShadowMap`, `devicePixelRatio` capped at `2`

## Stack

- Three.js `^0.165.0` — 3D rendering
- Vite `^5.2.0` — dev server and bundler
- TypeScript `^5.4.0` — strict mode
- Vitest `^1.6.0` — testing
- No React, no CSS framework, no state management library
