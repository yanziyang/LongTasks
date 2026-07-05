# Eiffel Tower Engineering-Model Geometry Rework — Design Spec

**Date:** 2026-07-05
**Status:** Approved (brainstorming complete)
**Goal:** Rework the tower's core geometry so each leg is a true 4-chord lattice truss and the body is dense riveted ironwork — an engineering model, not a sculptural approximation.

---

## 1. Architecture & Scope

This is a **rework of the tower geometry generation**, not a new project. The scope:

- **Reworked:** `LegBuilder.ts`, `LatticeBuilder.ts`, `ArchBuilder.ts` (absorbed into lattice), `Tower.ts` (assembler updated)
- **New:** `LegTrussBuilder.ts` (the 4-chord lattice truss legs), `InterLegLatticeBuilder.ts` (the merged body lattice with curved bottom chord)
- **Unchanged:** `profile.ts`, `materials.ts`, `constants.ts` (small additions only), `PlatformBuilder.ts`, `CabinBuilder.ts`, `AntennaBuilder.ts`, viewer, UI, controls, scene

The file structure:

```
src/tower/
  Tower.ts                      # updated: composes new builders
  profile.ts                    # unchanged
  materials.ts                  # unchanged
  constants.ts                  # small additions: leg truss dimensions, bay heights
  builders/
    LegTrussBuilder.ts          # NEW: 4 independent square lattice trusses, 0-57m
    InterLegLatticeBuilder.ts   # NEW: merged body lattice 57-300m + curved arch panels 0-57m
    PlatformBuilder.ts          # unchanged
    CabinBuilder.ts             # unchanged
    AntennaBuilder.ts           # unchanged
```

The old `LegBuilder.ts`, `LatticeBuilder.ts`, and `ArchBuilder.ts` are **deleted** — fully replaced by the new builders.

---

## 2. LegTrussBuilder — The Four Independent Truss Legs (0-57m)

Each leg is a square lattice truss with 4 corner chords. At the base, the leg truss is ~9m square, narrowing to ~3.5m at 57m where it merges.

### 2.1 Chords

