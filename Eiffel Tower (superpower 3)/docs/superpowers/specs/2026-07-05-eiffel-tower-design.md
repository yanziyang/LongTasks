# Eiffel Tower 3D Viewer — Design Spec

**Date:** 2026-07-05
**Status:** Approved (brainstorming complete)
**Goal:** A fully procedural 3D Eiffel Tower built in Three.js — no models, every girder generated from code using the tower's real proportions.

---

## 1. Architecture & File Structure

```
src/
  main.ts                    # Bootstrap: WebGL check, mount App
  App.ts                     # Top-level controller (viewer + UI + keyboard)
  constants.ts               # All real-world dimensions, single source of truth

  viewer/
    Viewer.ts                # Scene, renderer, camera, animation loop
    EnvironmentTheme.ts      # Day/night theme config (colors, intensities)
    CameraRig.ts             # Initial framing, speed-priority auto-rotation

  tower/
    Tower.ts                 # Top-level assembler: composes all builders into one Group
    profile.ts               # w(z) exponential decay — pure function, no Three.js dep
    materials.ts             # Custom ShaderMaterial factory (vertex color gradient + PBR)

    builders/
      LegBuilder.ts          # 4 curved edge beams following w(z), with pier cross-bracing
      LatticeBuilder.ts      # X-braced panels per face, density per section (0→57, 57→115, 115→276)
      ArchBuilder.ts         # Diagram-accurate double-ring trusses between legs at base
      PlatformBuilder.ts     # Deck + railing at each of 3 heights
      CabinBuilder.ts        # Summit enclosure at ~276-300m
      AntennaBuilder.ts      # Tapered mast 300-330m

  ui/
    ThemeToggle.ts           # Day/night button + state
    InfoOverlay.ts           # Dimension trivia panel, collapsible
    LoadingOverlay.ts        # "Building tower..." spinner during generation

  controls/
    OrbitControlsSetup.ts    # Damped orbit with limits + speed-priority auto-rotation
```

Key design rules:
- `constants.ts` is the single source of truth for `BASE_HALF_WIDTH`, `PLATFORM_HEIGHTS`, `HEIGHT_TOP`, `ANTENNA_HEIGHT`, etc. Both geometry and overlay read from it.
- `profile.ts` is pure math, fully unit-testable against the real dimensions.
- Each builder returns a `THREE.Group` (or `THREE.InstancedMesh` for lattice). `Tower.ts` composes them — if one builder fails, the rest still render.
- Materials live in a single `materials.ts` that produces the `ShaderMaterial` with the 3-brown vertex-color gradient. All builders share one material instance (except the antenna, which gets its own darker variant).

---

## 2. Tower Geometry

### 2.1 Profile (profile.ts)

Same exponential curve as prior iterations — `w(z) = wTop + (wBase - wTop) * exp(-k * z)` — calibrated against real width-at-height anchor points. Eiffel's constant-stress design produces this exponential decay of half-width with height.

**Real-world anchor points (encoded in constants.ts):**

| Quantity | Value |
|---|---|
| Total height | 330 m (300 m original top + 30 m antenna) |
| Base half-width | 62.5 m (125 m square base) |
| Platform 1 (57 m) half-width | 32.5 m |
| Platform 2 (115 m) | — verification point |
| Platform 3 (276 m) half-width | 9 m |

The curve is calibrated by solving for `k` and `wTop` from the platform 1 and platform 3 anchor points, with platform 2 serving as a verification check.

### 2.2 Legs (LegBuilder.ts)

Four corner curves sampled at ~150 heights (denser near base where curvature is greatest). Each leg is a thick tubular edge beam following the profile curve, plus internal cross-bracing between the four corner chords of each pier. Legs are structurally independent pylons below 57 m; above the first platform they merge into a single unified lattice body.

### 2.3 Lattice (LatticeBuilder.ts)

Per-face X-bracing between adjacent ring pairs, with density tiers matching the real tower's visual pattern:

| Zone | Heights | Density |
|------|---------|---------|
| Lower | 0 → 57 m | High — tall dramatic X-panels, horizontal ties every ring |
| Middle | 57 → 115 m | Medium — regular X-bracing |
| Upper | 115 → 276 m | Low — sparser X's, legs nearly parallel |

Uses `InstancedMesh` for repeated lattice members to keep draw calls manageable.

### 2.4 Arches (ArchBuilder.ts)

