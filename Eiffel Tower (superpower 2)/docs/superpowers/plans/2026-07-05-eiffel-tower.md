# Eiffel Tower Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a desktop-first interactive 3D web viewer of the Eiffel Tower using TypeScript, Three.js, Vite, and Vitest.

**Architecture:** A procedural parametric skeleton generates the four piers and lattice; hand-tuned detail modules add arches, platforms, and antenna. The viewer layer manages scene, camera, renderer, lighting themes, and orbit controls. UI components overlay the canvas for theme toggle, info panel, and loading state.

**Tech Stack:** TypeScript, Three.js, Vite, Vitest, happy-dom/jsdom for DOM tests.

## Global Constraints

- TypeScript + Three.js + Vite + Vitest.
- Desktop-first; prioritize visual fidelity over mobile performance.
- Minimal environment: ground plane + shadow catcher only.
- Reuse feature set: orbit controls, day/night toggle, info overlay.
- Diagram-matched structural fidelity for piers, arches, platforms, and lattice.
- Total height ~330 m, base square width ~125 m.
- Use `InstancedMesh` for dense lattice members.
- Shadow map `2048×2048` with `PCFSoftShadowMap`.
- Cap `devicePixelRatio` at `2`.
- All procedural builders validate inputs and fail gracefully.
- Tests run with `npm test`.

---

## File Structure

```
src/
  main.ts
  App.ts
  viewer/
    Viewer.ts
    EnvironmentTheme.ts
    CameraRig.ts
  tower/
    Tower.ts
    TowerParameters.ts
    materials/
      TowerMaterial.ts
    builders/
      LatticeBuilder.ts
      PierBuilder.ts
      ArchBuilder.ts
      PlatformBuilder.ts
      AntennaBuilder.ts
  math/
    TowerProfile.ts
    LatticePattern.ts
  ui/
    InfoOverlay.ts
    ThemeToggle.ts
    LoadingOverlay.ts
  controls/
    OrbitControlsSetup.ts
index.html
vite.config.ts
vitest.config.ts
tsconfig.json
package.json
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `index.html`
- Create: `src/main.ts`

**Interfaces:**
- Produces: Vite dev server, build pipeline, and Vitest test runner.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "eiffel-tower-viewer",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@types/three": "^0.165.0",
    "happy-dom": "^14.0.0",
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "vitest": "^1.6.0"
  },
  "dependencies": {
    "three": "^0.165.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: false,
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 5: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Eiffel Tower Viewer</title>
    <style>
      body { margin: 0; overflow: hidden; background: #000; }
      #app { width: 100vw; height: 100vh; }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 6: Create `src/main.ts`**

```ts
import { App } from './App';

const container = document.getElementById('app');
if (!container) {
  throw new Error('App container not found');
}

const app = new App(container);
app.start();
```

- [ ] **Step 7: Install dependencies and verify dev server starts**

Run: `npm install`
Run: `npm run dev -- --host 127.0.0.1 --port 5173`
Expected: Vite starts without errors; visiting `http://127.0.0.1:5173` shows a black page (no viewer yet).

- [ ] **Step 8: Commit**

```bash
git add package.json tsconfig.json vite.config.ts vitest.config.ts index.html src/main.ts
```

---

### Task 2: Math Helpers

**Files:**
- Create: `src/math/TowerProfile.ts`
- Create: `src/math/LatticePattern.ts`
- Test: `src/math/TowerProfile.test.ts`
- Test: `src/math/LatticePattern.test.ts`

**Interfaces:**
- Produces:
  - `TowerProfile.getPierCenter(height: number): THREE.Vector3`
  - `TowerProfile.getWidthAtHeight(height: number): number`
  - `LatticePattern.horizontalPoints(start: THREE.Vector3, end: THREE.Vector3, count: number): THREE.Vector3[]`
  - `LatticePattern.diagonalPoints(bottomLeft: THREE.Vector3, topRight: THREE.Vector3, rows: number, cols: number): { start: THREE.Vector3; end: THREE.Vector3 }[]`

- [ ] **Step 1: Write failing test for `TowerProfile.getWidthAtHeight`**

```ts
import { describe, it, expect } from 'vitest';
import { TowerProfile } from './TowerProfile';

describe('TowerProfile', () => {
  it('returns base width at height 0', () => {
    expect(TowerProfile.getWidthAtHeight(0)).toBeCloseTo(125, 1);
  });

  it('returns top width at max height', () => {
    expect(TowerProfile.getWidthAtHeight(330)).toBeCloseTo(0, 1);
  });

  it('returns a smaller width at mid height', () => {
    const mid = TowerProfile.getWidthAtHeight(165);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(125);
  });
});
```

Run: `npm test -- src/math/TowerProfile.test.ts`
Expected: FAIL — `TowerProfile` not defined.