4 corner posts per leg, each following a curve from the leg's base position to its 57m position. The 4 chords form a square cross-section that tapers as the leg rises. Chord positions are offset from the leg's center point (which sits on the tower's profile curve corner).

### 2.2 Bay height

Constant 3m below 57m (so 19 bays per leg). At each bay, a horizontal square ring of struts connects the 4 chords — 4 struts forming the square ring.

### 2.3 Bracing per face

Each of the 4 faces of the leg truss gets X-bracing between adjacent horizontal rings. That's 2 diagonals per face × 4 faces × 19 bays = 152 diagonal members per leg, plus 76 ring struts (4 per bay × 19 bays).

### 2.4 Base section decoration (0-57m)

Extra decorative struts — a second intermediate horizontal ring halfway between each bay (so 2 rings per bay instead of 1), giving the base section its characteristic dense riveted look. This adds another 76 ring struts per leg.

### 2.5 Total per leg

~300 structural members. Four legs = ~1200 members in the base section alone.

### 2.6 Merge point

At 57m, the 4 leg trusses converge. The 4 inner chords (facing the tower center) meet at the platform corner, and the 4 outer chords become the corner edges of the unified tower body above.

---

## 3. InterLegLatticeBuilder — The Merged Body Lattice (57-300m)

Above 57m, the four legs merge into a single lattice tower. The 4 corner chords from the legs continue as the tower's 4 edge beams, now following the profile curve corners directly (no leg truss offset — the chords sit on the profile curve).

### 3.1 Bay height

Constant 4m from 57m to 300m (so ~61 bays). Each bay is one structural panel.

### 3.2 Section density variation

| Section | Height range | Bay content |
|---------|-------------|-------------|
| Lower (57-115m) | 58 bays | Dense: 6-member bay (X + top tie + bottom tie + vertical + K-diagonals) |
| Middle (115-276m) | ~40 bays (every other ring built) | Medium: 4-member bay (X + horizontal tie + vertical post) |
| Upper (276-300m) | ~6 bays (every 3rd ring built) | Sparse: 2-member bay (single diagonal + horizontal tie) |

### 3.3 Generation

For each bay, between adjacent ring pairs on each of the 4 faces, place the members per the section's pattern. The 4 faces are the 4 sides of the shrinking square defined by `w(z)`.

### 3.4 Corner chords

The 4 edge beams are generated here (not in LegTrussBuilder) — continuous tubes from 57m to 300m following the profile curve corners, mirroring the current LegBuilder approach but starting at 57m.

### 3.5 Total

~1200-1500 members in the body lattice.

---

## 4. Curved Arch Panels (0-57m, integrated into InterLegLatticeBuilder)

Between the four wide leg trusses at the base, the open faces are filled with lattice panels whose **bottom chord is a curved arch** sweeping up to ~45m. This replaces the old separate ArchBuilder — the arch is now structurally part of the inter-leg lattice.

### 4.1 Per face (4 faces total)

- **Bottom chord:** A quadratic Bezier curve from one leg's inner chord to the adjacent leg's inner chord, arching up to ~45m at the midpoint. The curve is a `TubeGeometry` (continuous curved beam), ~30 segments.
- **Top chord:** A straight horizontal beam at 57m connecting the two legs' inner chords (this is the first-platform-level tie).
- **Vertical posts:** ~14 posts spaced along the arch from ground to the 57m tie, perpendicular to the arch curve, decreasing in height as the arch rises.
- **Diagonal bracing:** X-bracing between adjacent vertical posts, filling each panel between the arch and the 57m tie. ~28 diagonals per face.
- **Decorative inner ring:** A second curved tube offset 2m inward from the bottom chord, with radial struts connecting the two rings (matching the double-ring detail from the previous spec). ~14 radial struts + 14 cross-diagonals.

### 4.2 Total per face

~70 members. Four faces = ~280 members in the arch panels.

### 4.3 Connection to legs

The arch panels connect to the inner chords of adjacent leg trusses. The vertical posts and diagonals spring from the inner chord positions, making the whole base section read as one continuous riveted structure.

---

## 5. Constants, Materials, and Tower Assembler Updates

### 5.1 Constants additions (`constants.ts`)

```
LEG_TRUSS_WIDTH_BASE = 9.0       // leg truss square width at ground (m)
LEG_TRUSS_WIDTH_TOP = 3.5        // leg truss square width at 57m (m)
LEG_TRUSS_BAY_HEIGHT = 3.0       // bay height for legs (m)
LEG_SECTION_HEIGHT = 57          // where legs merge
BODY_BAY_HEIGHT = 4.0            // bay height for merged body (m)
ARCH_MAX_HEIGHT = 45             // arch apex height (m)
ARCH_SEGMENTS = 30               // arch curve tessellation
ARCH_RING_SPACING = 2.0          // double-ring offset (m)
```

### 5.2 Materials

Unchanged. The existing custom `ShaderMaterial` with the 3-brown vertex color gradient continues to be used. All new builders set the `heightRatio` vertex attribute using the same `vertex.applyMatrix4(matrix)` pattern established in the current code. The antenna keeps its separate dark material.

### 5.3 Tower assembler (`Tower.ts`)

Updated to compose the new builders:

```
group.add(buildLegTrusses(material, isFallback));        // 4 legs, 0-57m
group.add(buildInterLegLattice(material, isFallback));   // body 57-300m + arch panels 0-57m
group.add(buildPlatforms(material, isFallback));         // unchanged
group.add(buildCabin(material, isFallback));             // unchanged
group.add(buildAntenna());                               // unchanged
```

The assembler still applies shadow flags (`castShadow`/`receiveShadow`) to all meshes and scales by `SCENE_SCALE`.

### 5.4 Removed files

`LegBuilder.ts`, `LatticeBuilder.ts`, `ArchBuilder.ts` — fully replaced.

---

## 6. Error Handling, Performance, and Testing

### 6.1 Error handling

Same patterns as existing builders. Each new builder validates inputs (materials, fallback flag) and returns an empty `Group` on failure. The `heightRatio` attribute computation uses the established `vertex.applyMatrix4(matrix)` pattern. No new error handling surface.

### 6.2 Performance

With ~1200 leg truss members + ~1500 body lattice members + ~280 arch panel members = ~3000 total structural members. Each is a `Mesh` sharing the cloned `LATTICE_CYLINDER_GEO` template (the current pattern). This is more geometry than the current implementation (~800 members) but still well within desktop WebGL capability. Shadow map stays at 2048x2048. `devicePixelRatio` capped at 2. No `InstancedMesh` migration in this rework — the geometry count is manageable with individual meshes, and keeping the same pattern avoids scope creep.

### 6.3 Testing strategy

- **`tests/leg-truss.test.ts` (new):** Verifies `buildLegTrusses()` returns a `Group`, contains 4 leg sub-groups, each leg has >=200 meshes (4 chords + bracing), non-empty bounding box, heightRatio attribute present.
- **`tests/inter-leg-lattice.test.ts` (new):** Verifies `buildInterLegLattice()` returns a `Group`, contains >500 meshes (body + arch panels), non-empty bounding box spanning 0-300m, heightRatio attribute present.
- **`tests/builders.test.ts` (updated):** Remove old LegBuilder/LatticeBuilder/ArchBuilder test blocks; keep PlatformBuilder/CabinBuilder/AntennaBuilder tests.
- **`tests/tower.test.ts` (updated):** Verify `buildTower()` produces a group with >2000 meshes (the new density), non-empty bounding box.
- **Existing tests:** `constants.test.ts`, `profile.test.ts`, `materials.test.ts`, `environment.test.ts`, `smoke.test.ts` all pass unchanged.

### 6.4 Verification commands

`npm test`, `npm run build`, `npm run dev` — all three must succeed, same as current.

---

## 7. Summary of Member Counts

| Component | Members | Height range |
|-----------|---------|-------------|
| Leg trusses (4 legs) | ~1200 | 0-57m |
| Body lattice (corner chords + bracing) | ~1200-1500 | 57-300m |
| Curved arch panels (4 faces) | ~280 | 0-57m |
| Platforms, cabin, antenna | ~50 (unchanged) | 57/115/276m + 300-330m |
| **Total** | **~2700-3000** | 0-330m |
