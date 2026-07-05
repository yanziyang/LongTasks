# Eiffel Tower 3D Viewer — Design Spec

**Date:** 2026-07-05
**Status:** Approved (brainstorming complete)
**Goal:** Design in code a realistic Eiffel Tower, presented as an interactive 3D web viewer grounded in the tower's real engineering mathematics and dimensions.

---

## 1. Summary

An interactive 3D viewer that renders the Eiffel Tower in a browser using Three.js. The tower's silhouette is generated from Eiffel's constant-stress exponential curve, calibrated to the tower's real width-at-height points. The model includes the 4 splayed legs, section-aware lattice bracing, the 3 real platforms (57 m / 115 m / 276 m), and the top antenna (to 330 m). The viewer supports orbit/zoom/pan, a day/night toggle with the signature sparkle animation, and an info overlay showing real dimensions.

**Realism priority:** engineering-accurate — the curve, the proportions, and the platform heights are the source of truth. Visual appearance (iron-brown material, lighting) supports but does not override the math.

**Tech stack:** Vite + TypeScript + Three.js (vanilla, no framework).

---

## 2. Real Dimensions & the Curve (the foundation)

### 2.1 Encoded real-world facts

| Quantity | Value |
|---|---|
| Total height | 330 m (300 m original top + 30 m antenna) |
| Base | square, 125 m per side → half-width **62.5 m** at ground |
| Platform 1 | 57 m, ~65 m square → half-width **32.5 m** |
| Platform 2 | 115 m |
| Platform 3 | 276 m, ~18 m square → half-width **9 m** |
| Top (z = 300 m) | 4 legs converge to a small square (a few meters) |

### 2.2 The curve

Eiffel designed the silhouette so the wind-bending moment plus the tower's own weight produces constant stress at every height. The closed form satisfying that condition is an exponential decay of half-width with height:

```
w(z) = wTop + (wBase - wTop) * exp(-k * z)
```

Calibrated against the known width-at-height points:
- `w(0) = 62.5 m` (base)
- `w(57) ≈ 32.5 m` (1st platform)
- `w(276) ≈ 9 m` (3rd platform)
- `w(300) = wTop` (small top)

Solving for `k` and `wTop` from two points pins the curve; the remaining point serves as a **verification check** (a genuinely engineering-accurate test: does the constant-stress curve actually pass through all the real intermediate points?).

The horizontal cross-section at every height is a **square** of half-width `w(z)`. The 4 legs are the 4 corners of that shrinking square.

This is a pure function — no Three.js dependency — fully unit-testable against the real dimensions above.

---

## 3. Tower Geometry Generation (the heart)

The profile function `w(z)` produces a shrinking square at every height. We sample it into **rings** and build three kinds of geometry.

### 3.1 Ring sampling

Pick `N` height samples (≈ 120 across the full tower, denser near the base where the curve bends most). At each sample we get 4 corner points — the leg positions at that height. This is the spine of the whole model.

### 3.2 The 4 edge beams

For each of the 4 corners, build a continuous beam from `z = 0` to `z = 300` following that corner's curve. These are the main load-bearing piers — the four dark "edges" seen on the real tower. Implementation: a `TubeGeometry` built along a `CatmullRomCurve3` passing through that corner's sampled points, with a small fixed radius (the pier thickness).

### 3.3 Section-aware lattice (the X-bracing)

Bracing pattern on each of the 4 faces varies by the 3 real sections, matching the real tower:

- **Base → 57 m:** large decorative X's with a few horizontal ties. Legs splay most here, so each X is tall and dramatic.
- **57 m → 115 m:** regular X-bracing, medium density.
- **115 m → 276 m:** simpler X's, sparser. Legs are nearly parallel up high.

Generation is per-face between adjacent rings: for each pair of rings `(i, i+1)`, place an X (two diagonal beams) plus a horizontal beam. Density is tuned per section by controlling which ring-pairs get an X vs. just a tie. Section boundaries come from the real platform heights (57 / 115 / 276) — no magic numbers.

### 3.4 The 3 platforms

At `z = 57, 115, 276`, add a square slab at width `w(z)` — a thin `BoxGeometry` per platform, plus a slightly thicker edge rail. These are the deck plates seen from below.

### 3.5 The antenna

A simple tapered cylinder from `z = 300` to `z = 330`, plus a thin tip. Distinct material (darker metal).

### 3.6 Materials

- A single iron-brown `MeshStandardMaterial` for the structure (`#6B5B47`-ish, low metalness, moderate roughness — puddle-iron look).
- A separate darker metal material for the antenna.
- Night mode swaps to an emissive material variant and adds point lights for the sparkle (see §4).

### 3.7 Coordinate & scale

Build in **meters** (real units), then scale the whole scene down by `1/100` so the tower is ~3.3 units tall — comfortable for a default camera. This keeps the math honest (`w(115)` reads in real meters) while the rendered scene is well-sized.

