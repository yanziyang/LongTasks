### Task 5: Remove Old Builders and Clean Up Tests

**Files:**
- Delete: `src/tower/builders/LegBuilder.ts`
- Delete: `src/tower/builders/LatticeBuilder.ts`
- Delete: `src/tower/builders/ArchBuilder.ts`
- Modify: `tests/builders.test.ts`

- [ ] **Step 1: Update tests/builders.test.ts** — replace entire file content with (keeping only Platform/Cabin/Antenna + countMeshes):

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

- [ ] **Step 2: Delete old builders**

```bash
git rm src/tower/builders/LegBuilder.ts
git rm src/tower/builders/LatticeBuilder.ts
git rm src/tower/builders/ArchBuilder.ts
```

- [ ] **Step 3: Run tests** — `npm test` → PASS

- [ ] **Step 4: Run build** — `npm run build` → PASS

- [ ] **Step 5: Commit**

```bash
git add tests/builders.test.ts
git commit -m "refactor: remove old LegBuilder, LatticeBuilder, ArchBuilder and their tests"
```