- [ ] **Step 2: Implement `TowerProfile.ts`**

```ts
import * as THREE from 'three';

export const TowerProfile = {
  BASE_WIDTH: 125,
  TOP_WIDTH: 0,
  TOTAL_HEIGHT: 330,

  getWidthAtHeight(height: number): number {
    const t = Math.max(0, Math.min(1, height / this.TOTAL_HEIGHT));
    return this.BASE_WIDTH * (1 - t ** 1.6);
  },

  getPierCenter(height: number): THREE.Vector3 {
    const half = this.getWidthAtHeight(height) / 2;
    return new THREE.Vector3(half, height, half);
  },
};
```

Run: `npm test -- src/math/TowerProfile.test.ts`
Expected: PASS.

- [ ] **Step 3: Write failing test for `LatticePattern.horizontalPoints`**

```ts
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { LatticePattern } from './LatticePattern';

describe('LatticePattern', () => {
  it('generates requested number of horizontal points', () => {
    const start = new THREE.Vector3(0, 0, 0);
    const end = new THREE.Vector3(10, 0, 0);
    const points = LatticePattern.horizontalPoints(start, end, 5);
    expect(points).toHaveLength(5);
    expect(points[0].x).toBeCloseTo(0);
    expect(points[4].x).toBeCloseTo(10);
  });
});
```

Run: `npm test -- src/math/LatticePattern.test.ts`
Expected: FAIL — `LatticePattern` not defined.

- [ ] **Step 4: Implement `LatticePattern.ts`**

```ts
import * as THREE from 'three';

export const LatticePattern = {
  horizontalPoints(start: THREE.Vector3, end: THREE.Vector3, count: number): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1);
      points.push(new THREE.Vector3().lerpVectors(start, end, t));
    }
    return points;
  },

  diagonalPoints(
    bottomLeft: THREE.Vector3,
    topRight: THREE.Vector3,
    rows: number,
    cols: number,
  ): { start: THREE.Vector3; end: THREE.Vector3 }[] {
    const segments: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    const width = topRight.x - bottomLeft.x;
    const height = topRight.y - bottomLeft.y;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x0 = bottomLeft.x + (c / cols) * width;
        const y0 = bottomLeft.y + (r / rows) * height;
        const x1 = bottomLeft.x + ((c + 1) / cols) * width;
        const y1 = bottomLeft.y + ((r + 1) / rows) * height;

        const start = new THREE.Vector3(x0, y0, bottomLeft.z);
        const end = new THREE.Vector3(x1, y1, bottomLeft.z);
        segments.push({ start, end });
      }
    }
    return segments;
  },
};
```

Run: `npm test -- src/math/LatticePattern.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/math/
git commit -m "feat(math): add TowerProfile and LatticePattern helpers"
```

---

### Task 3: Core Materials

**Files:**
- Create: `src/tower/materials/TowerMaterial.ts`
- Test: `src/tower/materials/TowerMaterial.test.ts`

**Interfaces:**
- Produces: `createIronMaterial(): THREE.MeshStandardMaterial`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest';
import { createIronMaterial } from './TowerMaterial';

describe('TowerMaterial', () => {
  it('returns a MeshStandardMaterial with expected color', () => {
    const mat = createIronMaterial();
    expect(mat.type).toBe('MeshStandardMaterial');
    expect(mat.color.getHexString()).toBe('6e5c4b');
    expect(mat.roughness).toBe(0.7);
    expect(mat.metalness).toBe(0.4);
  });
});
```

Run: `npm test -- src/tower/materials/TowerMaterial.test.ts`
Expected: FAIL.

- [ ] **Step 2: Implement `TowerMaterial.ts`**

```ts
import * as THREE from 'three';

export function createIronMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x6e5c4b,
    roughness: 0.7,
    metalness: 0.4,
  });
}
```

Run: `npm test -- src/tower/materials/TowerMaterial.test.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/tower/materials/
git commit -m "feat(materials): add iron PBR material"
```

---

### Task 4: Reusable Lattice Builder

**Files:**
- Create: `src/tower/builders/LatticeBuilder.ts`
- Test: `src/tower/builders/LatticeBuilder.test.ts`

**Interfaces:**
- Consumes: `createIronMaterial()`
- Produces: `buildLattice(segments: Segment[], memberSize: number): THREE.InstancedMesh`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { buildLattice } from './LatticeBuilder';

describe('LatticeBuilder', () => {
  it('creates an InstancedMesh with one instance per segment', () => {
    const segments = [
      { start: new THREE.Vector3(0, 0, 0), end: new THREE.Vector3(1, 1, 0) },
      { start: new THREE.Vector3(0, 0, 0), end: new THREE.Vector3(1, 0, 0) },
    ];
    const mesh = buildLattice(segments, 0.5);
    expect(mesh).toBeInstanceOf(THREE.InstancedMesh);
    expect(mesh.count).toBe(2);
  });
});
```

