# Eiffel Tower — Interactive 3D Web Viewer Design Spec

## 1. Goal

Build a desktop-first, interactive 3D web viewer of the Eiffel Tower with diagram-matched structural fidelity. The viewer focuses on the tower itself with a minimal environment.

## 2. Constraints & Preferences

- **Scope**: Interactive 3D web viewer only (not a construction animation or static render).
- **Fidelity**: Diagram-matched structural detail, especially for piers, arches, platforms, and lattice work.
- **Environment**: Minimal — ground plane + shadow catcher only. No Champ de Mars/Trocadéro surroundings.
- **Feature set**: Reuse previous viewer features:
  - Orbit controls
  - Day/night toggle
  - Info overlay
- **Stack**: TypeScript + Three.js + Vite + Vitest.
- **Target**: Desktop-first; prioritize visual fidelity over mobile performance.

## 3. Approach

**Hybrid: procedural core + reference-tuned details.**

- Procedural parametric skeleton generates the four piers, main lattice, and taper.
- Hand-tuned detail modules add accurate arches, platforms, railing, and antenna based on the reference diagrams.
- This balances repeatability with the ability to match the construction diagrams precisely.

## 4. Architecture & File Structure

```
src/
  main.ts                 # Entry point: bootstrap Vite app, mount viewer
  App.ts                  # High-level application controller
  viewer/
    Viewer.ts             # Scene, camera, renderer, animation loop
    EnvironmentTheme.ts   # Day/night theme config & applicator
    CameraRig.ts          # Initial framing + reset behavior
  tower/
    Tower.ts              # Assembles all tower parts into one group
    TowerParameters.ts    # Shared dimensions, counts, materials
    builders/
      PierBuilder.ts      # Procedural pier with curved profile and lattice
      ArchBuilder.ts      # First-level arches between piers
      PlatformBuilder.ts  # First and second platforms
      LatticeBuilder.ts   # Reusable lattice generator (InstancedMesh)
      AntennaBuilder.ts   # Top antenna/spire
      RivetBuilder.ts     # Optional rivet/bolt detail
    materials/
      TowerMaterial.ts    # Wrought-iron brown-grey PBR material
  ui/
    InfoOverlay.ts        # Collapsible info panel
    ThemeToggle.ts        # Day/night button
    LoadingOverlay.ts     # Spinner during geometry generation
  controls/
    OrbitControlsSetup.ts # Damped orbit controls with limits
  math/
    TowerProfile.ts       # Curvature / taper interpolation
    LatticePattern.ts     # Lattice coordinate helpers
  tests/
    *.test.ts             # Vitest unit + integration tests
```

## 5. Tower Geometry

### 5.1 Overall proportions

| Feature | Value |
|---------|-------|
| Total height (including antenna) | ~330 m |
| Base square width | ~125 m |
| First platform height | ~57 m |
| Second platform height | ~115 m |
| Third platform / observatory | ~276 m |

All values are approximate and tuned against the reference diagrams.

### 5.2 Piers

- Four piers start at the corners of a square base and curve inward as they rise.
- Profile is driven by a parametric curve `TowerProfile.getPierCenter(height)`.
- Each pier is composed of:
  - Four corner chords (large box/cylinder members).
  - Horizontal and diagonal bracing between chords.
- Lattice density decreases with height (denser near base, sparser above second platform).

### 5.3 Arches

- Four first-level arches connect adjacent piers at ground level.
- Modeled as trussed arches with vertical and diagonal members.
- Hand-tuned to match the reference diagram’s arch curvature and bracing pattern.

### 5.4 Platforms

- **First platform**: large, decked platform with overhanging edges and railing.
- **Second platform**: smaller platform, also with railing.
- **Third level**: enclosed/observatory volume near the top.
- Platform floors are solid meshes with subtle texture or color variation.

### 5.5 Top / antenna

- Tapered lattice section above the third platform.
- Thin antenna/spire at the very top.
- Optional small aircraft warning beacon light.

### 5.6 Materials

- Single PBR material for the iron structure:
  - Color: `#6e5c4b` (brown-grey)
  - Roughness: `0.7`
  - Metalness: `0.4`
- Platform deck: slightly darker, less metallic.
- Rivets/bolts: same iron material, smaller instances.

### 5.7 Performance strategy

- Use `InstancedMesh` for repeated lattice members.
- Merge static platform geometry where possible.
- Keep total draw calls under a few hundred on desktop.

## 6. Scene, Lighting, and Environment

