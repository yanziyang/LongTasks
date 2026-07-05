### Task 3: Create InterLegLatticeBuilder — Merged Body + Arch Panels

**Files:**
- Create: `src/tower/builders/InterLegLatticeBuilder.ts`
- Create: `tests/inter-leg-lattice.test.ts`

**Interfaces:**
- Produces: `buildInterLegLattice(materials: THREE.Material[] | THREE.Material, fallback: boolean): THREE.Group`

- [ ] **Step 1: Create tests/inter-leg-lattice.test.ts**

```typescript
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { buildInterLegLattice } from '../src/tower/builders/InterLegLatticeBuilder';
import { createTowerMaterialFallback } from '../src/tower/materials';

function countMeshes(obj: THREE.Object3D): number {
  let count = 0;
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) count++;
  });
  return count;
}

describe('buildInterLegLattice', () => {
  it('returns a Group', () => {
    const mats = createTowerMaterialFallback();
    const result = buildInterLegLattice(mats, true);
    expect(result).toBeInstanceOf(THREE.Group);
  });

  it('contains many meshes (body lattice + arch panels)', () => {
    const mats = createTowerMaterialFallback();
    const result = buildInterLegLattice(mats, true);
    expect(countMeshes(result)).toBeGreaterThan(500);
  });

  it('has non-zero bounding box', () => {
    const mats = createTowerMaterialFallback();
    const result = buildInterLegLattice(mats, true);
    const box = new THREE.Box3().setFromObject(result);
    expect(box.isEmpty()).toBe(false);
  });

  it('bounding box spans from ground to near HEIGHT_TOP', () => {
    const mats = createTowerMaterialFallback();
    const result = buildInterLegLattice(mats, true);
    const box = new THREE.Box3().setFromObject(result);
    expect(box.min.y).toBeLessThan(5);
    expect(box.max.y).toBeGreaterThan(250);
  });

  it('has heightRatio attribute on meshes', () => {
    const mats = createTowerMaterialFallback();
    const result = buildInterLegLattice(mats, true);
    let foundAttribute = false;
    result.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry.attributes.heightRatio) {
        foundAttribute = true;
      }
    });
    expect(foundAttribute).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails** — `npm test` → FAIL

- [ ] **Step 3: Create src/tower/builders/InterLegLatticeBuilder.ts**

The full implementation is in the plan at `docs/superpowers/plans/2026-07-05-engineering-model-geometry-rework.md` starting at line 469. Read lines 469-735 from that file and implement verbatim. The implementation contains:

- `beamBetween` helper (same pattern as LegTrussBuilder)
- `cornerPoint(corner, h)` — profile curve position
- `legInnerChordAtHeight(corner, h)` — inner chord of a leg truss at height h
- `sectionForHeight(h)` — returns 0/1/2 based on platform heights
- `buildCornerChords(mat)` — 4 TubeGeometry corner chords from 57m to 300m
- `buildBodyLattice(mat)` — section-density-varying lattice on 4 faces, 57-300m
- `buildArchPanels(mat)` — curved arch panels with Bezier bottom chord, verticals, diagonals, double-ring
- `buildInterLegLattice(materials, fallback)` — assembler + heightRatio traverse

The code has these imports from constants:
```
LEG_SECTION_HEIGHT, BODY_BAY_HEIGHT, PLATFORM_HEIGHTS, ARCH_MAX_HEIGHT, ARCH_SEGMENTS, ARCH_RING_SPACING, LEG_TRUSS_WIDTH_BASE, LEG_TRUSS_WIDTH_TOP
```

And constants: `CHORD_RADIUS = 0.5, STRUT_RADIUS = 0.3, BRACE_RADIUS = 0.25, ARCH_TUBE_RADIUS = 0.35`

- [ ] **Step 4: Run test** — `npm test` → PASS (>500 meshes expected)

- [ ] **Step 5: Commit**

```bash
git add src/tower/builders/InterLegLatticeBuilder.ts tests/inter-leg-lattice.test.ts
git commit -m "feat: add InterLegLatticeBuilder with merged body lattice and curved arch panels"
```