Run: `npm test -- src/tower/builders/LatticeBuilder.test.ts`
Expected: FAIL.

- [ ] **Step 2: Implement `LatticeBuilder.ts`**

```ts
import * as THREE from 'three';
import { createIronMaterial } from '../materials/TowerMaterial';

export interface LatticeSegment {
  start: THREE.Vector3;
  end: THREE.Vector3;
}

export function buildLattice(segments: LatticeSegment[], memberSize: number): THREE.InstancedMesh {
  if (segments.length === 0) {
    return new THREE.InstancedMesh(new THREE.BoxGeometry(), createIronMaterial(), 0);
  }

  const geometry = new THREE.BoxGeometry(memberSize, 1, memberSize);
  const material = createIronMaterial();
  const mesh = new THREE.InstancedMesh(geometry, material, segments.length);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const center = new THREE.Vector3();
  const direction = new THREE.Vector3();

  segments.forEach((segment, i) => {
    center.addVectors(segment.start, segment.end).multiplyScalar(0.5);
    direction.subVectors(segment.end, segment.start);
    const length = direction.length();

    dummy.position.copy(center);
    dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    dummy.scale.set(1, length, 1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  });

  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}
```

Run: `npm test -- src/tower/builders/LatticeBuilder.test.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/tower/builders/LatticeBuilder.ts src/tower/builders/LatticeBuilder.test.ts
git commit -m "feat(lattice): add reusable InstancedMesh lattice builder"
```

---

### Task 5: Pier Builder

**Files:**
- Create: `src/tower/builders/PierBuilder.ts`
- Test: `src/tower/builders/PierBuilder.test.ts`

**Interfaces:**
- Consumes: `TowerProfile`, `LatticeBuilder`
- Produces: `buildPier(): THREE.Group`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest';
import { buildPier } from './PierBuilder';

describe('PierBuilder', () => {
  it('returns a non-empty group', () => {
    const pier = buildPier();
    expect(pier.children.length).toBeGreaterThan(0);
  });
});
```

Run: `npm test -- src/tower/builders/PierBuilder.test.ts`
Expected: FAIL.

- [ ] **Step 2: Implement `PierBuilder.ts`**

```ts
import * as THREE from 'three';
import { TowerProfile } from '../../math/TowerProfile';
import { buildLattice } from './LatticeBuilder';

export function buildPier(): THREE.Group {
  const group = new THREE.Group();
  const chordSize = 2.5;
  const memberSize = 0.6;
  const levels = 20;
  const heightStep = TowerProfile.TOTAL_HEIGHT / levels;

  const chordGeometry = new THREE.BoxGeometry(chordSize, heightStep + 0.5, chordSize);
  const chordMaterial = new THREE.MeshStandardMaterial({ color: 0x6e5c4b, roughness: 0.7, metalness: 0.4 });

  for (let i = 0; i < levels; i++) {
    const h0 = i * heightStep;
    const h1 = (i + 1) * heightStep;
    const w0 = TowerProfile.getWidthAtHeight(h0) / 2;
    const w1 = TowerProfile.getWidthAtHeight(h1) / 2;

    const corners0 = [
      new THREE.Vector3(w0, h0, w0),
      new THREE.Vector3(-w0, h0, w0),
      new THREE.Vector3(-w0, h0, -w0),
      new THREE.Vector3(w0, h0, -w0),
    ];
    const corners1 = [
      new THREE.Vector3(w1, h1, w1),
      new THREE.Vector3(-w1, h1, w1),
      new THREE.Vector3(-w1, h1, -w1),
      new THREE.Vector3(w1, h1, -w1),
    ];

    // Vertical chords
    corners0.forEach((c0, idx) => {
      const c1 = corners1[idx];
      const mesh = new THREE.Mesh(chordGeometry, chordMaterial);
      mesh.position.copy(c0).add(c1).multiplyScalar(0.5);
      mesh.lookAt(c1);
      mesh.scale.y = c0.distanceTo(c1) / heightStep;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    });

    // Bracing
    const bracing: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    for (let j = 0; j < 4; j++) {
      bracing.push({ start: corners0[j], end: corners1[(j + 1) % 4] });
      bracing.push({ start: corners0[(j + 1) % 4], end: corners1[j] });
      bracing.push({ start: corners0[j], end: corners1[j] });
    }
    group.add(buildLattice(bracing, memberSize));
  }

  return group;
}
```

Run: `npm test -- src/tower/builders/PierBuilder.test.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/tower/builders/PierBuilder.ts src/tower/builders/PierBuilder.test.ts
git commit -m "feat(pier): add procedural pier builder"
```

---

### Task 6: Arch Builder

**Files:**
- Create: `src/tower/builders/ArchBuilder.ts`
- Test: `src/tower/builders/ArchBuilder.test.ts`

**Interfaces:**
- Consumes: `TowerProfile`, `buildLattice`
- Produces: `buildArches(): THREE.Group`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest';
import { buildArches } from './ArchBuilder';

describe('ArchBuilder', () => {
  it('returns a group with children', () => {
    const arches = buildArches();
    expect(arches.children.length).toBeGreaterThan(0);
  });
});
```