---

## 4. Scene, Interactivity & Rendering

### 4.1 Scene setup

A `WebGLRenderer` with physically-correct lighting. A subtle ground plane (dark, low-roughness) so the tower's base reads as grounded. Sky as a gradient background (day: pale blue; night: deep navy).

Camera default: positioned at the equivalent of ~600 m orbit radius, ~120 m height in real-world terms — far enough to see the whole tower, close enough to read lattice. (Because the scene is scaled by 1/100 per §3.7, the actual `camera.position` values are ~6 and ~1.2 in scene units; the bounds and zoom limits in §4.4 are likewise expressed in scene units.)

### 4.2 Lighting

**Day:**
- A single `DirectionalLight` as the sun (warm, from upper-left) + low ambient.
- The lattice casts real shadow lines on itself and the ground — this is where the tower's character shows.

**Night:**
- Ambient dropped near zero.
- The iron material swaps to a warm emissive tone.
- A grid of small `PointLight`s along the structure produces the sparkle.

### 4.3 The sparkle

On entering night mode, schedule a 5-second window every 60 seconds where:
1. The structure's emissive intensity ramps up.
2. ~40 small point lights distributed along the tower fire in a randomized shimmer.

After the window, back to steady warm glow. This is the one piece of animation that sells "night" beyond just being dark. (The real tower's sparkle runs for 5 minutes each hour; compressed here for demo satisfaction.)

### 4.4 Camera controls

`OrbitControls` with damping for smooth feel. Zoom range clamped so the user can't go inside the lattice or fly off into nothing. Pan enabled but bounded.

### 4.5 Info overlay (HTML, not 3D)

A small absolutely-positioned panel over the canvas showing real dimensions:
- Total height: 330 m (300 m + 30 m antenna)
- Base: 125 × 125 m
- Platforms: 57 m / 115 m / 276 m
- ~18,000 iron pieces / 7,300 tonnes (real figures, shown as trivia)

### 4.6 Day/night toggle

An HTML button (top-right) that swaps the sky, lighting, and material variant and triggers the sparkle animation. Pure state, no scene rebuild — we keep two `Material` instances per part and swap `.material` references.

---

## 5. Project Structure, Testing & Error Handling

### 5.1 Project layout

```
eiffel-tower/
├── index.html                 # Vite entry, canvas + overlay markup
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.ts                # bootstraps renderer, scene, controls, animation loop
│   ├── scene/
│   │   ├── SceneBuilder.ts    # assembles the THREE.Scene (tower + lights + ground + sky)
│   │   ├── Lighting.ts        # day/night lighting rigs + sparkle driver
│   │   └── Controls.ts        # OrbitControls wrapper with bounds
│   ├── tower/
│   │   ├── profile.ts         # w(z) curve + calibration (pure math)
│   │   ├── geometry.ts        # consumes w(z) -> THREE.Group
│   │   └── materials.ts       # iron + antenna + night material factories
│   ├── ui/
│   │   ├── Overlay.ts         # the info panel (real dimensions)
│   │   └── DayNightToggle.ts  # the toggle button + state
│   └── constants.ts           # all real dimensions in one place (single source of truth)
└── tests/
    └── profile.test.ts        # unit tests for w(z) against real dimensions
```

### 5.2 Constants as single source of truth

`constants.ts` holds every real dimension: `BASE_HALF_WIDTH = 62.5`, `HEIGHT = 330`, `PLATFORM_HEIGHTS = [57, 115, 276]`, etc. Both the geometry and the overlay read from it — the displayed dimensions can never drift from the modeled ones. This is the engineering-accurate discipline made concrete.

### 5.3 Testing

Vitest. The only pure-math unit is `profile.ts`, and it's the load-bearing piece — so it gets real tests:

- `w(0) === 62.5` (base)
- `w(57)` within tolerance of `32.5`
- `w(115)` and `w(276)` match their known platform widths
- `w(300)` equals the calibrated top width
- Monotonically decreasing, no NaN/inf

The rest (geometry, scene, UI) is Three.js object assembly — verified by running the dev server and eyeballing the render, not by unit tests. Test coverage is targeted where it earns its keep.

### 5.4 Error handling — minimal and targeted

No try/catch theatre. Just:

- **WebGL context loss** → log a clear message and stop the animation loop. Browsers do this under memory pressure; recovery adds complexity for a demo that won't be left running.
- **Bad constants** (e.g. `BASE_HALF_WIDTH <= 0`) → throw at module load in `constants.ts` so it fails loud and early, in dev, not silently at render time.

### 5.5 Verification

Three commands must all pass before the work is called done:

- `npm run dev` — opens the viewer; tower renders, orbit works, day/night toggles, overlay shows correct figures.
- `npm run build` — confirms it compiles for production.
- `npm test` — runs the profile unit tests.
