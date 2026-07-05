# Engineering-Model Geometry Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the sculptural tube legs and simple X-lattice with true 4-chord lattice truss legs (0-57m), a dense riveted merged body lattice (57-300m), and integrated curved arch panels (0-57m) — an engineering model with ~3000 structural members.

**Architecture:** Two new builders replace three old ones. `LegTrussBuilder` generates 4 independent square lattice trusses with 4 chords, X-bracing on all 4 faces, and decorative intermediate rings. `InterLegLatticeBuilder` generates the merged body lattice (57-300m) with section-based density plus curved arch panels (0-57m) where the bottom chord is a Bezier arch and the panel is filled with verticals and X-bracing. Old `LegBuilder`, `LatticeBuilder`, and `ArchBuilder` are deleted.

**Tech Stack:** TypeScript 5.5+, Three.js 0.169+, Vite 5.4+, Vitest 2.1+

## Global Constraints

- All real-world dimensions live in `src/constants.ts` as the single source of truth
- `src/tower/profile.ts` is pure math — no Three.js dependency, unchanged
- Each builder validates inputs and returns empty Group on failure (no throws)
- Scene built in meters, scaled by 1/100 for rendering
- `heightRatio` vertex attribute computed via `vertex.applyMatrix4(child.matrixWorld)` pattern
- `devicePixelRatio` capped at 2, shadow map at 2048x2048 PCFSoft
- Materials unchanged — same custom ShaderMaterial with 3-brown vertex color gradient
- `npm test`, `npm run build`, `npm run dev` must all succeed
- Reuse the `LATTICE_CYLINDER_GEO` shared-geometry-clone pattern from current LatticeBuilder for all new beam members
- Reuse the `beamBetween(a, b, mat, radius)` helper pattern (returns `THREE.Mesh | null`)

---

### Task 1: Add New Constants

**Files:**
- Modify: `src/constants.ts`
- Modify: `tests/constants.test.ts`

**Interfaces:**
- Produces: `LEG_TRUSS_WIDTH_BASE`, `LEG_TRUSS_WIDTH_TOP`, `LEG_TRUSS_BAY_HEIGHT`, `LEG_SECTION_HEIGHT`, `BODY_BAY_HEIGHT`, `ARCH_MAX_HEIGHT`, `ARCH_SEGMENTS`, `ARCH_RING_SPACING`

- [ ] **Step 1: Add tests for new constants to tests/constants.test.ts**

Append this test block to the existing file (after the last `it` block, before the closing `});` of the `describe('constants', ...)` block — or as a new describe block at the end of the file):