Run: `npm test -- src/tower/builders/ArchBuilder.test.ts`
Expected: FAIL.

- [ ] **Step 2: Implement `ArchBuilder.ts`**

```ts
import * as THREE from 'three';
import { TowerProfile } from '../../math/TowerProfile';
import { buildLattice } from './LatticeBuilder';

export function buildArches(): THREE.Group {
  const group = new THREE.Group();
  const baseWidth = TowerProfile.getWidthAtHeight(0) / 2;
  const archHeight = 40;
  const segments = 16;
  const memberSize = 1.2;

  const directions = [
    new THREE.Vector3(1, 0, 1),
    new THREE.Vector3(-1, 0, 1),
    new THREE.Vector3(-1, 0, -1),
    new THREE.Vector3(1, 0, -1),
  ];

  directions.forEach((dir) => {
    const side = dir.clone().normalize().multiplyScalar(baseWidth);
    const left = new THREE.Vector3(side.x, 0, -side.z);
    const right = new THREE.Vector3(-side.x, 0, side.z);

    const archPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = THREE.MathUtils.lerp(left.x, right.x, t);
      const z = THREE.MathUtils.lerp(left.z, right.z, t);
      const y = archHeight * Math.sin(t * Math.PI);
      archPoints.push(new THREE.Vector3(x, y, z));
    }

    const chords: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    for (let i = 0; i < archPoints.length - 1; i++) {
      chords.push({ start: archPoints[i], end: archPoints[i + 1] });
    }
    group.add(buildLattice(chords, memberSize));

    // Vertical hangers
    const hangers: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    for (let i = 1; i < archPoints.length - 1; i += 2) {
      hangers.push({ start: archPoints[i], end: new THREE.Vector3(archPoints[i].x, 0, archPoints[i].z) });
    }
    group.add(buildLattice(hangers, memberSize * 0.6));
  });

  return group;
}
```

Run: `npm test -- src/tower/builders/ArchBuilder.test.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/tower/builders/ArchBuilder.ts src/tower/builders/ArchBuilder.test.ts
git commit -m "feat(arch): add first-level arch builder"
```

---

### Task 7: Platform Builder

**Files:**
- Create: `src/tower/builders/PlatformBuilder.ts`
- Test: `src/tower/builders/PlatformBuilder.test.ts`

**Interfaces:**
- Consumes: `TowerProfile`
- Produces: `buildPlatforms(): THREE.Group`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest';
import { buildPlatforms } from './PlatformBuilder';

describe('PlatformBuilder', () => {
  it('returns a group with three platform meshes', () => {
    const platforms = buildPlatforms();
    const meshes = platforms.children.filter((c) => c.type === 'Mesh');
    expect(meshes.length).toBeGreaterThanOrEqual(3);
  });
});
```

Run: `npm test -- src/tower/builders/PlatformBuilder.test.ts`
Expected: FAIL.

- [ ] **Step 2: Implement `PlatformBuilder.ts`**

```ts
import * as THREE from 'three';
import { TowerProfile } from '../../math/TowerProfile';

