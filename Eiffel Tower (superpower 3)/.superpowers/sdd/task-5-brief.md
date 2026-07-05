### Task 5: LegBuilder — Four Curved Edge Beams

**Files:**
- Create: `src/tower/builders/LegBuilder.ts`
- Create: `tests/builders.test.ts`

**Interfaces:**
- Produces: `buildLegs(mat: THREE.ShaderMaterial | THREE.Material[], fallback: boolean): THREE.Group`

- [ ] **Step 1: Create tests/builders.test.ts**

```typescript
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { buildLegs } from '../src/tower/builders/LegBuilder';
import { createTowerMaterialFallback } from '../src/tower/materials';

describe('buildLegs', () => {
  it('returns a Group', () => {
    const mats = createTowerMaterialFallback();
    const result = buildLegs(mats, true);
    expect(result).toBeInstanceOf(THREE.Group);
  });

  it('contains at least 4 meshes (edge beams)', () => {
    const mats = createTowerMaterialFallback();
    const result = buildLegs(mats, true);
    const meshCount = countMeshes(result);
    expect(meshCount).toBeGreaterThanOrEqual(4);
  });

  it('has non-zero bounding box', () => {
    const mats = createTowerMaterialFallback();
    const result = buildLegs(mats, true);
    const box = new THREE.Box3().setFromObject(result);
    expect(box.isEmpty()).toBe(false);
  });
});

function countMeshes(obj: THREE.Object3D): number {
  let count = 0;
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) count++;
  });
  return count;
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL — `src/tower/builders/LegBuilder.ts` does not exist.

- [ ] **Step 3: Create src/tower/builders/LegBuilder.ts**

```typescript
import * as THREE from 'three';
import { profile } from '../profile';
import { HEIGHT_TOP, RING_COUNT } from '../../constants';

const PIER_RADIUS = 1.2;

function cornerPoints(corner: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const density = RING_COUNT;
  for (let i = 0; i <= density; i++) {
    const h = (HEIGHT_TOP * i) / density;
    const w = profile(h);
    const sx = corner === 0 || corner === 3 ? -w : w;
    const sz = corner === 0 || corner === 1 ? -w : w;
    pts.push(new THREE.Vector3(sx, h, sz));
  }
  return pts;
}

export function buildLegs(materials: THREE.Material[] | THREE.Material, fallback: boolean): THREE.Group {
  const group = new THREE.Group();

  for (let c = 0; c < 4; c++) {
    const pts = cornerPoints(c);
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, Math.floor(RING_COUNT / 2), PIER_RADIUS, 8, false);

    const positions = geo.attributes.position;
    const heightRatios = new Float32Array(positions.count);
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);
      heightRatios[i] = y / HEIGHT_TOP;
    }
    geo.setAttribute('heightRatio', new THREE.BufferAttribute(heightRatios, 1));

    const mat = fallback ? materials : (materials as THREE.Material);
    group.add(new THREE.Mesh(geo, mat));
  }

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
git add src/tower/builders/LegBuilder.ts tests/builders.test.ts
git commit -m "feat: add LegBuilder with 4 curved tubular edge beams"
```