```typescript
describe('engineering-model constants', () => {
  it('has positive leg truss width at base', async () => {
    const { LEG_TRUSS_WIDTH_BASE } = await import('../src/constants');
    expect(LEG_TRUSS_WIDTH_BASE).toBeGreaterThan(0);
  });

  it('leg truss width narrows from base to top', async () => {
    const { LEG_TRUSS_WIDTH_BASE, LEG_TRUSS_WIDTH_TOP } = await import('../src/constants');
    expect(LEG_TRUSS_WIDTH_TOP).toBeLessThan(LEG_TRUSS_WIDTH_BASE);
    expect(LEG_TRUSS_WIDTH_TOP).toBeGreaterThan(0);
  });

  it('has positive leg truss bay height', async () => {
    const { LEG_TRUSS_BAY_HEIGHT } = await import('../src/constants');
    expect(LEG_TRUSS_BAY_HEIGHT).toBeGreaterThan(0);
  });

  it('leg section height equals first platform height', async () => {
    const { LEG_SECTION_HEIGHT, PLATFORM_HEIGHTS } = await import('../src/constants');
    expect(LEG_SECTION_HEIGHT).toBe(PLATFORM_HEIGHTS[0]);
  });

  it('has positive body bay height', async () => {
    const { BODY_BAY_HEIGHT } = await import('../src/constants');
    expect(BODY_BAY_HEIGHT).toBeGreaterThan(0);
  });

  it('has positive arch max height less than leg section height', async () => {
    const { ARCH_MAX_HEIGHT, LEG_SECTION_HEIGHT } = await import('../src/constants');
    expect(ARCH_MAX_HEIGHT).toBeGreaterThan(0);
    expect(ARCH_MAX_HEIGHT).toBeLessThan(LEG_SECTION_HEIGHT);
  });

  it('has positive arch segments', async () => {
    const { ARCH_SEGMENTS } = await import('../src/constants');
    expect(ARCH_SEGMENTS).toBeGreaterThan(4);
  });

  it('has positive arch ring spacing', async () => {
    const { ARCH_RING_SPACING } = await import('../src/constants');
    expect(ARCH_RING_SPACING).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — the new constants are not exported.

- [ ] **Step 3: Add the new constants to src/constants.ts**

Add these lines after the existing `AUTO_ROTATION_RECOVERY_S` line (line 31) and before the validation block:

```typescript
export const LEG_TRUSS_WIDTH_BASE = 9.0;
export const LEG_TRUSS_WIDTH_TOP = 3.5;
export const LEG_TRUSS_BAY_HEIGHT = 3.0;
export const LEG_SECTION_HEIGHT = 57;
export const BODY_BAY_HEIGHT = 4.0;
export const ARCH_MAX_HEIGHT = 45;
export const ARCH_SEGMENTS = 30;
export const ARCH_RING_SPACING = 2.0;
```

Add validation lines after the existing validation block (after line 44, the closing `}` of the platform heights loop):

```typescript
if (LEG_TRUSS_WIDTH_BASE <= 0) throw new Error('LEG_TRUSS_WIDTH_BASE must be positive');
if (LEG_TRUSS_WIDTH_TOP <= 0) throw new Error('LEG_TRUSS_WIDTH_TOP must be positive');
if (LEG_TRUSS_WIDTH_TOP >= LEG_TRUSS_WIDTH_BASE) throw new Error('LEG_TRUSS_WIDTH_TOP must be less than LEG_TRUSS_WIDTH_BASE');
if (LEG_TRUSS_BAY_HEIGHT <= 0) throw new Error('LEG_TRUSS_BAY_HEIGHT must be positive');
if (LEG_SECTION_HEIGHT <= 0) throw new Error('LEG_SECTION_HEIGHT must be positive');
if (BODY_BAY_HEIGHT <= 0) throw new Error('BODY_BAY_HEIGHT must be positive');
if (ARCH_MAX_HEIGHT <= 0) throw new Error('ARCH_MAX_HEIGHT must be positive');
if (ARCH_MAX_HEIGHT >= LEG_SECTION_HEIGHT) throw new Error('ARCH_MAX_HEIGHT must be less than LEG_SECTION_HEIGHT');
if (ARCH_SEGMENTS < 4) throw new Error('ARCH_SEGMENTS must be at least 4');
if (ARCH_RING_SPACING <= 0) throw new Error('ARCH_RING_SPACING must be positive');
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all existing tests plus 8 new constants tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/constants.ts tests/constants.test.ts
git commit -m "feat: add engineering-model constants for leg trusses and arch panels"
```

---

### Task 2: Create LegTrussBuilder — Four Lattice Truss Legs

**Files:**
- Create: `src/tower/builders/LegTrussBuilder.ts`
- Create: `tests/leg-truss.test.ts`

**Interfaces:**
- Consumes: `profile(h: number): number` from `src/tower/profile.ts`
- Consumes: `BASE_HALF_WIDTH`, `HEIGHT_TOP`, `LEG_TRUSS_WIDTH_BASE`, `LEG_TRUSS_WIDTH_TOP`, `LEG_TRUSS_BAY_HEIGHT`, `LEG_SECTION_HEIGHT`, `PLATFORM_HEIGHTS` from `src/constants.ts`
- Produces: `buildLegTrusses(materials: THREE.Material[] | THREE.Material, fallback: boolean): THREE.Group`

- [ ] **Step 1: Create tests/leg-truss.test.ts**

```typescript
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { buildLegTrusses } from '../src/tower/builders/LegTrussBuilder';
import { createTowerMaterialFallback } from '../src/tower/materials';

function countMeshes(obj: THREE.Object3D): number {
  let count = 0;
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) count++;
  });
  return count;
}