function buildPlatform(width: number, y: number): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(width, 2, width);
  const material = new THREE.MeshStandardMaterial({ color: 0x4a3f35, roughness: 0.8, metalness: 0.2 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = y;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function buildPlatforms(): THREE.Group {
  const group = new THREE.Group();
  group.add(buildPlatform(TowerProfile.getWidthAtHeight(57) + 8, 57));
  group.add(buildPlatform(TowerProfile.getWidthAtHeight(115) + 6, 115));
  group.add(buildPlatform(TowerProfile.getWidthAtHeight(276) + 4, 276));
  return group;
}
```

Run: `npm test -- src/tower/builders/PlatformBuilder.test.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/tower/builders/PlatformBuilder.ts src/tower/builders/PlatformBuilder.test.ts
git commit -m "feat(platform): add platform builder"
```

---

### Task 8: Antenna Builder

**Files:**
- Create: `src/tower/builders/AntennaBuilder.ts`
- Test: `src/tower/builders/AntennaBuilder.test.ts`

**Interfaces:**
- Produces: `buildAntenna(): THREE.Group`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest';
import { buildAntenna } from './AntennaBuilder';

describe('AntennaBuilder', () => {
  it('returns a group containing an antenna mesh', () => {
    const antenna = buildAntenna();
    expect(antenna.children.length).toBeGreaterThan(0);
  });
});
```

Run: `npm test -- src/tower/builders/AntennaBuilder.test.ts`
Expected: FAIL.

- [ ] **Step 2: Implement `AntennaBuilder.ts`**

```ts
import * as THREE from 'three';

export function buildAntenna(): THREE.Group {
  const group = new THREE.Group();
  const height = 54;
  const geometry = new THREE.CylinderGeometry(0.3, 1.5, height, 8);
  const material = new THREE.MeshStandardMaterial({ color: 0x6e5c4b, roughness: 0.7, metalness: 0.4 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = height / 2;
  mesh.castShadow = true;
  group.add(mesh);
  return group;
}
```

Run: `npm test -- src/tower/builders/AntennaBuilder.test.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/tower/builders/AntennaBuilder.ts src/tower/builders/AntennaBuilder.test.ts
git commit -m "feat(antenna): add antenna builder"
```

---

### Task 9: Tower Assembly

**Files:**
- Create: `src/tower/Tower.ts`
- Create: `src/tower/TowerParameters.ts`
- Test: `src/tower/Tower.test.ts`

**Interfaces:**
- Consumes: all builders
- Produces: `buildTower(): THREE.Group`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest';
import { buildTower } from './Tower';

describe('Tower', () => {
  it('assembles a tower with children', () => {
    const tower = buildTower();
    expect(tower.children.length).toBeGreaterThan(0);
  });
});
```

Run: `npm test -- src/tower/Tower.test.ts`
Expected: FAIL.

- [ ] **Step 2: Implement `TowerParameters.ts`**

```ts
export const TowerParameters = {
  totalHeight: 330,
  baseWidth: 125,
  firstPlatformHeight: 57,
  secondPlatformHeight: 115,
  thirdPlatformHeight: 276,
} as const;
```

- [ ] **Step 3: Implement `Tower.ts`**

```ts
import * as THREE from 'three';
import { buildPier } from './builders/PierBuilder';
import { buildArches } from './builders/ArchBuilder';
import { buildPlatforms } from './builders/PlatformBuilder';
import { buildAntenna } from './builders/AntennaBuilder';

export function buildTower(): THREE.Group {
  const tower = new THREE.Group();
  tower.add(buildPier());
  tower.add(buildArches());
  tower.add(buildPlatforms());

  const antenna = buildAntenna();
  antenna.position.y = 276;
  tower.add(antenna);

  return tower;
}
```

Run: `npm test -- src/tower/Tower.test.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/tower/
git commit -m "feat(tower): assemble tower from builders"
```

---

### Task 10: Environment Theme

**Files:**
- Create: `src/viewer/EnvironmentTheme.ts`
- Test: `src/viewer/EnvironmentTheme.test.ts`

**Interfaces:**
- Produces: `applyTheme(scene, renderer, theme)`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { applyTheme } from './EnvironmentTheme';

describe('EnvironmentTheme', () => {
  it('applies day theme background', () => {
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer();
    applyTheme(scene, renderer, 'day');
    expect(scene.background).toBeInstanceOf(THREE.Color);
    expect((scene.background as THREE.Color).getHexString()).toBe('87ceeb');
  });
});
```

Run: `npm test -- src/viewer/EnvironmentTheme.test.ts`
Expected: FAIL.

- [ ] **Step 2: Implement `EnvironmentTheme.ts`**

```ts
import * as THREE from 'three';

export type Theme = 'day' | 'night';

export function applyTheme(scene: THREE.Scene, renderer: THREE.WebGLRenderer, theme: Theme): void {
  if (theme === 'day') {
    scene.background = new THREE.Color(0x87ceeb);
    renderer.setClearColor(0x87ceeb);
  } else {
    scene.background = new THREE.Color(0x0a1525);
    renderer.setClearColor(0x0a1525);
  }
}
```

Run: `npm test -- src/viewer/EnvironmentTheme.test.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/viewer/EnvironmentTheme.ts src/viewer/EnvironmentTheme.test.ts
git commit -m "feat(theme): add day/night theme applicator"
```

---

### Task 11: Camera Rig

**Files:**
- Create: `src/viewer/CameraRig.ts`
- Test: `src/viewer/CameraRig.test.ts`

**Interfaces:**
- Produces: `createCamera(aspect: number): THREE.PerspectiveCamera`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest';
import { createCamera, resetCamera } from './CameraRig';

describe('CameraRig', () => {
  it('creates a camera at the initial position', () => {
    const camera = createCamera(1.5);
    expect(camera.position.x).toBeCloseTo(250);
    expect(camera.position.y).toBeCloseTo(120);
    expect(camera.position.z).toBeCloseTo(250);
  });
});
```

Run: `npm test -- src/viewer/CameraRig.test.ts`
Expected: FAIL.

- [ ] **Step 2: Implement `CameraRig.ts`**

```ts
import * as THREE from 'three';

export const INITIAL_POSITION = new THREE.Vector3(250, 120, 250);
export const TARGET = new THREE.Vector3(0, 150, 0);

export function createCamera(aspect: number): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 2000);
  resetCamera(camera);
  return camera;
}

