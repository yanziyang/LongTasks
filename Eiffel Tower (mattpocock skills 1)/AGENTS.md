# Eiffel Tower

Structurally-accurate 3D Eiffel Tower built in Three.js with PBR materials, day/night themes, and a simplified Parisian ground plane. No frameworks — vanilla TypeScript with a Vite toolchain.

## Tech stack

- **Runtime**: TypeScript 5.5 (strict mode), Vite 5.4, Three.js 0.169
- **Testing**: Vitest 2.1 + jsdom 29.1 (DOM mock, no real WebGL context)
- **3D**: `MeshStandardMaterial` (PBR), orbit controls, shadow maps (PCF soft), procedural textures (no external image assets)
- **No frameworks**: DOM UI is positioned absolutely; no React/Vue/etc.
- **Target**: ES2022, module resolution "bundler", no emit (`tsc` for type-checking only)

## Scripts

| Command         | Runs                                        |
| --------------- | ------------------------------------------- |
| `npm run dev`   | `vite --open` — dev server + open browser   |
| `npm run build` | `tsc && vite build` — type-check then bundle |
| `npm run test`  | `vitest run` — run tests once               |
| `npm run preview` | `vite preview` — serve production build   |

## Architecture

```
src/
├── main.ts              # Entry: WebGL check → App instantiation
├── App.ts               # Wires Viewer + UI, keyboard shortcuts (R/T/I)
├── constants.ts         # All numeric/color constants, runtime validation
├── viewer/
│   ├── Viewer.ts        # Render loop, scene, resize, context-loss recovery
│   ├── CameraRig.ts     # Camera factory, auto-rotation state machine
│   └── EnvironmentTheme.ts  # Day/night switch (lights, fog, sky, materials)
├── controls/
│   └── OrbitControlsSetup.ts  # Orbit controls with damping, limits, auto-rotate
├── tower/
│   ├── Tower.ts         # Main assembly: calls all builders, vertex colors, scale
│   ├── profile.ts       # Exponential profile w(h) calibrated to 3 real-world anchors
│   ├── materials.ts     # PBR materials, night mode, sparkle/twinkle system
│   ├── vertexColors.ts  # 3-tone brown paint gradient via per-vertex height
│   └── builders/
│       ├── LegTrussBuilder.ts
│       ├── InterLegLatticeBuilder.ts
│       ├── PlatformBuilder.ts
│       ├── Pavilion1stBuilder.ts
│       ├── Pavilion2ndBuilder.ts
│       ├── CabinBuilder.ts
│       ├── AntennaBuilder.ts
│       ├── ElevatorBuilder.ts
│       ├── SpiralStaircaseBuilder.ts
│       ├── EsplanadeBuilder.ts
│       └── GroundPlaneBuilder.ts
└── ui/
    ├── InfoOverlay.ts       # Tower statistics overlay
    ├── ThemeToggle.ts       # Day/night toggle button
    └── LoadingOverlay.ts    # "Building tower..." loading screen
```

**Flow**: `main.ts` checks WebGL → creates `App` (which creates `Viewer` + UI) → `Viewer` creates scene, lights, camera, renderer → `Tower.buildTower()` orchestrates all 11 builders → `Viewer.animate()` runs the render loop.

**Keyboard**: `R` resets camera, `T` toggles day/night, `I` toggles info overlay.

## Testing

- **10 test files** in `tests/`: smoke, tower, profile, constants, materials, leg-truss, inter-leg-lattice, builders, environment.
- Setup (`tests/setup.ts`): JSDOM globals, stubs `requestAnimationFrame`/`performance.now`, mocks WebGL context to null.
- Config: `vitest.config.ts` resolves `.ts`/`.js`, runs setup file before all tests.
- Integration test (`tower.test.ts`): verifies >2000 meshes, correct materials, scale factor.
- Run: `npm test`

## Domain vocabulary

Defined in `CONTEXT.md`. Key terms to use in code and comments:

| Term | What it is | Avoid |
| ---- | ---------- | ----- |
| Leg Truss | One of four lattice trusses (0m–57m) | Leg, pillar, column |
| Body Lattice | Merged lattice (57m–300m), 3-tier density | Upper lattice |
| Chord | Main longitudinal member | Column, beam |
| Strut | Horizontal member in a ring plane | Tie, crossbeam |
| Brace | Diagonal X/K-bracing member | Diagonal |
| Bay | One repeating vertical truss module | Panel, segment |
| Profile | `profile(h)` exponential half-width function | Silhouette |
| Platform | Viewing deck at 57/115/276m | Deck, floor |
| Pier | Masonry truncated pyramid under each leg | Foundation, footing |
| Gusset | Joint plate at chord-brace intersections | Joint plate |
| Paint Gradient | 3-tone brown vertex-color gradient | Color zones |

Full glossary at `CONTEXT.md` (~100 terms).

## Conventions

- **Strict mode**: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` all on. Dead code prevents build.
- **No comments** unless genuinely clarifying non-obvious logic.
- **Builders return `{ meshes: Group, materials: Material[] }`** — the `Tower` assembler expects this shape.
- **Constants live in `src/constants.ts`** with runtime validation. No magic numbers.
- **All distances are in real-world meters** scaled by `SCENE_SCALE` (0.01) in `Tower.ts`.
- **Three.js r169** API: use `THREE.` or named imports (both work in this codebase).

## Agent skills

### Issue tracker

GitHub Issues (yanziyang/LongTasks), no PR triage. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout. See `docs/agents/domain.md`.