describe('buildLegTrusses', () => {
  it('returns a Group', () => {
    const mats = createTowerMaterialFallback();
    const result = buildLegTrusses(mats, true);
    expect(result).toBeInstanceOf(THREE.Group);
  });

  it('contains 4 leg sub-groups', () => {
    const mats = createTowerMaterialFallback();
    const result = buildLegTrusses(mats, true);
    const legGroups = result.children.filter((c) => c instanceof THREE.Group);
    expect(legGroups.length).toBe(4);
  });

  it('each leg has many meshes (chords + bracing)', () => {
    const mats = createTowerMaterialFallback();
    const result = buildLegTrusses(mats, true);
    const legGroups = result.children.filter((c) => c instanceof THREE.Group);
    for (const leg of legGroups) {
      expect(countMeshes(leg)).toBeGreaterThan(200);
    }
  });

  it('has non-zero bounding box', () => {
    const mats = createTowerMaterialFallback();
    const result = buildLegTrusses(mats, true);
    const box = new THREE.Box3().setFromObject(result);
    expect(box.isEmpty()).toBe(false);
  });

  it('bounding box spans 0 to LEG_SECTION_HEIGHT in Y', () => {
    const mats = createTowerMaterialFallback();
    const result = buildLegTrusses(mats, true);
    const box = new THREE.Box3().setFromObject(result);
    expect(box.min.y).toBeLessThan(5);
    expect(box.max.y).toBeGreaterThan(50);
  });

  it('has heightRatio attribute on meshes', () => {
    const mats = createTowerMaterialFallback();
    const result = buildLegTrusses(mats, true);
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

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `src/tower/builders/LegTrussBuilder.ts` does not exist.

- [ ] **Step 3: Create src/tower/builders/LegTrussBuilder.ts**

```typescript
import * as THREE from 'three';
import { profile } from '../profile';
import {
  BASE_HALF_WIDTH,
  HEIGHT_TOP,
  LEG_TRUSS_WIDTH_BASE,
  LEG_TRUSS_WIDTH_TOP,
  LEG_TRUSS_BAY_HEIGHT,
  LEG_SECTION_HEIGHT,
} from '../../constants';

const CHORD_RADIUS = 0.5;
const STRUT_RADIUS = 0.25;
const BRACE_RADIUS = 0.2;
const CYLINDER_GEO = new THREE.CylinderGeometry(1, 1, 1, 6);

function beamBetween(a: THREE.Vector3, b: THREE.Vector3, mat: THREE.Material, radius: number): THREE.Mesh | null {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  if (len < 0.01) return null;
  const geo = CYLINDER_GEO.clone();
  geo.scale(radius, len, radius);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return mesh;
}

function legCenterAtHeight(corner: number, h: number): THREE.Vector3 {
  const w = profile(Math.min(h, LEG_SECTION_HEIGHT));
  const sx = corner === 0 || corner === 3 ? -w : w;
  const sz = corner === 0 || corner === 1 ? -w : w;
  return new THREE.Vector3(sx, h, sz);
}

function legTrussWidth(h: number): number {
  const t = Math.min(h / LEG_SECTION_HEIGHT, 1);
  return LEG_TRUSS_WIDTH_BASE + (LEG_TRUSS_WIDTH_TOP - LEG_TRUSS_WIDTH_BASE) * t;
}

function chordOffset(corner: number, chordIndex: number, halfWidth: number): { dx: number; dz: number } {
  const cornerSigns = [
    { x: -1, z: -1 },
    { x: 1, z: -1 },
    { x: 1, z: 1 },
    { x: -1, z: 1 },
  ];
  const sign = cornerSigns[corner];
  const chordSigns = [
    { dx: -1, dz: -1 },
    { dx: 1, dz: -1 },
    { dx: 1, dz: 1 },
    { dx: -1, dz: 1 },
  ];
  const cs = chordSigns[chordIndex];
  return { dx: sign.x * cs.dx * halfWidth, dz: sign.z * cs.dz * halfWidth };
}

function chordPoint(corner: number, chordIndex: number, h: number): THREE.Vector3 {
  const center = legCenterAtHeight(corner, h);
  const hw = legTrussWidth(h) / 2;
  const { dx, dz } = chordOffset(corner, chordIndex, hw);
  return new THREE.Vector3(center.x + dx, h, center.z + dz);
}

function buildSingleLeg(corner: number, mat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const bayCount = Math.floor(LEG_SECTION_HEIGHT / LEG_TRUSS_BAY_HEIGHT);

  const ringHeights: number[] = [];
  for (let i = 0; i <= bayCount; i++) {
    ringHeights.push(i * LEG_TRUSS_BAY_HEIGHT);
  }

  const chordCurves: THREE.Vector3[][] = [[], [], [], []];
  for (let i = 0; i <= bayCount; i++) {
    const h = ringHeights[i];
    for (let c = 0; c < 4; c++) {
      chordCurves[c].push(chordPoint(corner, c, h));
    }
  }

  for (let c = 0; c < 4; c++) {
    const curve = new THREE.CatmullRomCurve3(chordCurves[c]);
    const geo = new THREE.TubeGeometry(curve, bayCount * 4, CHORD_RADIUS, 6, false);
    group.add(new THREE.Mesh(geo, mat));
  }

  for (let bay = 0; bay < bayCount; bay++) {
    const h0 = ringHeights[bay];
    const h1 = ringHeights[bay + 1];

    for (const h of [h0, h1]) {
      for (let c = 0; c < 4; c++) {
        const next = (c + 1) % 4;
        const p0 = chordPoint(corner, c, h);
        const p1 = chordPoint(corner, next, h);
        const strut = beamBetween(p0, p1, mat, STRUT_RADIUS);
        if (strut) group.add(strut);
      }
    }

    const midH = (h0 + h1) / 2;
    for (let c = 0; c < 4; c++) {
      const next = (c + 1) % 4;
      const p0 = chordPoint(corner, c, midH);
      const p1 = chordPoint(corner, next, midH);
      const strut = beamBetween(p0, p1, mat, STRUT_RADIUS);
      if (strut) group.add(strut);
    }

    for (let c = 0; c < 4; c++) {
      const next = (c + 1) % 4;
      const botA = chordPoint(corner, c, h0);
      const botB = chordPoint(corner, next, h0);
      const topA = chordPoint(corner, c, h1);
      const topB = chordPoint(corner, next, h1);
      const d1 = beamBetween(botA, topB, mat, BRACE_RADIUS);
      const d2 = beamBetween(botB, topA, mat, BRACE_RADIUS);
      if (d1) group.add(d1);
      if (d2) group.add(d2);
    }
  }

  return group;
}

export function buildLegTrusses(materials: THREE.Material[] | THREE.Material, fallback: boolean): THREE.Group {
  const group = new THREE.Group();
  if (!materials) return group;

  const mat = fallback
    ? (materials as THREE.Material[])[0]
    : (materials as THREE.Material);

  for (let corner = 0; corner < 4; corner++) {
    const leg = buildSingleLeg(corner, mat);
    leg.name = `leg-${corner}`;
    group.add(leg);
  }

  group.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry && child.geometry.attributes.position) {
      const positions = child.geometry.attributes.position;
      const heightRatios = new Float32Array(positions.count);
      const vertex = new THREE.Vector3();
      const matrix = child.matrixWorld;
      for (let i = 0; i < positions.count; i++) {
        vertex.set(positions.getX(i), positions.getY(i), positions.getZ(i));
        vertex.applyMatrix4(matrix);
        heightRatios[i] = vertex.y / HEIGHT_TOP;
      }
      child.geometry.setAttribute('heightRatio', new THREE.BufferAttribute(heightRatios, 1));
    }
  });

  return group;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all existing tests plus 6 new leg-truss tests pass. Each leg should have ~300 meshes (4 chord tubes + 4×19×2 ring struts + 4×19×1 mid struts + 4×19×2 diagonals ≈ 304 meshes).

- [ ] **Step 5: Commit**

```bash
git add src/tower/builders/LegTrussBuilder.ts tests/leg-truss.test.ts
git commit -m "feat: add LegTrussBuilder with 4-chord lattice truss legs"
```

---

### Task 3: Create InterLegLatticeBuilder — Merged Body + Arch Panels

**Files:**
- Create: `src/tower/builders/InterLegLatticeBuilder.ts`
- Create: `tests/inter-leg-lattice.test.ts`

**Interfaces:**
- Consumes: `profile(h: number): number` from `src/tower/profile.ts`
- Consumes: `BASE_HALF_WIDTH`, `HEIGHT_TOP`, `LEG_SECTION_HEIGHT`, `BODY_BAY_HEIGHT`, `PLATFORM_HEIGHTS`, `ARCH_MAX_HEIGHT`, `ARCH_SEGMENTS`, `ARCH_RING_SPACING`, `LEG_TRUSS_WIDTH_BASE`, `LEG_TRUSS_WIDTH_TOP` from `src/constants.ts`
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

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `src/tower/builders/InterLegLatticeBuilder.ts` does not exist.

- [ ] **Step 3: Create src/tower/builders/InterLegLatticeBuilder.ts**

```typescript
import * as THREE from 'three';
import { profile } from '../profile';
import {
  BASE_HALF_WIDTH,
  HEIGHT_TOP,
  LEG_SECTION_HEIGHT,
  BODY_BAY_HEIGHT,
  PLATFORM_HEIGHTS,
  ARCH_MAX_HEIGHT,
  ARCH_SEGMENTS,
  ARCH_RING_SPACING,
  LEG_TRUSS_WIDTH_BASE,
  LEG_TRUSS_WIDTH_TOP,
} from '../../constants';

const CHORD_RADIUS = 0.5;
const STRUT_RADIUS = 0.3;
const BRACE_RADIUS = 0.25;
const ARCH_TUBE_RADIUS = 0.35;
const CYLINDER_GEO = new THREE.CylinderGeometry(1, 1, 1, 6);

function beamBetween(a: THREE.Vector3, b: THREE.Vector3, mat: THREE.Material, radius: number): THREE.Mesh | null {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  if (len < 0.01) return null;
  const geo = CYLINDER_GEO.clone();
  geo.scale(radius, len, radius);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return mesh;
}

function cornerPoint(corner: number, h: number): THREE.Vector3 {
  const w = profile(h);
  const sx = corner === 0 || corner === 3 ? -w : w;
  const sz = corner === 0 || corner === 1 ? -w : w;
  return new THREE.Vector3(sx, h, sz);
}

function legInnerChordAtHeight(corner: number, h: number): THREE.Vector3 {
  const center = cornerPoint(corner, h);
  const t = Math.min(h / LEG_SECTION_HEIGHT, 1);
  const legW = LEG_TRUSS_WIDTH_BASE + (LEG_TRUSS_WIDTH_TOP - LEG_TRUSS_WIDTH_BASE) * t;
  const halfLeg = legW / 2;
  const centerSignX = corner === 0 || corner === 3 ? -1 : 1;
  const centerSignZ = corner === 0 || corner === 1 ? -1 : 1;
  return new THREE.Vector3(
    center.x - centerSignX * halfLeg,
    h,
    center.z - centerSignZ * halfLeg,
  );
}

function sectionForHeight(h: number): number {
  if (h < PLATFORM_HEIGHTS[0]) return 0;
  if (h < PLATFORM_HEIGHTS[1]) return 1;
  return 2;
}

function buildCornerChords(mat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const segments = 60;
  for (let c = 0; c < 4; c++) {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const h = LEG_SECTION_HEIGHT + (HEIGHT_TOP - LEG_SECTION_HEIGHT) * (i / segments);
      points.push(cornerPoint(c, h));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const geo = new THREE.TubeGeometry(curve, segments, CHORD_RADIUS, 6, false);
    group.add(new THREE.Mesh(geo, mat));
  }
  return group;
}

function buildBodyLattice(mat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const bayCount = Math.floor((HEIGHT_TOP - LEG_SECTION_HEIGHT) / BODY_BAY_HEIGHT);
  const faces: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0]];

  for (const [a, b] of faces) {
    for (let bay = 0; bay < bayCount; bay++) {
      const h0 = LEG_SECTION_HEIGHT + bay * BODY_BAY_HEIGHT;
      const h1 = LEG_SECTION_HEIGHT + (bay + 1) * BODY_BAY_HEIGHT;
      const section = sectionForHeight(h0);

      let skip = false;
      if (section === 1) skip = bay % 2 === 1;
      if (section === 2) skip = bay % 3 !== 0;
      if (skip) continue;

      const botA = cornerPoint(a, h0);
      const botB = cornerPoint(b, h0);
      const topA = cornerPoint(a, h1);
      const topB = cornerPoint(b, h1);

      if (section === 0) {
        const d1 = beamBetween(botA, topB, mat, BRACE_RADIUS);
        const d2 = beamBetween(botB, topA, mat, BRACE_RADIUS);
        if (d1) group.add(d1);
        if (d2) group.add(d2);
        const tie1 = beamBetween(botA, botB, mat, STRUT_RADIUS);
        const tie2 = beamBetween(topA, topB, mat, STRUT_RADIUS);
        if (tie1) group.add(tie1);
        if (tie2) group.add(tie2);
        const vertical = beamBetween(
          new THREE.Vector3().lerpVectors(botA, botB, 0.5),
          new THREE.Vector3().lerpVectors(topA, topB, 0.5),
          mat, STRUT_RADIUS,
        );
        if (vertical) group.add(vertical);
        const midH = (h0 + h1) / 2;
        const midA = cornerPoint(a, midH);
        const midB = cornerPoint(b, midH);
        const k1 = beamBetween(midA, topB, mat, BRACE_RADIUS);
        const k2 = beamBetween(midB, topA, mat, BRACE_RADIUS);
        if (k1) group.add(k1);
        if (k2) group.add(k2);
      } else if (section === 1) {
        const d1 = beamBetween(botA, topB, mat, BRACE_RADIUS);
        const d2 = beamBetween(botB, topA, mat, BRACE_RADIUS);
        if (d1) group.add(d1);
        if (d2) group.add(d2);
        const tie = beamBetween(topA, topB, mat, STRUT_RADIUS);
        if (tie) group.add(tie);
        const vertical = beamBetween(
          new THREE.Vector3().lerpVectors(botA, botB, 0.5),
          new THREE.Vector3().lerpVectors(topA, topB, 0.5),
          mat, STRUT_RADIUS,
        );
        if (vertical) group.add(vertical);
      } else {
        const d1 = beamBetween(botA, topB, mat, BRACE_RADIUS);
        if (d1) group.add(d1);
        const tie = beamBetween(topA, topB, mat, STRUT_RADIUS);
        if (tie) group.add(tie);
      }
    }
  }

  return group;
}

function buildArchPanels(mat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const faces: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0]];

  for (const [a, b] of faces) {
    const start = legInnerChordAtHeight(a, 0);
    const end = legInnerChordAtHeight(b, 0);
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    mid.y = ARCH_MAX_HEIGHT;

    const outwardDir = new THREE.Vector3().crossVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3().subVectors(end, start).normalize(),
    ).normalize();

    for (const offset of [-ARCH_RING_SPACING / 2, ARCH_RING_SPACING / 2]) {
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= ARCH_SEGMENTS; i++) {
        const t = i / ARCH_SEGMENTS;
        const pa = new THREE.Vector3().lerpVectors(start, mid, t);
        const pb = new THREE.Vector3().lerpVectors(mid, end, t);
        const pt = new THREE.Vector3().lerpVectors(pa, pb, t);
        pt.add(outwardDir.clone().multiplyScalar(offset));
        points.push(pt);
      }
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, ARCH_SEGMENTS, ARCH_TUBE_RADIUS, 6, false);
      group.add(new THREE.Mesh(tubeGeo, mat));
    }

    const topTieStart = legInnerChordAtHeight(a, LEG_SECTION_HEIGHT);
    const topTieEnd = legInnerChordAtHeight(b, LEG_SECTION_HEIGHT);
    const topTie = beamBetween(topTieStart, topTieEnd, mat, STRUT_RADIUS);
    if (topTie) group.add(topTie);

    const postCount = 14;
    for (let i = 0; i < postCount; i++) {
      const t = (i + 0.5) / postCount;
      const pa = new THREE.Vector3().lerpVectors(start, mid, t);
      const pb = new THREE.Vector3().lerpVectors(mid, end, t);
      const archPt = new THREE.Vector3().lerpVectors(pa, pb, t);
      const topPt = new THREE.Vector3().lerpVectors(topTieStart, topTieEnd, t);
      topPt.y = LEG_SECTION_HEIGHT;

      const outerArchPt = archPt.clone().add(outwardDir.clone().multiplyScalar(-ARCH_RING_SPACING / 2));
      const post = beamBetween(outerArchPt, topPt, mat, STRUT_RADIUS);
      if (post) group.add(post);

      for (let j = i; j < i + 1 && j < postCount; j++) {
        const t2 = (j + 1.5) / postCount;
        if (t2 > 1) continue;
        const pa2 = new THREE.Vector3().lerpVectors(start, mid, t2);
        const pb2 = new THREE.Vector3().lerpVectors(mid, end, t2);
        const archPt2 = new THREE.Vector3().lerpVectors(pa2, pb2, t2);
        const topPt2 = new THREE.Vector3().lerpVectors(topTieStart, topTieEnd, t2);
        topPt2.y = LEG_SECTION_HEIGHT;

        const outerArchPt2 = archPt2.clone().add(outwardDir.clone().multiplyScalar(-ARCH_RING_SPACING / 2));
        const d1 = beamBetween(outerArchPt, topPt2, mat, BRACE_RADIUS);
        const d2 = beamBetween(topPt, outerArchPt2, mat, BRACE_RADIUS);
        if (d1) group.add(d1);
        if (d2) group.add(d2);
      }

      const innerArchPt = archPt.clone().add(outwardDir.clone().multiplyScalar(ARCH_RING_SPACING / 2));
      const radial = beamBetween(outerArchPt, innerArchPt, mat, STRUT_RADIUS);
      if (radial) group.add(radial);
    }

    for (let i = 0; i < postCount - 1; i++) {
      const t1 = (i + 0.5) / postCount;
      const t2 = (i + 1.5) / postCount;
      const pa1 = new THREE.Vector3().lerpVectors(start, mid, t1);
      const pb1 = new THREE.Vector3().lerpVectors(mid, end, t1);
      const archPt1 = new THREE.Vector3().lerpVectors(pa1, pb1, t1);
      const pa2 = new THREE.Vector3().lerpVectors(start, mid, t2);
      const pb2 = new THREE.Vector3().lerpVectors(mid, end, t2);
      const archPt2 = new THREE.Vector3().lerpVectors(pa2, pb2, t2);

      const inner1 = archPt1.clone().add(outwardDir.clone().multiplyScalar(ARCH_RING_SPACING / 2));
      const inner2 = archPt2.clone().add(outwardDir.clone().multiplyScalar(ARCH_RING_SPACING / 2));
      const d1 = beamBetween(inner1, archPt2.clone().add(outwardDir.clone().multiplyScalar(-ARCH_RING_SPACING / 2)), mat, BRACE_RADIUS);
      const d2 = beamBetween(archPt1.clone().add(outwardDir.clone().multiplyScalar(-ARCH_RING_SPACING / 2)), inner2, mat, BRACE_RADIUS);
      if (d1) group.add(d1);
      if (d2) group.add(d2);
    }
  }

  return group;
}