### 6.1 Scene composition

- **Ground plane**: large neutral grey circular plane (`radius ≈ 600 m`) centered on the tower base.
- **Shadow catcher**: ground plane uses `THREE.ShadowMaterial` so it only receives shadows.
- **Background**: solid color tied to the active theme (light blue day, dark navy night) or a subtle gradient.
- **Fog**: optional exponential fog tied to theme, kept light so lattice detail remains visible.
- **Grid helper**: hidden by default; toggle via debug key.

### 6.2 Lighting

- **Directional light (sun/moon)**
  - Day: warm white `#fff5e6`, intensity `2.0`, casts shadows with `2048×2048` `PCFSoftShadowMap`.
  - Night: cool `#c8d8ff`, intensity `0.4`, same shadow setup.
- **Hemisphere light**
  - Day: sky `#87ceeb`, ground `#7a7a7a`, intensity `0.6`.
  - Night: sky `#1a2a4a`, ground `#050505`, intensity `0.2`.
- **Ambient light**: fill (`0.1` day, `0.05` night) to keep shadowed lattice readable.
- **Beacon light**: small point light near top, visible only at night.

### 6.3 Theme switching

- `EnvironmentTheme` config object holds all colors and intensities.
- `applyTheme('day' | 'night')` updates renderer clear color, scene background/fog, all lights, and beacon visibility.

### 6.4 Camera framing

- Initial position: `(250, 120, 250)` looking toward tower center.
- Orbit target: `(0, 150, 0)` (around first-platform height).
- Min/max distance clamps to prevent clipping inside the lattice.

## 7. UI & Interactivity

### 7.1 Orbit controls

- Left drag: rotate.
- Right drag: pan.
- Scroll: zoom.
- Damping enabled (`dampingFactor = 0.05`).
- Polar angle limited to stay above ground plane.

### 7.2 Day/night toggle

- Button in top-right corner with sun/moon icon.
- Toggles theme and UI chrome colors.

### 7.3 Info overlay

- Semi-transparent panel at bottom-left, collapsible.
- Shows:
  - Total height.
  - Approximate structural piece count.
  - Short historical fact.
- Toggle button for show/hide.

### 7.4 Loading overlay

- Spinner with text “Building tower…” shown while procedural geometry generates.
- Dismissed after first rendered frame.

### 7.5 Keyboard shortcuts

- `R`: reset camera.
- `T`: toggle theme.
- `I`: toggle info overlay.

### 7.6 Responsiveness

- Desktop-first; UI scales modestly but mobile optimization is out of scope.

## 8. Error Handling & Edge Cases

- **WebGL context loss**: listen for `webglcontextlost`, show reload message.
- **WebGL unsupported**: show fallback screen instead of blank canvas.
- **Renderer creation failure**: log to console and show user-facing error.
- **Geometry generation**: builders validate inputs; failures return empty groups rather than crash.
- **Performance guardrails**:
  - Cap `devicePixelRatio` at `2`.
  - Shadow map `2048` on desktop, fallback to `1024` if needed.
  - Skip instance color variation above a safe instance count.
- **Theme switching**: guard against rapid toggles; fall back to known-good state if config missing.
- **Assets**: viewer is self-contained; no external texture/model dependencies.

## 9. Testing Strategy

### 9.1 Unit tests (Vitest)

- Geometry builders return valid `THREE.Group` objects with non-empty bounding boxes.
- Theme applicator updates all light/color values correctly.
- Camera rig initializes to spec position and target.
- Parameter validation rejects or clamps invalid inputs.

### 9.2 Integration tests

- Mount app with mocked WebGL context.
- Verify scene contains the tower group and animation loop runs.

### 9.3 Visual regression (optional)

- Puppeteer/Playwright screenshot capture against baseline.
- Not required for first version.

### 9.4 Manual checks

- Smooth orbit controls.
- Day/night light and background update.
- Shadows under tower follow sun direction.
- Info overlay content is correct.

## 10. Open Questions / Future Considerations

- Do we want animated transition between day and night?
- Should the info overlay include clickable hotspots on the tower?
- Is a screenshot/visual regression test worth adding immediately?

## 11. Approval

- Section 1 — Architecture & file structure: approved.
- Section 2 — Tower geometry: approved.
- Section 3 — Scene, lighting, and environment: approved.
- Section 4 — UI & interactivity: approved.
- Section 5 — Error handling & edge cases: approved.
- Section 6 — Testing strategy: approved.