Four trussed double-ring arches connecting adjacent legs at ground level, matching the construction diagram. Two parallel curved rings with radial connector struts and diagonal cross-bracing between them. Tuned to match the reference diagram's strut count and ring separation.

### 2.5 Platforms (PlatformBuilder.ts)

Three square slabs at `z = 57, 115, 276 m`, each at the current profile width `w(z)`. Each has an edge rail (thin box loop) and a slightly recessed deck plate. The first platform is the largest; the third is a small observatory-level deck.

### 2.6 Cabin (CabinBuilder.ts)

Summit enclosure: a small boxed cabin above the third platform (~276–300 m), representing the enclosed observation room and mechanical spaces at the tower's top.

### 2.7 Antenna (AntennaBuilder.ts)

Tapered cylinder from 300 m to 330 m with a thin tip. Uses a darker metallic material variant (not the gradient shader).

### 2.8 Materials (materials.ts)

A single custom `ShaderMaterial` using vertex colors. At geometry build time, each vertex receives a `heightRatio` (0 at base, 1 at summit) baked into a vertex color attribute. The fragment shader lerps between three Eiffel Tower browns:

- **Lower brown** (darkest, base): `#5A3D2B`
- **Middle brown**: `#6B5B47`
- **Upper brown** (lightest, summit): `#7A6E5D`

Uses a simplified Cook-Torrance BRDF model so the custom shader still supports:
- Directional light with shadow mapping
- Hemisphere + ambient contributions
- Night-mode emissive pass for the golden glow and sparkle

If the custom shader fails to compile at runtime, fall back to three separate `MeshStandardMaterial` instances per zone (without the smooth gradient transition).

---

## 3. Scene, Lighting & Environment

### 3.1 Scene Composition

- **Ground:** Large circular disk (~600 m radius) with `ShadowMaterial` — receives shadows only, no self-shadowing. Center-aligned with the tower base.
- **Background:** Tied to the active theme — light blue-to-white gradient for day, deep navy-to-black for night.
- **Fog:** Light exponential fog, tied to theme. Just enough for atmospheric depth without obscuring lattice at orbit distance.
- **No skybox, no terrain, no surroundings.** Just the tower on a shadow plane.

### 3.2 Day Lighting

| Light | Color | Intensity | Shadows |
|---|---|---|---|
| Directional (sun) | `#FFF5E6` | 2.0 | Yes, 2048x2048 PCFSoft |
| Hemisphere | sky `#87CEEB` / ground `#7A7A7A` | 0.6 | No |
| Ambient | — | 0.1 | No |

### 3.3 Night Lighting

| Light | Color | Intensity | Shadows |
|---|---|---|---|
| Directional (moon) | `#C8D8FF` | 0.4 | Yes, 2048x2048 PCFSoft |
| Hemisphere | sky `#1A2A4A` / ground `#050505` | 0.2 | No |
| Ambient | — | 0.05 | No |
| Beacon PointLight | warm white | 2.0 | No (near antenna tip) |

The tower's custom shader material switches to an emissive mode at night — a warm golden glow (`#D4A843`) with emissive intensity keyed to the sparkle cycle.

### 3.4 Sparkle Effect

The real Eiffel Tower's hourly light show runs for 5 minutes at the top of each hour. For the viewer, a compressed schedule:

- **On entering night mode:** Sparkle fires immediately for ~10 seconds.
- **Ongoing loop:** ~20 seconds of sparkle every 3 minutes while in night mode.
- **During a sparkle window:** Emissive intensity ramps up over 2 seconds, a randomized shimmer pattern plays across the tower (vertex-level emission variation, reusing per-vertex height data), then ramps down over 2 seconds.
- **Implementation:** The custom shader's emission term is modulated per-vertex by a pseudo-random seed updated each frame during the sparkle window. A subset of vertices twinkle each frame to create the appearance of scattered, moving sparkle lights.

### 3.5 Auto-Rotation (CameraRig.ts)

Speed-priority blend model:
- Default orbit auto-rotation at ~0.15 rad/min (one full revolution per ~42 minutes).
- User drag subtracts from the accumulated auto-rotation angle proportionally to drag magnitude — the tower yields to the user's input direction.
- On release, auto-rotation smoothly recovers its speed over ~3 seconds.
- The blend means drag doesn't abruptly stop auto-rotation; it nudges the effective rotation rate, producing a fluid handoff.