export function buildInterLegLattice(materials: THREE.Material[] | THREE.Material, fallback: boolean): THREE.Group {
  const group = new THREE.Group();
  if (!materials) return group;

  const mat = fallback
    ? (materials as THREE.Material[])[0]
    : (materials as THREE.Material);

  group.add(buildCornerChords(mat));
  group.add(buildBodyLattice(mat));
  group.add(buildArchPanels(mat));

  group.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry && child.geometry.attributes.position) {
      const positions = child.geometry.attributes.position;
      const heightRatios = new Float32Array(positions.count);
      const vertex = new THREE.Vector3();
      const matrix = child.matrixWorld;
      for (let i = 0; i < positions.count; i++) {
        vertex.set(positions.getX(i), positions.getY(i), positions.getZ(i));
        vertex.applyMatrix4(matrix);
        heightRatios[i] = vertex.y / HEIGHT_TOP;
      }
      child.geometry.setAttribute('heightRatio', new THREE.BufferAttribute(heightRatios, 1));
    }
  });

  return group;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all existing tests plus 5 new inter-leg-lattice tests pass. The group should have >500 meshes (4 corner chord tubes + body lattice + 4 arch panels).

- [ ] **Step 5: Commit**

```bash
git add src/tower/builders/InterLegLatticeBuilder.ts tests/inter-leg-lattice.test.ts
git commit -m "feat: add InterLegLatticeBuilder with merged body lattice and curved arch panels"
```

