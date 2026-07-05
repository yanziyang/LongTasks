# AGENTS.md

## Project Structure

Three standalone Three.js Eiffel Tower projects — not a true monorepo. No root `package.json`. Each directory is independent.

| Project | Description |
|---|---|
| `Eiffel Tower (superpower 1)/` | Simplified tube legs + X-lattice |
| `Eiffel Tower (superpower 2)/` | Intermediate InstancedMesh approach |
| `Eiffel Tower (superpower 3)/` | **Active** — engineering model: 4-chord truss legs, density-tiered lattice, custom GLSL shader |

See `README.md` for a full comparison and `Prompt.md` for original prompts and model assignments.

## Critical: Directory Names Have Spaces

Always quote paths in PowerShell:

```pwsh
cd "Eiffel Tower (superpower 3)"
npm test
```

When using the `bash` tool, use the `workdir` parameter instead of `cd`.

## Commands (identical across all projects)

Run from within a project directory:

```pwsh
npm run dev           # vite dev server (--open)
npm run build         # tsc (typecheck) + vite bundle
npm run preview       # serve production build
npm test              # vitest run (single pass)
npx tsc --noEmit      # typecheck only
```

`npm run build` runs `tsc` first, then `vite build`. TypeScript errors block the build. `tsconfig.json` has `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`.

No lint, format, or pre-commit hooks exist in any project.

## Testing

- All projects use Vitest with `vitest run` (single pass, no watch)
- Test files live in `tests/` directory
- No global DOM environment configured in vitest config — Node is the default
- Tests that create Three.js objects need DOM/WebGL mocks (see `tests/smoke.test.ts` for the jsdom pattern)
- Run a single test file: `npx vitest run tests/constants.test.ts`

## Superpower 3 (Active Project) — Key Architecture

**Tower composition root:** `src/tower/Tower.ts` — `buildTower()` assembles all geometry.

**Builders:**
- `src/tower/builders/LegTrussBuilder.ts` — 4 independent square lattice truss legs (0–57m), 4 chords per leg, X-bracing on all faces
- `src/tower/builders/InterLegLatticeBuilder.ts` — merged body lattice (57–300m) with 3-tier density + curved arch panels (0–57m)
- `src/tower/builders/PlatformBuilder.ts` — 3 platforms at 57/115/276m
- `src/tower/builders/CabinBuilder.ts` — summit enclosure
- `src/tower/builders/AntennaBuilder.ts` — tapered mast 300–330m

Old builders (`LegBuilder`, `LatticeBuilder`, `ArchBuilder`) were deleted — do not restore them.

**Custom shader:** `src/tower/materials.ts` contains GLSL code for the 3-brown graduated paint (`vertexShader` + `fragmentShader` constants). The shader uses a `heightRatio` vertex attribute — all builders set this via `vertex.applyMatrix4(matrix)` traverses. If shader compilation fails, Tower.ts falls back to three `MeshStandardMaterial` zone variants.

**Shared geometry pattern:** `beamBetween(a, b, mat, radius)` clones a module-level `CYLINDER_GEO` then sets `geo.scale(radius, len, radius)`. Reuse this pattern for all new beam members.

**Constants:** `src/constants.ts` is the single source of truth for all dimensions. New constants must include runtime validation. The tower is built in meters then scaled by `SCENE_SCALE = 0.01`.

## Per-Project AGENTS.md Files

- `Eiffel Tower (superpower 2)/AGENTS.md` — detailed architecture, key patterns, testing notes for that project
- Superpower 1 has no project-specific AGENTS.md