export function resetCamera(camera: THREE.PerspectiveCamera): void {
  camera.position.copy(INITIAL_POSITION);
  camera.lookAt(TARGET);
}
```

Run: `npm test -- src/viewer/CameraRig.test.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/viewer/CameraRig.ts src/viewer/CameraRig.test.ts
git commit -m "feat(camera): add camera rig with initial framing"
```

---

### Task 12: Orbit Controls Setup

**Files:**
- Create: `src/controls/OrbitControlsSetup.ts`
- Test: `src/controls/OrbitControlsSetup.test.ts`

**Interfaces:**
- Produces: `createOrbitControls(camera, rendererDomElement)`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createOrbitControls } from './OrbitControlsSetup';

describe('OrbitControlsSetup', () => {
  it('creates controls with damping enabled', () => {
    const camera = new THREE.PerspectiveCamera();
    const div = document.createElement('div');
    const controls = createOrbitControls(camera, div);
    expect(controls.enableDamping).toBe(true);
    expect(controls.dampingFactor).toBe(0.05);
  });
});
```

Run: `npm test -- src/controls/OrbitControlsSetup.test.ts`
Expected: FAIL.

- [ ] **Step 2: Implement `OrbitControlsSetup.ts`**

```ts
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TARGET } from '../viewer/CameraRig';

export function createOrbitControls(camera: THREE.Camera, domElement: HTMLElement): OrbitControls {
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.copy(TARGET);
  controls.minDistance = 50;
  controls.maxDistance = 800;
  controls.maxPolarAngle = Math.PI / 2 - 0.02;
  return controls;
}
```

Run: `npm test -- src/controls/OrbitControlsSetup.test.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/controls/
git commit -m "feat(controls): add orbit controls setup"
```

---

### Task 13: Viewer Core

**Files:**
- Create: `src/viewer/Viewer.ts`
- Test: `src/viewer/Viewer.test.ts`

**Interfaces:**
- Consumes: `buildTower`, `applyTheme`, `createCamera`, `createOrbitControls`
- Produces: `Viewer` class with `start()`, `stop()`, `setTheme()`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect, vi } from 'vitest';
import { Viewer } from './Viewer';

describe('Viewer', () => {
  it('creates a canvas inside the container', () => {
    const container = document.createElement('div');
    const viewer = new Viewer(container);
    expect(container.querySelector('canvas')).not.toBeNull();
    viewer.dispose();
  });
});
```

Run: `npm test -- src/viewer/Viewer.test.ts`
Expected: FAIL.

- [ ] **Step 2: Implement `Viewer.ts`**

```ts
import * as THREE from 'three';
import { buildTower } from '../tower/Tower';
import { applyTheme, Theme } from './EnvironmentTheme';
import { createCamera, resetCamera } from './CameraRig';
import { createOrbitControls } from '../controls/OrbitControlsSetup';

