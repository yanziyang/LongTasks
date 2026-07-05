### Task 6: LatticeBuilder — Section-Aware X-Bracing

**Files:**
- Create: `src/tower/builders/LatticeBuilder.ts`
- Modify: `tests/builders.test.ts` — add LatticeBuilder tests

**Interfaces:**
- Consumes: `profile(h)`, `HEIGHT_TOP`, `RING_COUNT`, `PLATFORM_HEIGHTS`
- Produces: `buildLattice(mat: THREE.Material, fallback: boolean): THREE.Group`

The `cornerPoints` function is duplicated in LatticeBuilder.ts (keeps builders independent).

- [ ] **Step 1: Add LatticeBuilder tests to tests/builders.test.ts**

```typescript
// Append these tests to the existing file

import { buildLattice } from '../src/tower/builders/LatticeBuilder';

describe('buildLattice', () => {
  it('returns a Group', () => {
    const mats = createTowerMaterialFallback();
    const result = buildLattice(mats, true);
    expect(result).toBeInstanceOf(THREE.Group);
  });

  it('contains many lattice members', () => {
    const mats = createTowerMaterialFallback();
    const result = buildLattice(mats, true);
    const meshCount = countMeshes(result);
    expect(meshCount).toBeGreaterThan(100);
  });

  it('has non-zero bounding box', () => {
    const mats = createTowerMaterialFallback();
    const result = buildLattice(mats, true);
    const box = new THREE.Box3().setFromObject(result);
    expect(box.isEmpty()).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL — `buildLattice` not exported.

- [ ] **Step 3: Create src/tower/builders/LatticeBuilder.ts**

```typescript
import * as THREE from 'three';
import { profile } from '../profile';
import { HEIGHT_TOP, RING_COUNT, PLATFORM_HEIGHTS } from '../../constants';

const LATTICE_RADIUS = 0.4;

function cornerPoints(corner: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= RING_COUNT; i++) {
    const h = (HEIGHT_TOP * i) / RING_COUNT;
    const w = profile(h);
    const sx = corner === 0 || corner === 3 ? -w : w;
    const sz = corner === 0 || corner === 1 ? -w : w;
    pts.push(new THREE.Vector3(sx, h, sz));
  }
  return pts;
}

function sectionForHeight(h: number): number {
  if (h < PLATFORM_HEIGHTS[0]) return 0;
  if (h < PLATFORM_HEIGHTS[1]) return 1;
  return 2;
}

function beamBetween(a: THREE.Vector3, b: THREE.Vector3, mat: THREE.Material, radius: number): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  if (len < 0.01) return new THREE.Mesh();
  const geo = new THREE.CylinderGeometry(radius, radius, len, 6);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return mesh;
}

export function buildLattice(materials: THREE.Material[] | THREE.Material, fallback: boolean): THREE.Group {
  const group = new THREE.Group();
  const rings: THREE.Vector3[][] = [0, 1, 2, 3].map((c) => cornerPoints(c));
  const faces: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0]];

  for (const [a, b] of faces) {
    for (let i = 0; i < RING_COUNT; i++) {
      const h = (HEIGHT_TOP * i) / RING_COUNT;
      const section = sectionForHeight(h);

      let skip = false;
      if (section === 1) skip = i % 2 === 1;
      if (section === 2) skip = i % 3 !== 0;

      if (skip) continue;

      const botA = rings[a][i];
      const botB = rings[b][i];
      const topA = rings[a][i + 1];
      const topB = rings[b][i + 1];

      const mat = fallback
        ? (materials as THREE.Material[])[section]
        : (materials as THREE.Material);

      group.add(beamBetween(botA, topB, mat, LATTICE_RADIUS));
      group.add(beamBetween(botB, topA, mat, LATTICE_RADIUS));

      if (section === 0 || i % 2 === 0) {
        group.add(beamBetween(botA, botB, mat, LATTICE_RADIUS));
      }
    }
  }

  group.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      const geo = child.geometry;
      if (geo.attributes.position) {
        const positions = geo.attributes.position;
        const heightRatios = new Float32Array(positions.count);
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        for (let i = 0; i < positions.count; i++) {
          const localY = positions.getY(i);
          heightRatios[i] = (worldPos.y + localY) / HEIGHT_TOP;
        }
        geo.setAttribute('heightRatio', new THREE.BufferAttribute(heightRatios, 1));
      }
    }
  });

  return group;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test
```

Expected: PASS — all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/tower/builders/LatticeBuilder.ts tests/builders.test.ts
git commit -m "feat: add LatticeBuilder with section-aware X-bracing density"
```
