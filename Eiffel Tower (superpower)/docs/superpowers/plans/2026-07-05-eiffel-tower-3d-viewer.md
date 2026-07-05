# Eiffel Tower 3D Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive 3D web viewer that renders the Eiffel Tower from Eiffel's real constant-stress curve and real dimensions, with orbit controls, day/night toggle with sparkle, and an info overlay.

**Architecture:** The tower's half-width at height `h` is given by a pure function `w(h) = wTop + (wBase - wTop) * exp(-k*h)` calibrated against the tower's real width-at-height points. A geometry module samples `w(h)` into rings, builds 4 edge-beam tubes at the corners, section-aware X-lattice on the faces, 3 platform slabs, and an antenna — all in meters, then scaled by 1/100 for the scene. A Vite + TypeScript + Three.js app renders it with OrbitControls, day/night lighting rigs, and an HTML overlay.

**Tech Stack:** Vite, TypeScript, Three.js, Vitest.

## Global Constraints

- Real dimensions are the source of truth and live only in `src/constants.ts`.
- Build tower geometry in **meters** (real units); scale the returned group by `SCENE_SCALE = 1/100`.
- Use Y-up (Three.js default): height `h` maps to the Y axis; the 4 corners sit at `(±w, h, ±w)`.
- Three.js height = 330 m total (300 m structure + 30 m antenna).
- Base square 125 m → `BASE_HALF_WIDTH = 62.5`. Platforms at 57 m / 115 m / 276 m.
- Curve constants (calibrated): `wBase = 62.5`, `k ≈ 0.01396`, `wTop ≈ 7.84`.
- Calibration anchors: `w(57) = 32.5`, `w(276) = 9`. Verification: `w(115) ≈ 18.8`.
- Puddle-iron color `#6B5B47`; antenna darker `#2A2A2A`.
- Sparkle: 40 point lights, 5 s burst every 60 s.
- Versions: `three@^0.169.0`, `@types/three@^0.169.0`, `vite@^5.4.0`, `typescript@^5.5.0`, `vitest@^2.1.0`.
- No comments in code unless requested.
- Each task ends with a green `npm test`, a green `npm run build`, and a commit.

---

### Task 1: Project scaffolding + minimal scene

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.ts`, `tests/smoke.test.ts`, `.gitignore`

**Interfaces:**
- Produces: a runnable Vite dev server (`npm run dev` opens a browser showing a minimal scene with a ground plane and a placeholder box), a passing smoke test, and a green production build.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "eiffel-tower",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --open",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "three": "^0.169.0"
  },
  "devDependencies": {
    "@types/three": "^0.169.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 3: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
});
```