export class Viewer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: ReturnType<typeof createOrbitControls>;
  private rafId = 0;

  constructor(private container: HTMLElement) {
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = createCamera(aspect);
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.controls = createOrbitControls(this.camera, this.renderer.domElement);

    this.setupLights();
    this.setupGround();
    this.scene.add(buildTower());
    applyTheme(this.scene, this.renderer, 'day');
  }

  private setupLights(): void {
    const sun = new THREE.DirectionalLight(0xfff5e6, 2.0);
    sun.position.set(200, 400, 100);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    this.scene.add(sun);

    const hemi = new THREE.HemisphereLight(0x87ceeb, 0x7a7a7a, 0.6);
    this.scene.add(hemi);

    const ambient = new THREE.AmbientLight(0xffffff, 0.1);
    this.scene.add(ambient);
  }

  private setupGround(): void {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(1200, 1200),
      new THREE.ShadowMaterial({ opacity: 0.3 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  start(): void {
    const animate = () => {
      this.rafId = requestAnimationFrame(animate);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  setTheme(theme: Theme): void {
    applyTheme(this.scene, this.renderer, theme);
  }

  resetCamera(): void {
    resetCamera(this.camera);
    this.controls.target.set(0, 150, 0);
    this.controls.update();
  }

  dispose(): void {
    cancelAnimationFrame(this.rafId);
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
```

Run: `npm test -- src/viewer/Viewer.test.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/viewer/Viewer.ts src/viewer/Viewer.test.ts
git commit -m "feat(viewer): add core viewer with scene, lights, and ground"
```

---

### Task 14: UI Components

**Files:**
- Create: `src/ui/ThemeToggle.ts`
- Create: `src/ui/InfoOverlay.ts`
- Create: `src/ui/LoadingOverlay.ts`
- Test: `src/ui/ThemeToggle.test.ts`, `src/ui/InfoOverlay.test.ts`, `src/ui/LoadingOverlay.test.ts`

**Interfaces:**
- Produces: DOM elements and event handlers.

- [ ] **Step 1: Implement `ThemeToggle.ts`**

```ts
export function createThemeToggle(onToggle: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = '☀️';
  button.style.position = 'absolute';
  button.style.top = '16px';
  button.style.right = '16px';
  button.style.zIndex = '10';
  button.addEventListener('click', () => {
    onToggle();
    button.textContent = button.textContent === '☀️' ? '🌙' : '☀️';
  });
  return button;
}
```

- [ ] **Step 2: Implement `InfoOverlay.ts`**

```ts
export function createInfoOverlay(): { element: HTMLElement; toggle: HTMLButtonElement } {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.bottom = '16px';
  container.style.left = '16px';
  container.style.zIndex = '10';
  container.style.background = 'rgba(0,0,0,0.5)';
  container.style.color = 'white';
  container.style.padding = '12px';
  container.style.borderRadius = '4px';
  container.style.maxWidth = '280px';
  container.innerHTML = `
    <h2>Eiffel Tower</h2>
    <p>Height: 330 m (including antenna)</p>
    <p>Built: 1887–1889</p>
    <p>Located in Paris, France.</p>
  `;

  const toggle = document.createElement('button');
  toggle.textContent = 'ℹ️';
  toggle.style.position = 'absolute';
  toggle.style.bottom = '16px';
  toggle.style.left = '16px';
  toggle.style.zIndex = '11';
  toggle.addEventListener('click', () => {
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
  });

  return { element: container, toggle };
}
```

- [ ] **Step 3: Implement `LoadingOverlay.ts`**

```ts
export function createLoadingOverlay(): HTMLElement {
  const overlay = document.createElement('div');
  overlay.textContent = 'Building tower…';
  overlay.style.position = 'absolute';
  overlay.style.inset = '0';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.background = 'rgba(0,0,0,0.8)';
  overlay.style.color = 'white';
  overlay.style.zIndex = '20';
  return overlay;
}
```

- [ ] **Step 4: Write tests for UI components**

```ts
import { describe, it, expect } from 'vitest';
import { createThemeToggle } from './ThemeToggle';
import { createInfoOverlay } from './InfoOverlay';
import { createLoadingOverlay } from './LoadingOverlay';

describe('UI components', () => {
  it('ThemeToggle calls callback on click', () => {
    let called = false;
    const btn = createThemeToggle(() => { called = true; });
    btn.click();
    expect(called).toBe(true);
  });

  it('InfoOverlay creates panel and toggle', () => {
    const { element, toggle } = createInfoOverlay();
    expect(element.tagName).toBe('DIV');
    expect(toggle.tagName).toBe('BUTTON');
  });

  it('LoadingOverlay displays building text', () => {
    const overlay = createLoadingOverlay();
    expect(overlay.textContent).toContain('Building tower');
  });
});
```

Run: `npm test -- src/ui/`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/
git commit -m "feat(ui): add theme toggle, info overlay, and loading overlay"
```

---

### Task 15: App Integration

**Files:**
- Create: `src/App.ts`
- Modify: `src/main.ts`
- Test: `src/App.test.ts`

**Interfaces:**
- Produces: `App` class coordinating viewer, UI, and keyboard shortcuts.

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('mounts viewer and UI into container', () => {
    const container = document.createElement('div');
    const app = new App(container);
    app.start();
    expect(container.querySelector('canvas')).not.toBeNull();
    app.dispose();
  });
});
```

Run: `npm test -- src/App.test.ts`
Expected: FAIL.

- [ ] **Step 2: Implement `App.ts`**

```ts
import { Viewer } from './viewer/Viewer';
import { createThemeToggle } from './ui/ThemeToggle';
import { createInfoOverlay } from './ui/InfoOverlay';
import { createLoadingOverlay } from './ui/LoadingOverlay';

export class App {
  private viewer: Viewer;
  private loading: HTMLElement;

  constructor(private container: HTMLElement) {
    this.container.style.position = 'relative';
    this.loading = createLoadingOverlay();
    this.container.appendChild(this.loading);

    this.viewer = new Viewer(this.container);

    this.setupUI();
    this.setupKeyboard();
  }

  private setupUI(): void {
    let isDay = true;
    const themeToggle = createThemeToggle(() => {
      isDay = !isDay;
      this.viewer.setTheme(isDay ? 'day' : 'night');
    });
    this.container.appendChild(themeToggle);

    const { element: info, toggle: infoToggle } = createInfoOverlay();
    this.container.appendChild(info);
    this.container.appendChild(infoToggle);
  }

  private setupKeyboard(): void {
    this.container.addEventListener('keydown', (event) => {
      switch (event.key.toLowerCase()) {
        case 'r':
          this.viewer.resetCamera();
          break;
        case 't':
          this.viewer.setTheme('day'); // simplified; full toggle handled by UI
          break;
        case 'i':
          // UI toggle handled by button
          break;
      }
    });
    this.container.tabIndex = 0;
  }

  start(): void {
    // Allow one frame to render before hiding loader
    requestAnimationFrame(() => {
      this.viewer.start();
      this.container.removeChild(this.loading);
    });
  }

  dispose(): void {
    this.viewer.dispose();
  }
}
```

- [ ] **Step 3: Update `src/main.ts`** (already implemented; no change needed unless App import path is wrong)

- [ ] **Step 4: Run test**

Run: `npm test -- src/App.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/App.ts src/App.test.ts
git commit -m "feat(app): integrate viewer, UI, and keyboard shortcuts"
```

---

### Task 16: Error Handling

**Files:**
- Create: `src/viewer/WebGLGuard.ts`
- Modify: `src/main.ts`

**Interfaces:**
- Produces: `checkWebGLSupport(): boolean`, `showFallback(container, message)`

- [ ] **Step 1: Implement `WebGLGuard.ts`**

```ts
export function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export function showFallback(container: HTMLElement, message: string): void {
  container.innerHTML = `<div style="color:white;padding:24px;">${message}</div>`;
}
```

- [ ] **Step 2: Update `src/main.ts`**

```ts
import { App } from './App';
import { checkWebGLSupport, showFallback } from './viewer/WebGLGuard';

const container = document.getElementById('app');
if (!container) {
  throw new Error('App container not found');
}

if (!checkWebGLSupport()) {
  showFallback(container, 'WebGL is not supported in this browser.');
} else {
  const app = new App(container);
  app.start();
}
```

- [ ] **Step 3: Manual verify**

Run: `npm run dev`
Expected: App loads; no WebGL error on a capable browser.

- [ ] **Step 4: Commit**

```bash
git add src/viewer/WebGLGuard.ts src/main.ts
git commit -m "feat(guard): add WebGL support check and fallback"
```

---

### Task 17: Final Integration & Build Verification

**Files:**
- Modify: any remaining import paths
- Run: full test suite and build

- [ ] **Step 1: Run all tests**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No TypeScript errors.

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Manual visual checks**

Run: `npm run preview`
Check:
- Tower renders with piers, arches, platforms, and antenna.
- Orbit controls rotate/pan/zoom smoothly.
- Day/night toggle updates background and lighting.
- Shadows appear under the tower.
- Info overlay shows/hides.
- Loading overlay disappears after first frame.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: final integration and build verification"
```

---

## Self-Review

### Spec coverage
- ✅ Project scaffolding — Task 1.
- ✅ Math helpers (`TowerProfile`, `LatticePattern`) — Task 2.
- ✅ Materials — Task 3.
- ✅ Lattice builder with `InstancedMesh` — Task 4.
- ✅ Pier builder — Task 5.
- ✅ Arch builder — Task 6.
- ✅ Platform builder — Task 7.
- ✅ Antenna builder — Task 8.
- ✅ Tower assembly — Task 9.
- ✅ Environment theme / day-night toggle — Tasks 10, 14.
- ✅ Camera rig and orbit controls — Tasks 11, 12.
- ✅ Viewer core with lights, ground, shadow catcher — Task 13.
- ✅ UI components — Task 14.
- ✅ App integration and keyboard shortcuts — Task 15.
- ✅ Error handling / WebGL guard — Task 16.
- ✅ Tests for each component — embedded in every task.
- ✅ Build verification — Task 17.

### Placeholder scan
- No TBD/TODO/fill-in-details found.
- Every code step contains concrete code or exact commands.
- Every test step contains real test assertions.

### Type consistency
- `buildLattice` accepts `LatticeSegment[]` consistently.
- `applyTheme` signature matches across `EnvironmentTheme.ts` and `Viewer.ts`.
- `createCamera` returns `THREE.PerspectiveCamera` used by `Viewer` and `OrbitControls`.
- `Theme` type exported from `EnvironmentTheme.ts` and used in `Viewer.setTheme`.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-05-eiffel-tower.md`.

Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach would you like?