---

### Task 4: Update Tower Assembler

**Files:**
- Modify: `src/tower/Tower.ts`
- Modify: `tests/tower.test.ts`

**Interfaces:**
- Consumes: `buildLegTrusses`, `buildInterLegLattice` from new builders
- Produces: Updated `buildTower()` that composes new builders instead of old ones

- [ ] **Step 1: Update tests/tower.test.ts to expect higher mesh count**

Replace the existing test block `it('contains meshes from all six builders', ...)` (lines 12-19) with:

```typescript
  it('contains meshes from all builders (engineering model density)', () => {
    const result = buildTower();
    let meshCount = 0;
    result.group.traverse((child) => {
      if (child instanceof THREE.Mesh) meshCount++;
    });
    expect(meshCount).toBeGreaterThan(2000);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `buildTower()` still uses old builders which produce fewer than 2000 meshes.

- [ ] **Step 3: Update src/tower/Tower.ts**

Replace the entire file content with:

```typescript
import * as THREE from 'three';
import { buildLegTrusses } from './builders/LegTrussBuilder';
import { buildInterLegLattice } from './builders/InterLegLatticeBuilder';
import { buildPlatforms } from './builders/PlatformBuilder';
import { buildCabin } from './builders/CabinBuilder';
import { buildAntenna } from './builders/AntennaBuilder';
import {
  createTowerMaterial,
  createTowerMaterialFallback,
} from './materials';
import { SCENE_SCALE } from '../constants';

