### Task 9: CabinBuilder and AntennaBuilder

**Files:**
- Create: `src/tower/builders/CabinBuilder.ts`
- Create: `src/tower/builders/AntennaBuilder.ts`
- Modify: `tests/builders.test.ts` — add both builder tests

**Interfaces:**
- Produces: `buildCabin(mat: THREE.Material, fallback: boolean): THREE.Group`
- Produces: `buildAntenna(): THREE.Group`

- [ ] **Step 1: Add tests**

```typescript
import { buildCabin } from '../src/tower/builders/CabinBuilder';
import { buildAntenna } from '../src/tower/builders/AntennaBuilder';

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

- [ ] **Step 2: Run test**

```bash
npm test
```

Expected: FAIL.

- [ ] **Step 3: Create src/tower/builders/CabinBuilder.ts**

```typescript
import * as THREE from 'three';
import { profile } from '../profile';
import { HEIGHT_TOP } from '../../constants';

export function buildCabin(materials: THREE.Material[] | THREE.Material, fallback: boolean): THREE.Group {
  const group = new THREE.Group();
  const mat = fallback ? (materials as THREE.Material[])[0] : (materials as THREE.Material);
  const h = 276;
  const w = profile(h);

  const cabinWidth = w * 0.6;
  const cabinHeight = 20;
  const cabinY = h + cabinHeight / 2;

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(cabinWidth * 2, cabinHeight, cabinWidth * 2),
    mat,
  );
  body.position.y = cabinY;
  group.add(body);

  const topDeck = new THREE.Mesh(
    new THREE.BoxGeometry(cabinWidth * 2.4, 1.0, cabinWidth * 2.4),
    mat,
  );
  topDeck.position.y = h + cabinHeight;
  group.add(topDeck);

  group.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry.attributes.position) {
      const positions = child.geometry.attributes.position;
      const heightRatios = new Float32Array(positions.count);
      const vertex = new THREE.Vector3();
      const matrix = child.matrixWorld;
      for (let i = 0; i < positions.count; i++) {
        vertex.set(positions.getX(i), positions.getY(i), positions.getZ(i));
        vertex.applyMatrix4(matrix);
        heightRatios[i] = vertex.y / 301;
      }
      child.geometry.setAttribute('heightRatio', new THREE.BufferAttribute(heightRatios, 1));
    }
  });

  return group;
}
```

- [ ] **Step 4: Create src/tower/builders/AntennaBuilder.ts**

```typescript
import * as THREE from 'three';
import { antennaMaterial } from '../materials';
import { HEIGHT_TOP, ANTENNA_HEIGHT } from '../../constants';

export function buildAntenna(): THREE.Group {
  const group = new THREE.Group();

  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 1.2, ANTENNA_HEIGHT, 8),
    antennaMaterial,
  );
  mast.position.y = HEIGHT_TOP + ANTENNA_HEIGHT / 2;
  group.add(mast);

  const tip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.6, 2, 8),
    antennaMaterial,
  );
  tip.position.y = HEIGHT_TOP + ANTENNA_HEIGHT;
  group.add(tip);

  return group;
}
```

- [ ] **Step 5: Run test**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/tower/builders/CabinBuilder.ts src/tower/builders/AntennaBuilder.ts tests/builders.test.ts
git commit -m "feat: add CabinBuilder and AntennaBuilder"
```