- [ ] **Step 4: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Eiffel Tower 3D Viewer</title>
    <style>
      html, body { margin: 0; padding: 0; height: 100%; background: #0a0a12; overflow: hidden; }
      #app { position: fixed; inset: 0; }
      canvas { display: block; }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 5: Create `.gitignore`**

```
node_modules/
dist/
.vite/
```

- [ ] **Step 6: Create `src/main.ts`** with a minimal scene (renderer, scene, camera, animation loop, ground plane, one directional light, and a placeholder box ~3.3 units tall so camera framing is right from the start).

```ts
import * as THREE from 'three';

const app = document.getElementById('app')!;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fb8d8);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(6, 1.6, 8);
camera.lookAt(0, 1.6, 0);

const sun = new THREE.DirectionalLight(0xfff2cc, 2.0);
sun.position.set(5, 8, 4);
scene.add(sun);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 40),
  new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 }),
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const placeholder = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 3.3, 0.5),
  new THREE.MeshStandardMaterial({ color: 0x6b5b47 }),
);
placeholder.position.y = 1.65;
scene.add(placeholder);

renderer.setAnimationLoop(() => {
  renderer.render(scene, camera);
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
```

- [ ] **Step 7: Create `tests/smoke.test.ts`**

```ts
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 8: Install dependencies**

Run: `npm install`
Expected: installs without error.

- [ ] **Step 9: Run tests**

Run: `npm test`
Expected: PASS (1 test).

- [ ] **Step 10: Run production build**

Run: `npm run build`
Expected: compiles; `dist/` created; no TS errors.

- [ ] **Step 11: Run dev server (manual verify)**

Run: `npm run dev`
Expected: browser opens; pale-blue background; a brown box sits on a dark ground plane. Stop the server once verified.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite+TS+Three.js project with minimal scene"
```

---

### Task 2: Constants module (TDD)

**Files:**
- Create: `src/constants.ts`, `tests/constants.test.ts`

**Interfaces:**
- Produces: `src/constants.ts` exporting every real dimension used by later tasks:
  - `HEIGHT_TOTAL = 330`, `HEIGHT_TOP = 300`, `ANTENNA_HEIGHT = 30`
  - `BASE_HALF_WIDTH = 62.5`
  - `PLATFORM_HEIGHTS = [57, 115, 276]`
  - `PLATFORM_HALF_WIDTHS = { 57: 32.5, 115: 18.8, 276: 9 }` (115 is the curve's verification value)
  - `SCENE_SCALE = 0.01`, `RING_COUNT = 120`
  - `TOWER_COLOR = 0x6b5b47`, `ANTENNA_COLOR = 0x2a2a2a`
  - `SPARKLE_LIGHT_COUNT = 40`, `SPARKLE_INTERVAL_MS = 60000`, `SPARKLE_DURATION_MS = 5000`
  - module-load validation that throws on non-positive `BASE_HALF_WIDTH` / `HEIGHT_TOP`.

- [ ] **Step 1: Write the failing test**

`tests/constants.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  HEIGHT_TOTAL,
  HEIGHT_TOP,
  ANTENNA_HEIGHT,
  BASE_HALF_WIDTH,
  PLATFORM_HEIGHTS,
  PLATFORM_HALF_WIDTHS,
  SCENE_SCALE,
  RING_COUNT,
} from '../src/constants';

describe('constants', () => {
  it('has correct total height', () => {
    expect(HEIGHT_TOTAL).toBe(330);
    expect(HEIGHT_TOP).toBe(300);
    expect(ANTENNA_HEIGHT).toBe(30);
  });

  it('has correct base half-width', () => {
    expect(BASE_HALF_WIDTH).toBe(62.5);
  });

  it('has the three real platform heights', () => {
    expect(PLATFORM_HEIGHTS).toEqual([57, 115, 276]);
  });

  it('has calibrated platform half-widths', () => {
    expect(PLATFORM_HALF_WIDTHS[57]).toBeCloseTo(32.5, 5);
    expect(PLATFORM_HALF_WIDTHS[276]).toBeCloseTo(9, 5);
    expect(PLATFORM_HALF_WIDTHS[115]).toBeCloseTo(18.8, 1);
  });

  it('scales the scene to 1/100', () => {
    expect(SCENE_SCALE).toBe(0.01);
  });

  it('uses enough rings for a smooth curve', () => {
    expect(RING_COUNT).toBeGreaterThanOrEqual(100);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../src/constants` (module missing).

- [ ] **Step 3: Write minimal implementation**

`src/constants.ts`:

```ts
export const HEIGHT_TOTAL = 330;
export const HEIGHT_TOP = 300;
export const ANTENNA_HEIGHT = 30;
export const BASE_HALF_WIDTH = 62.5;
export const PLATFORM_HEIGHTS = [57, 115, 276] as const;
export const PLATFORM_HALF_WIDTHS: Record<number, number> = {
  57: 32.5,
  115: 18.8,
  276: 9,
};
export const SCENE_SCALE = 0.01;
export const RING_COUNT = 120;
export const TOWER_COLOR = 0x6b5b47;
export const ANTENNA_COLOR = 0x2a2a2a;
export const SPARKLE_LIGHT_COUNT = 40;
export const SPARKLE_INTERVAL_MS = 60_000;
export const SPARKLE_DURATION_MS = 5_000;

if (BASE_HALF_WIDTH <= 0) throw new Error('BASE_HALF_WIDTH must be positive');
if (HEIGHT_TOP <= 0) throw new Error('HEIGHT_TOP must be positive');
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS (all constants tests).

- [ ] **Step 5: Commit**

```bash
git add src/constants.ts tests/constants.test.ts
git commit -m "feat: add real-dimension constants module"
```

---

### Task 3: Profile function w(h) (TDD — the heart)

**Files:**
- Create: `src/tower/profile.ts`, `tests/profile.test.ts`

**Interfaces:**
- Produces: `src/tower/profile.ts` exporting `profile(h: number): number` returning the tower's half-width at height `h` (meters), valid for `0 <= h <= HEIGHT_TOP`.
  - Internally calibrated so `profile(57) = 32.5` and `profile(276) = 9`, with `wBase = 62.5`.
  - Calibration constants `k` and `wTop` solved numerically at module load; also re-exported as `CALIBRATION = { k, wTop, wBase }`.
- Consumes: `BASE_HALF_WIDTH`, `PLATFORM_HALF_WIDTHS`, `HEIGHT_TOP` from `src/constants.ts`.

- [ ] **Step 1: Write the failing test**

`tests/profile.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { profile, CALIBRATION } from '../src/tower/profile';

describe('profile w(h)', () => {
  it('hits the base half-width at h=0', () => {
    expect(profile(0)).toBeCloseTo(62.5, 6);
  });

  it('hits the first platform width at h=57 (calibration anchor)', () => {
    expect(profile(57)).toBeCloseTo(32.5, 4);
  });

  it('hits the third platform width at h=276 (calibration anchor)', () => {
    expect(profile(276)).toBeCloseTo(9, 3);
  });

  it('passes through the verification point h=115 within tolerance', () => {
    expect(profile(115)).toBeGreaterThan(16);
    expect(profile(115)).toBeLessThan(22);
  });

  it('returns the asymptotic top width near h=300', () => {
    expect(profile(300)).toBeCloseTo(CALIBRATION.wTop, 3);
    expect(profile(300)).toBeLessThan(10);
  });

  it('is monotonically decreasing across the full height', () => {
    let prev = profile(0);
    for (let h = 5; h <= 300; h += 5) {
      const cur = profile(h);
      expect(cur).toBeLessThan(prev);
      prev = cur;
    }
  });

  it('never returns NaN or Infinity', () => {
    for (let h = 0; h <= 300; h += 3) {
      expect(Number.isFinite(profile(h))).toBe(true);
    }
  });

  it('throws for heights outside the valid range', () => {
    expect(() => profile(-1)).toThrow();
    expect(() => profile(301)).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../src/tower/profile`.

- [ ] **Step 3: Write minimal implementation**

`src/tower/profile.ts`:

```ts
import { BASE_HALF_WIDTH, PLATFORM_HALF_WIDTHS, HEIGHT_TOP } from '../constants';

const wBase = BASE_HALF_WIDTH;
const h1 = 57;
const w1 = PLATFORM_HALF_WIDTHS[57];
const h2 = 276;
const w2 = PLATFORM_HALF_WIDTHS[276];

function solveCalibration(): { k: number; wTop: number } {
  let best = { err: Infinity, k: 0, wTop: 0 };
  for (let exp = -8; exp <= 2; exp += 0.0005) {
    const k = Math.pow(10, exp);
    const A = Math.exp(-k * h1);
    if (Math.abs(1 - A) < 1e-12) continue;
    const wTop = (w1 - wBase * A) / (1 - A);
    const pred2 = wTop + (wBase - wTop) * Math.exp(-k * h2);
    const err = (pred2 - w2) * (pred2 - w2);
    if (err < best.err) best = { err, k, wTop };
  }
  return { k: best.k, wTop: best.wTop };
}

const { k, wTop } = solveCalibration();

export const CALIBRATION = { k, wTop, wBase };

export function profile(h: number): number {
  if (h < 0 || h > HEIGHT_TOP) {
    throw new RangeError(`height ${h} out of range [0, ${HEIGHT_TOP}]`);
  }
  return wTop + (wBase - wTop) * Math.exp(-k * h);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS (all profile tests). If the verification-point test fails, confirm `PLATFORM_HALF_WIDTHS[115]` is `18.8` (it is the curve's own value, so it must pass).

- [ ] **Step 5: Commit**

```bash
git add src/tower/profile.ts tests/profile.test.ts
git commit -m "feat: add Eiffel constant-stress profile curve w(h)"
```

---

### Task 4: Materials module

**Files:**
- Create: `src/tower/materials.ts`, `tests/materials.test.ts`

**Interfaces:**
- Produces: `src/tower/materials.ts` exporting shared `MeshStandardMaterial` instances:
  - `dayMaterial` (puddle-iron brown, low metalness, moderate roughness)
  - `nightMaterial` (same base, warm emissive for glow)
  - `antennaMaterial` (darker metal)
  - These are shared singletons so the day/night toggle can swap `.material` references across the whole tower.
- Consumes: `TOWER_COLOR`, `ANTENNA_COLOR` from `src/constants.ts`.

- [ ] **Step 1: Write the failing test**

`tests/materials.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { dayMaterial, nightMaterial, antennaMaterial } from '../src/tower/materials';

describe('materials', () => {
  it('exposes a day MeshStandardMaterial', () => {
    expect(dayMaterial).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(dayMaterial.emissiveIntensity).toBe(0);
  });

  it('exposes a night MeshStandardMaterial with emissive glow', () => {
    expect(nightMaterial).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(nightMaterial.emissive.getHex()).not.toBe(0x000000);
    expect(nightMaterial.emissiveIntensity).toBeGreaterThan(0);
  });

  it('exposes a distinct antenna material', () => {
    expect(antennaMaterial).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(antennaMaterial).not.toBe(dayMaterial);
  });

  it('returns the same instance on re-import (singletons)', async () => {
    const mod = await import('../src/tower/materials');
    expect(mod.dayMaterial).toBe(dayMaterial);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../src/tower/materials`.

- [ ] **Step 3: Write minimal implementation**

`src/tower/materials.ts`:

```ts
import * as THREE from 'three';
import { TOWER_COLOR, ANTENNA_COLOR } from '../constants';

export const dayMaterial = new THREE.MeshStandardMaterial({
  color: TOWER_COLOR,
  metalness: 0.3,
  roughness: 0.7,
  emissive: 0x000000,
  emissiveIntensity: 0,
});

export const nightMaterial = new THREE.MeshStandardMaterial({
  color: TOWER_COLOR,
  metalness: 0.3,
  roughness: 0.7,
  emissive: new THREE.Color(0xffd27f),
  emissiveIntensity: 0.45,
});

export const antennaMaterial = new THREE.MeshStandardMaterial({
  color: ANTENNA_COLOR,
  metalness: 0.5,
  roughness: 0.5,
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS (all materials tests).

- [ ] **Step 5: Commit**

```bash
git add src/tower/materials.ts tests/materials.test.ts
git commit -m "feat: add shared day/night/antenna materials"
```

---

### Task 5: Tower geometry — edge beams (4 legs)

**Files:**
- Create: `src/tower/geometry.ts`, `tests/geometry.test.ts`
- Modify: `src/main.ts` (replace the placeholder box with the tower's edge beams)

**Interfaces:**
- Produces: `src/tower/geometry.ts` exporting `createTower(): THREE.Group` that returns a group scaled by `SCENE_SCALE` containing, at this point, the 4 edge-beam tubes along the corners. Later tasks extend this group.
- Consumes: `profile` from `src/tower/profile.ts`, `dayMaterial` + `antennaMaterial` from `src/tower/materials.ts`, `HEIGHT_TOP`, `RING_COUNT`, `SCENE_SCALE` from `src/constants.ts`.

- [ ] **Step 1: Write the failing test**

`tests/geometry.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createTower } from '../src/tower/geometry';

describe('createTower (edge beams)', () => {
  it('returns a Group', () => {
    expect(createTower()).toBeInstanceOf(THREE.Group);
  });

  it('contains exactly 4 edge-beam meshes at this stage', () => {
    const g = createTower();
    const meshes = g.children.filter((c) => c instanceof THREE.Mesh);
    expect(meshes.length).toBe(4);
  });

  it('is scaled by the scene scale', () => {
    const g = createTower();
    expect(g.scale.x).toBeCloseTo(0.01, 5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../src/tower/geometry`.

- [ ] **Step 3: Write minimal implementation**

`src/tower/geometry.ts`:

```ts
import * as THREE from 'three';
import { profile } from './profile';
import { dayMaterial } from './materials';
import { HEIGHT_TOP, RING_COUNT, SCENE_SCALE } from '../constants';

const PIER_RADIUS = 1.2;

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

export function createTower(): THREE.Group {
  const group = new THREE.Group();

  for (let c = 0; c < 4; c++) {
    const curve = new THREE.CatmullRomCurve3(cornerPoints(c));
    const geo = new THREE.TubeGeometry(curve, RING_COUNT, PIER_RADIUS, 6, false);
    group.add(new THREE.Mesh(geo, dayMaterial));
  }

  group.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });
  group.scale.setScalar(SCENE_SCALE);
  return group;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS (geometry tests).

- [ ] **Step 5: Wire the tower into `src/main.ts`** (replace the placeholder block).

Replace the placeholder `BoxGeometry` block in `src/main.ts` with:

```ts
import { createTower } from './tower/geometry';
```

and, in place of the `placeholder` mesh creation:

```ts
const tower = createTower();
scene.add(tower);
```

(Delete the `placeholder` constant and its `scene.add`.)

- [ ] **Step 6: Run production build**

Run: `npm run build`
Expected: compiles cleanly.

- [ ] **Step 7: Manual verify (dev)**

Run: `npm run dev`
Expected: four curved brown piers rising and tapering from a wide square base to a small top, grounded on the dark plane. Stop once verified.

- [ ] **Step 8: Commit**

```bash
git add src/tower/geometry.ts tests/geometry.test.ts src/main.ts
git commit -m "feat: add 4 edge-beam piers from profile curve"
```

---

### Task 6: Tower geometry — section-aware lattice

**Files:**
- Modify: `src/tower/geometry.ts`, `tests/geometry.test.ts`

**Interfaces:**
- Extends `createTower()` to also add X-bracing on each of the 4 faces between adjacent rings, with density varying by section (base→57m: every ring pair; 57→115m: every pair; 115→276m: every other pair).

- [ ] **Step 1: Update the test to expect more meshes**

In `tests/geometry.test.ts`, replace the "exactly 4" test with:

```ts
  it('contains the 4 edge beams plus lattice members', () => {
    const g = createTower();
    const meshes = g.children.filter((c) => c instanceof THREE.Mesh);
    expect(meshes.length).toBeGreaterThan(4);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- geometry`
Expected: FAIL — mesh count is still exactly 4.

- [ ] **Step 3: Extend the implementation**

Add to `src/tower/geometry.ts` (below `cornerPoints`, inside `createTower` after the edge-beam loop):

```ts
const LATTICE_RADIUS = 0.4;

function sectionForHeight(h: number): number {
  if (h < 57) return 0;
  if (h < 115) return 1;
  return 2;
}

function beamBetween(a: THREE.Vector3, b: THREE.Vector3, mat: THREE.Material, radius: number): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const geo = new THREE.CylinderGeometry(radius, radius, len, 6);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return mesh;
}
```

Inside `createTower`, after the edge-beam loop, add the lattice:

```ts
const rings: THREE.Vector3[][] = [0, 1, 2, 3].map((c) => cornerPoints(c));
const faces: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
];

for (const [a, b] of faces) {
  for (let i = 0; i < RING_COUNT; i++) {
    const h0 = (HEIGHT_TOP * i) / RING_COUNT;
    const section = sectionForHeight(h0);
    const skip = section === 2 ? i % 2 === 1 : false;
    if (skip) continue;

    const botA = rings[a][i];
    const botB = rings[b][i];
    const topA = rings[a][i + 1];
    const topB = rings[b][i + 1];

    group.add(beamBetween(botA, topB, dayMaterial, LATTICE_RADIUS));
    group.add(beamBetween(botB, topA, dayMaterial, LATTICE_RADIUS));
    group.add(beamBetween(botA, botB, dayMaterial, LATTICE_RADIUS));
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS (mesh count > 4).

- [ ] **Step 5: Manual verify (dev)**

Run: `npm run dev`
Expected: X-bracing visible on all 4 faces; denser/larger near the base, sparser near the top. Stop once verified.

- [ ] **Step 6: Commit**

```bash
git add src/tower/geometry.ts tests/geometry.test.ts
git commit -m "feat: add section-aware X-lattice bracing"
```

---

### Task 7: Tower geometry — platforms + antenna

**Files:**
- Modify: `src/tower/geometry.ts`, `tests/geometry.test.ts`

**Interfaces:**
- Extends `createTower()` to add 3 platform slabs at the real heights (57/115/276) and a tapered antenna from 300→330 m.

- [ ] **Step 1: Update the test**

Add to `tests/geometry.test.ts`:

```ts
  it('contains at least 4 beams + lattice + 3 platforms + 1 antenna (>= 9 structural categories)', () => {
    const g = createTower();
    const meshes = g.children.filter((c) => c instanceof THREE.Mesh);
    expect(meshes.length).toBeGreaterThan(50);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- geometry`
Expected: FAIL or already passing — if already passing, this is a guard; proceed. (It will pass after Step 3.)

- [ ] **Step 3: Extend the implementation**

Add `antennaMaterial` to the imports in `src/tower/geometry.ts`:

```ts
import { dayMaterial, antennaMaterial } from './materials';
import { HEIGHT_TOP, RING_COUNT, SCENE_SCALE, PLATFORM_HEIGHTS, ANTENNA_HEIGHT } from '../constants';
```

Inside `createTower`, after the lattice block, add platforms and antenna:

```ts
for (const h of PLATFORM_HEIGHTS) {
  const w = profile(h);
  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(2 * w, 1.5, 2 * w),
    dayMaterial,
  );
  slab.position.y = h;
  group.add(slab);
}

const antenna = new THREE.Mesh(
  new THREE.CylinderGeometry(0.6, 1.2, ANTENNA_HEIGHT, 8),
  antennaMaterial,
);
antenna.position.y = HEIGHT_TOP + ANTENNA_HEIGHT / 2;
group.add(antenna);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Manual verify (dev)**

Run: `npm run dev`
Expected: three square platform slabs at 57/115/276 m; a thin dark antenna rising above 300 m to 330 m. Stop once verified.

- [ ] **Step 6: Commit**

```bash
git add src/tower/geometry.ts tests/geometry.test.ts
git commit -m "feat: add 3 platforms and the top antenna"
```

---

### Task 8: Camera controls (OrbitControls + bounds)

**Files:**
- Create: `src/scene/Controls.ts`, `tests/controls.test.ts`
- Modify: `src/main.ts` (wire controls into the loop)

**Interfaces:**
- Produces: `src/scene/Controls.ts` exporting `createControls(camera: THREE.Camera, dom: HTMLElement): OrbitControls` configured with damping, clamped zoom (`minDistance`/`maxDistance`), bounded pan, and target at the tower's mid-height.
- Consumes: `three` OrbitControls addon.

- [ ] **Step 1: Write the failing test**

`tests/controls.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createControls } from '../src/scene/Controls';

describe('createControls', () => {
  it('returns an OrbitControls with damping enabled', () => {
    const camera = new THREE.PerspectiveCamera();
    const el = document.createElement('div');
    const controls = createControls(camera, el);
    expect(controls.enableDamping).toBe(true);
    expect(controls.minDistance).toBeGreaterThan(0);
    expect(controls.maxDistance).toBeGreaterThan(controls.minDistance);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../src/scene/Controls`.

- [ ] **Step 3: Write minimal implementation**

`src/scene/Controls.ts`:

```ts
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';

export function createControls(camera: THREE.Camera, dom: HTMLElement): OrbitControls {
  const controls = new OrbitControls(camera, dom);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 2;
  controls.maxDistance = 20;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.target.set(0, 1.4, 0);
  controls.update();
  return controls;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Wire into `src/main.ts`**

Add the import and instantiate after the camera, and call `update()` each frame. In `src/main.ts`:

```ts
import { createControls } from './scene/Controls';
```

After `camera.lookAt(...)`:

```ts
const controls = createControls(camera, renderer.domElement);
```

Replace the render loop with:

```ts
renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});
```

(Delete the old `camera.lookAt` line since `createControls` sets the target; keep `camera.position.set(...)`.)

- [ ] **Step 6: Run production build**

Run: `npm run build`
Expected: compiles cleanly.

- [ ] **Step 7: Manual verify (dev)**

Run: `npm run dev`
Expected: drag to orbit, scroll to zoom (clamped so you cannot enter the lattice or fly far away). Stop once verified.

- [ ] **Step 8: Commit**

```bash
git add src/scene/Controls.ts tests/controls.test.ts src/main.ts
git commit -m "feat: add orbit controls with bounds"
```

---

### Task 9: Day lighting rig + sky + ground polish

**Files:**
- Create: `src/scene/Lighting.ts`, `tests/lighting.test.ts`
- Modify: `src/main.ts` (replace the inline light + flat background with the day rig)

**Interfaces:**
- Produces: `src/scene/Lighting.ts` exporting `class Lighting` with:
  - constructor `new Lighting(scene: THREE.Scene)` that adds a day rig (warm directional sun with shadows + low ambient) and a night rig (dim ambient + 40 point lights distributed along the tower height — initially off). Stores references for toggling.
  - `setDay(): void`
  - `setNight(): void`
  - `update(elapsedMs: number): void` — drives the sparkle shimmer when in night mode.
- Consumes: `SPARKLE_LIGHT_COUNT`, `SPARKLE_INTERVAL_MS`, `SPARKLE_DURATION_MS`, `HEIGHT_TOTAL` from `src/constants.ts`.

- [ ] **Step 1: Write the failing test**

`tests/lighting.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { Lighting } from '../src/scene/Lighting';

describe('Lighting', () => {
  it('starts in day mode', () => {
    const scene = new THREE.Scene();
    const l = new Lighting(scene);
    expect(l.isNight).toBe(false);
  });

  it('can switch to night and back', () => {
    const scene = new THREE.Scene();
    const l = new Lighting(scene);
    l.setNight();
    expect(l.isNight).toBe(true);
    l.setDay();
    expect(l.isNight).toBe(false);
  });

  it('does not throw on update', () => {
    const scene = new THREE.Scene();
    const l = new Lighting(scene);
    expect(() => l.update(0)).not.toThrow();
    expect(() => l.update(70_000)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../src/scene/Lighting`.

- [ ] **Step 3: Write minimal implementation**

`src/scene/Lighting.ts`:

```ts
import * as THREE from 'three';
import {
  SPARKLE_LIGHT_COUNT,
  SPARKLE_INTERVAL_MS,
  SPARKLE_DURATION_MS,
  HEIGHT_TOTAL,
} from '../constants';

export class Lighting {
  sun: THREE.DirectionalLight;
  private ambient: THREE.AmbientLight;
  private points: THREE.PointLight[];
  private _night = false;

  constructor(private scene: THREE.Scene) {
    this.sun = new THREE.DirectionalLight(0xfff2cc, 2.2);
    this.sun.position.set(8, 12, 6);
    this.scene.add(this.sun);

    this.ambient = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(this.ambient);

    this.points = [];
    for (let i = 0; i < SPARKLE_LIGHT_COUNT; i++) {
      const h = (HEIGHT_TOTAL * (i + 0.5)) / SPARKLE_LIGHT_COUNT;
      const p = new THREE.PointLight(0xffd27f, 0, 4, 2);
      const angle = (i / SPARKLE_LIGHT_COUNT) * Math.PI * 2;
      p.position.set(Math.cos(angle) * 0.05, h, Math.sin(angle) * 0.05);
      this.points.push(p);
      this.scene.add(p);
    }
  }

  get isNight(): boolean {
    return this._night;
  }

  setDay(): void {
    this._night = false;
    this.sun.intensity = 2.2;
    this.ambient.intensity = 0.45;
    for (const p of this.points) p.intensity = 0;
  }

  setNight(): void {
    this._night = true;
    this.sun.intensity = 0.05;
    this.ambient.intensity = 0.08;
  }

  update(elapsedMs: number): void {
    if (!this._night) return;
    const cycle = elapsedMs % SPARKLE_INTERVAL_MS;
    const inBurst = cycle < SPARKLE_DURATION_MS;
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      if (inBurst) {
        p.intensity = 0.5 + Math.random() * 1.5;
      } else {
        p.intensity = 0.25;
      }
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS (all lighting tests green).

- [ ] **Step 5: Wire into `src/main.ts`**

Replace the inline `sun` + `AmbientLight` block in `src/main.ts` with:

```ts
import { Lighting } from './scene/Lighting';
```

After the scene is created (and after `ground` exists):

```ts
const lighting = new Lighting(scene);
```

Set a sky background, enable shadows, configure the sun's shadow camera, and make the ground receive shadows. Add after constructing `lighting`:

```ts
scene.background = new THREE.Color(0x9fb8d8);
renderer.shadowMap.enabled = true;
lighting.sun.castShadow = true;
lighting.sun.shadow.mapSize.set(2048, 2048);
lighting.sun.shadow.camera.near = 0.5;
lighting.sun.shadow.camera.far = 50;
lighting.sun.shadow.camera.left = -6;
lighting.sun.shadow.camera.right = 6;
lighting.sun.shadow.camera.top = 8;
lighting.sun.shadow.camera.bottom = -2;
lighting.sun.shadow.bias = -0.0005;
ground.receiveShadow = true;
```

(`lighting.sun` is currently `private`; expose it by changing its declaration in `src/scene/Lighting.ts` from `private sun` to `sun` — i.e. make it public. Do that edit now.)

Update the render loop to drive the sparkle (`lighting.update` takes absolute elapsed ms; `performance.now()` is fine):

```ts
renderer.setAnimationLoop(() => {
  const now = performance.now();
  lighting.update(now);
  controls.update();
  renderer.render(scene, camera);
});
```

(The `controls` variable was created in Task 8; the `lighting` will be referenced by the day/night toggle in Task 11, so it must be in scope at module level — it already is, as a top-level `const`.)

- [ ] **Step 6: Run production build**

Run: `npm run build`
Expected: compiles cleanly.

- [ ] **Step 7: Manual verify (dev)**

Run: `npm run dev`
Expected: warm sun-lit tower casting soft shadows; pale-blue sky. (Night toggle comes in Task 11.) Stop once verified.

- [ ] **Step 8: Commit**

```bash
git add src/scene/Lighting.ts tests/lighting.test.ts src/main.ts
git commit -m "feat: add day lighting rig and sky"
```

---

### Task 10: Info overlay (HTML)

**Files:**
- Create: `src/ui/Overlay.ts`, `tests/overlay.test.ts`
- Modify: `src/main.ts` (mount the overlay), `index.html` (ensure `#app` exists — already does)

**Interfaces:**
- Produces: `src/ui/Overlay.ts` exporting `createOverlay(parent: HTMLElement): { el: HTMLElement }` that mounts an absolutely-positioned panel showing real dimensions read from `constants.ts`.

- [ ] **Step 1: Write the failing test**

`tests/overlay.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { createOverlay } from '../src/ui/Overlay';

describe('createOverlay', () => {
  it('mounts a panel with real dimensions text', () => {
    const parent = document.createElement('div');
    const { el } = createOverlay(parent);
    expect(parent.contains(el)).toBe(true);
    expect(el.textContent).toContain('330');
    expect(el.textContent).toContain('125');
    expect(el.textContent).toContain('57');
    expect(el.textContent).toContain('115');
    expect(el.textContent).toContain('276');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../src/ui/Overlay`.

- [ ] **Step 3: Write minimal implementation**

`src/ui/Overlay.ts`:

```ts
import {
  HEIGHT_TOTAL,
  HEIGHT_TOP,
  ANTENNA_HEIGHT,
  BASE_HALF_WIDTH,
  PLATFORM_HEIGHTS,
} from '../constants';

export function createOverlay(parent: HTMLElement): { el: HTMLElement } {
  const el = document.createElement('div');
  el.style.cssText =
    'position:absolute;top:12px;left:12px;padding:10px 12px;' +
    'background:rgba(10,10,18,0.7);color:#e8e8e8;font:13px/1.5 monospace;' +
    'border-radius:6px;pointer-events:none;max-width:240px;';

  const base = BASE_HALF_WIDTH * 2;
  const [p1, p2, p3] = PLATFORM_HEIGHTS;

  el.innerHTML =
    `<b>Eiffel Tower</b><br>` +
    `Height: ${HEIGHT_TOTAL} m (${HEIGHT_TOP} + ${ANTENNA_HEIGHT} antenna)<br>` +
    `Base: ${base} × ${base} m<br>` +
    `Platforms: ${p1} / ${p2} / ${p3} m<br>` +
    `<span style="opacity:0.7">~18,000 iron pieces · ~7,300 t</span>`;

  parent.appendChild(el);
  return { el };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Wire into `src/main.ts`**

Add the import and mount it on `#app`:

```ts
import { createOverlay } from './ui/Overlay';
```

After `app` is referenced (after `renderer` setup), add:

```ts
createOverlay(app);
```

- [ ] **Step 6: Run production build**

Run: `npm run build`
Expected: compiles cleanly.

- [ ] **Step 7: Manual verify (dev)**

Run: `npm run dev`
Expected: a dark semi-transparent panel in the top-left showing 330 m, 125 × 125 m, and the three platform heights. Stop once verified.

- [ ] **Step 8: Commit**

```bash
git add src/ui/Overlay.ts tests/overlay.test.ts src/main.ts
git commit -m "feat: add info overlay with real dimensions"
```

---

### Task 11: Day/night toggle + night rig + sparkle

**Files:**
- Create: `src/ui/DayNightToggle.ts`, `tests/toggle.test.ts`
- Modify: `src/main.ts` (wire button to `lighting` + tower material swap), `src/tower/geometry.ts` (expose a helper to swap structural materials)

**Interfaces:**
- Produces:
  - `src/ui/DayNightToggle.ts` exporting `createDayNightToggle(parent, onToggle): { el: HTMLButtonElement }`.
  - `src/tower/geometry.ts` additionally exporting `setTowerNight(group: THREE.Group, night: boolean): void` that swaps each structural mesh's material between `dayMaterial` and `nightMaterial` (antenna unchanged).
- Consumes: `dayMaterial`, `nightMaterial` from `src/tower/materials.ts`; `lighting` from Task 9.

- [ ] **Step 1: Write the failing tests**

`tests/toggle.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { createDayNightToggle } from '../src/ui/DayNightToggle';

describe('createDayNightToggle', () => {
  it('mounts a button that fires onToggle', () => {
    const parent = document.createElement('div');
    let called = false;
    const { el } = createDayNightToggle(parent, () => {
      called = true;
    });
    expect(parent.contains(el)).toBe(true);
    el.click();
    expect(called).toBe(true);
  });
});
```

Add to `tests/geometry.test.ts`:

```ts
import { setTowerNight } from '../src/tower/geometry';
import { dayMaterial, nightMaterial } from '../src/tower/materials';

describe('setTowerNight', () => {
  it('swaps structural mesh materials to night and back', () => {
    const g = createTower();
    setTowerNight(g, true);
    const mats = g.children
      .filter((c) => (c as any).material === nightMaterial);
    expect(mats.length).toBeGreaterThan(0);
    setTowerNight(g, false);
    const dayMats = g.children.filter((c) => (c as any).material === dayMaterial);
    expect(dayMats.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `../src/ui/DayNightToggle` and `setTowerNight`.

- [ ] **Step 3: Write the toggle**

`src/ui/DayNightToggle.ts`:

```ts
export function createDayNightToggle(
  parent: HTMLElement,
  onToggle: (night: boolean) => void,
): { el: HTMLButtonElement } {
  const el = document.createElement('button');
  el.textContent = 'Night';
  el.style.cssText =
    'position:absolute;top:12px;right:12px;padding:8px 14px;' +
    'background:rgba(10,10,18,0.7);color:#e8e8e8;font:13px monospace;' +
    'border:1px solid #444;border-radius:6px;cursor:pointer;';
  let night = false;
  el.addEventListener('click', () => {
    night = !night;
    el.textContent = night ? 'Day' : 'Night';
    onToggle(night);
  });
  parent.appendChild(el);
  return { el };
}
```

- [ ] **Step 4: Add `setTowerNight` to `src/tower/geometry.ts`**

Add to the imports:

```ts
import { dayMaterial, nightMaterial } from './materials';
```

Add the exported function at the bottom:

```ts
export function setTowerNight(group: THREE.Group, night: boolean): void {
  const mat = night ? nightMaterial : dayMaterial;
  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh && (mesh.material === dayMaterial || mesh.material === nightMaterial)) {
      mesh.material = mat;
    }
  });
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: PASS (toggle + geometry swap tests).

- [ ] **Step 6: Wire into `src/main.ts`**

Add imports:

```ts
import { createDayNightToggle } from './ui/DayNightToggle';
import { setTowerNight } from './tower/geometry';
```

After the `tower` and `lighting` are created, add:

```ts
createDayNightToggle(app, (night) => {
  setTowerNight(tower, night);
  if (night) lighting.setNight();
  else lighting.setDay();
  scene.background = new THREE.Color(night ? 0x05060f : 0x9fb8d8);
});
```

- [ ] **Step 7: Run production build**

Run: `npm run build`
Expected: compiles cleanly.

- [ ] **Step 8: Manual verify (dev)**

Run: `npm run dev`
Expected: clicking "Night" drops the scene to a dark sky, lights the tower with a warm emissive glow, and shimmers ~40 point lights in a 5-second burst; clicking "Day" returns to the sunny scene. Stop once verified.

- [ ] **Step 9: Commit**

```bash
git add src/ui/DayNightToggle.ts src/tower/geometry.ts tests/toggle.test.ts tests/geometry.test.ts src/main.ts
git commit -m "feat: add day/night toggle with sparkle"
```

---

### Task 12: Final verification

**Files:**
- Modify: none (verification only); optionally minor polish to `src/main.ts` if issues found.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all tests PASS (smoke, constants, profile, materials, geometry, controls, lighting, overlay, toggle).

- [ ] **Step 2: Run the production build**

Run: `npm run build`
Expected: compiles cleanly; `dist/` produced; no TypeScript errors.

- [ ] **Step 3: Manual acceptance (dev)**

Run: `npm run dev`
Verify against this checklist:
- Tower has 4 splayed legs tapering from a 125 m base to a small top.
- Lattice X-bracing visible on all faces; denser at the base, sparser up high.
- 3 platform slabs at 57 / 115 / 276 m.
- Antenna rises from 300 m to 330 m.
- Orbit (drag), zoom (scroll, clamped), pan work with damping.
- Info overlay shows 330 m, 125 × 125 m, 57/115/276 m.
- Day/night toggle works: night shows dark sky, warm emissive tower, 5 s sparkle burst every 60 s.

- [ ] **Step 4: Final commit (if any polish was applied)**

```bash
git add -A
git commit -m "chore: final polish and verification"
```

(If no changes were needed, skip this step — the implementation is complete.)