export interface TowerBuildResult {
  group: THREE.Group;
  material: THREE.ShaderMaterial | THREE.Material[];
  isFallback: boolean;
}

export function buildTower(): TowerBuildResult {
  let material: THREE.ShaderMaterial | THREE.Material[];
  let isFallback = false;

  const shaderMat = createTowerMaterial();
  if (shaderMat instanceof THREE.ShaderMaterial && shaderMat.vertexShader.length > 50) {
    material = shaderMat;
  } else {
    material = createTowerMaterialFallback();
    isFallback = true;
  }

  const group = new THREE.Group();

  group.add(buildLegTrusses(material, isFallback));
  group.add(buildInterLegLattice(material, isFallback));
  group.add(buildPlatforms(material, isFallback));
  group.add(buildCabin(material, isFallback));
  group.add(buildAntenna());

  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });

  group.scale.setScalar(SCENE_SCALE);

  return { group, material, isFallback };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all tests pass. The old `builders.test.ts` still imports the old builders (which still exist until Task 5), so those tests pass unchanged. The updated `tower.test.ts` now passes because `buildTower()` uses the new builders which produce >2000 meshes.

- [ ] **Step 5: Commit**

```bash
git add src/tower/Tower.ts tests/tower.test.ts
git commit -m "feat: update Tower assembler to use new engineering-model builders"
```