### 3.6 Camera Framing

- Initial position: approximately (250, 120, 250) in real-world meters, looking toward tower center.
- Orbit target: (0, 150, 0) — around first-platform height.
- Min/max distance clamped to keep the user from clipping inside the lattice or flying too far out.
- Scene is built in meters, then scaled by 1/100 so the tower is ~3.3 units tall in scene space.

---

## 4. UI & Interactivity

### 4.1 Orbit Controls

- Left-drag: rotate. Right-drag: pan. Scroll/pinch: zoom.
- Damping enabled (`dampingFactor = 0.05`).
- Polar angle clamped to stay above ground plane.

### 4.2 Day/Night Toggle

- HTML button, top-right corner, sun/moon icon.
- Toggles theme and triggers the night-mode sparkle cycle on entry.
- Keyboard shortcut: `T`.
- 300 ms debounce to prevent rapid-toggle glitches.

### 4.3 Info Overlay

- Semi-transparent panel, bottom-left, collapsible.
- Displays real dimensions read from `constants.ts`: total height 330 m, base 125x125 m, platform heights (57/115/276 m), piece count (~18,000), weight (~7,300 tonnes).
- Toggle button for show/hide. Keyboard shortcut: `I`.

### 4.4 Loading Overlay

- Full-canvas spinner with "Building tower..." text.
- Dismissed after the first rendered frame.

### 4.5 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `R` | Reset camera |
| `T` | Toggle theme |
| `I` | Toggle info overlay |

### 4.6 Responsiveness

- Desktop-first. Canvas fills viewport. UI elements use viewport-relative positioning. Mobile pinch-to-zoom inherited from orbit controls; no mobile-specific layout optimization in scope.

---

## 5. Error Handling & Edge Cases

- **WebGL unsupported:** On load, check for WebGL context. If unavailable, show a fallback message ("Your browser doesn't support WebGL") instead of a blank canvas.
- **WebGL context lost:** Listen for `webglcontextlost`. Stop the animation loop, show a reload prompt on the canvas.
- **Shader compilation failure:** The custom gradient `ShaderMaterial` has a fallback path — if it fails to compile, use three separate `MeshStandardMaterial` instances per height zone so the tower still renders.
- **Geometry generation:** Each builder validates its inputs. If a builder fails, it returns an empty `Group` and logs the error — the rest of the tower still renders. The loading spinner dismisses regardless.
- **Performance guard:** Cap `devicePixelRatio` at `2`. Shadow map at `2048`. Lattice uses `InstancedMesh`.
- **Theme switching:** Debounce at 300 ms. Fall back to known-good day state if theme config is missing or invalid.

---

## 6. Testing Strategy

### 6.1 Unit Tests (Vitest)

- **profile.ts:** `w(0) === 62.5`, `w(57)` within tolerance of `32.5`, `w(276) === 9`, monotonic decreasing, no NaN/Inf, valid for all heights `[0, 300]`.
- **constants.ts:** Validated at import time — no negative or zero values, platform heights are ascending, total height > antenna height.
- **Builders:** Each returns a valid `THREE.Group` or `THREE.InstancedMesh` with non-empty bounding box for valid inputs. Returns empty group (no throw) for invalid inputs.
- **EnvironmentTheme:** Applying a theme updates all light colors and intensities correctly.

### 6.2 Integration Tests

- Smoke test: mounting `App` produces a scene containing the tower group and the animation loop runs. Use a mocked WebGL context.

### 6.3 Visual Regression (Optional, Not V1)

- Puppeteer/Playwright screenshot capture against baseline. Deferred.

### 6.4 Manual Verification

- Orbit controls are smooth.
- Day/night toggle updates lighting, background, and sparkle correctly.
- Shadows under the tower move with the sun direction.
- Info overlay content matches `constants.ts` values.
- All keyboard shortcuts work.
- Auto-rotation blend feels fluid during and after drag.

---

## 7. Verification Commands

Three commands must pass before the work is called done:

1. `npm run dev` — Opens the viewer; tower renders; orbit works; day/night toggles with sparkle; overlay shows correct data.
2. `npm run build` — Production build succeeds without errors.
3. `npm test` — All unit and integration tests pass.

---

## 8. Tech Stack

- **Runtime:** TypeScript + Three.js (vanilla, no framework)
- **Bundler:** Vite
- **Testing:** Vitest
- **Target:** Desktop browsers with WebGL support
