### Task 4: Update Tower Assembler

**Files:**
- Modify: `src/tower/Tower.ts`
- Modify: `tests/tower.test.ts`

- [ ] **Step 1: Update tests/tower.test.ts**

Replace the test block `it('contains meshes from all six builders', ...)` (around lines 12-19) with:

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

- [ ] **Step 2: Run test to verify it fails** — `npm test` → FAIL

- [ ] **Step 3: Update src/tower/Tower.ts**

Replace imports: change from old `buildLegs`, `buildLattice`, `buildArches` to new `buildLegTrusses`, `buildInterLegLattice`:

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

- [ ] **Step 4: Run test** — `npm test` → PASS (old builders still exist, tower uses new ones)

- [ ] **Step 5: Commit**

```bash
git add src/tower/Tower.ts tests/tower.test.ts
git commit -m "feat: update Tower assembler to use new engineering-model builders"
```