---

### Task 5: Remove Old Builders and Clean Up Tests

**Files:**
- Delete: `src/tower/builders/LegBuilder.ts`
- Delete: `src/tower/builders/LatticeBuilder.ts`
- Delete: `src/tower/builders/ArchBuilder.ts`
- Modify: `tests/builders.test.ts` — remove old test blocks

**Interfaces:**
- Removes: `buildLegs`, `buildLattice`, `buildArches` — no longer used by anything

- [ ] **Step 1: Update tests/builders.test.ts to remove old test blocks**

Replace the entire file content with (keeping only PlatformBuilder, CabinBuilder, AntennaBuilder tests and the countMeshes helper):

```typescript
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { buildPlatforms } from '../src/tower/builders/PlatformBuilder';
import { buildCabin } from '../src/tower/builders/CabinBuilder';
import { buildAntenna } from '../src/tower/builders/AntennaBuilder';
import { createTowerMaterialFallback } from '../src/tower/materials';

function countMeshes(obj: THREE.Object3D): number {
  let count = 0;
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) count++;
  });
  return count;
}

describe('buildPlatforms', () => {
  it('returns a Group', () => {
    const mats = createTowerMaterialFallback();
    const result = buildPlatforms(mats, true);
    expect(result).toBeInstanceOf(THREE.Group);
  });

  it('contains platform deck and railing meshes', () => {
    const mats = createTowerMaterialFallback();
    const result = buildPlatforms(mats, true);
    const meshCount = countMeshes(result);
    expect(meshCount).toBeGreaterThan(5);
  });

  it('has non-zero bounding box', () => {
    const mats = createTowerMaterialFallback();
    const result = buildPlatforms(mats, true);
    const box = new THREE.Box3().setFromObject(result);
    expect(box.isEmpty()).toBe(false);
  });
});

describe('buildCabin', () => {
  it('returns a Group', () => {
    const mats = createTowerMaterialFallback();
    const result = buildCabin(mats, true);
    expect(result).toBeInstanceOf(THREE.Group);
  });

  it('has non-zero bounding box', () => {
    const mats = createTowerMaterialFallback();
    const result = buildCabin(mats, true);
    const box = new THREE.Box3().setFromObject(result);
    expect(box.isEmpty()).toBe(false);
  });
});

describe('buildAntenna', () => {
  it('returns a Group', () => {
    const result = buildAntenna();
    expect(result).toBeInstanceOf(THREE.Group);
  });

  it('has non-zero bounding box', () => {
    const result = buildAntenna();
    const box = new THREE.Box3().setFromObject(result);
    expect(box.isEmpty()).toBe(false);
  });
});
```

- [ ] **Step 2: Delete the old builder files**

```bash
git rm src/tower/builders/LegBuilder.ts
git rm src/tower/builders/LatticeBuilder.ts
git rm src/tower/builders/ArchBuilder.ts
```

- [ ] **Step 3: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all tests pass. No remaining imports reference the deleted files.

- [ ] **Step 4: Run build to verify no type errors**

Run: `npm run build`
Expected: PASS — build succeeds with no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add tests/builders.test.ts
git commit -m "refactor: remove old LegBuilder, LatticeBuilder, ArchBuilder and their tests"
```

---

### Final Verification

- [ ] Run `npm test` — all tests pass (existing + new leg-truss + new inter-leg-lattice + updated tower)
- [ ] Run `npm run build` — TypeScript compiles, Vite bundles successfully
- [ ] Run `npm run dev` — opens browser, tower renders with the new engineering-model lattice: 4 distinct truss legs at the base with visible X-bracing on all faces, dense riveted body lattice above 57m, curved arch panels filling the base faces between legs

All three commands must succeed before the work is complete.
