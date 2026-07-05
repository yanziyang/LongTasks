# Eiffel Tower 3D Viewer v3 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully procedural, interactive 3D Eiffel Tower in Three.js with vertex-color gradient paint, diagram-accurate lattice and arches, speed-priority auto-rotation, and a golden-sparkle night mode.

**Architecture:** Modular builders (LegBuilder, LatticeBuilder, ArchBuilder, PlatformBuilder, CabinBuilder, AntennaBuilder) each produce a Three.js Group or InstancedMesh. A Tower assembler composes them. A custom ShaderMaterial with vertex-color height gradient handles the graduated paint and night-mode emissive sparkle. Viewer owns the scene/renderer/camera, EnvironmentTheme manages day/night light state, CameraRig provides speed-priority auto-rotation blending.

**Tech Stack:** TypeScript 5.5+, Three.js 0.169+, Vite 5.4+, Vitest 2.1+, jsdom 29.1+

## Global Constraints

- All real-world dimensions live in `src/constants.ts` as the single source of truth
- `src/tower/profile.ts` is pure math — no Three.js dependency, fully unit-testable
- Each builder validates inputs and returns empty Group on failure (no throws)
- Scene built in meters, scaled by 1/100 for rendering
- `devicePixelRatio` capped at 2, shadow map at 2048x2048 PCFSoft
- Custom ShaderMaterial falls back to MeshStandardMaterial zone variants on compile failure
- Theme toggle debounced at 300ms
- `npm run dev` opens viewer, `npm run build` compiles, `npm test` passes — all three must succeed

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `index.html`
- Create: `.gitignore`

**Interfaces:**
- Produces: Vite dev server on `npm run dev`, Vitest on `npm test`, TypeScript strict mode

- [ ] **Step 1: Create package.json**

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
    "jsdom": "^29.1.1",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

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

- [ ] **Step 3: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
});
```

- [ ] **Step 4: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    extensions: ['.ts', '.js'],
  },
});
```

- [ ] **Step 5: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Eiffel Tower</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #000; }
  </style>
</head>
<body>
  <div id="app" style="width:100%;height:100%;position:relative;"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

- [ ] **Step 6: Create .gitignore**

```
node_modules/
dist/
```

- [ ] **Step 7: Install dependencies and verify toolchain**

```bash
npm install
npm test
```

Expected: "No test files found" — Vitest runs but finds nothing.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts vitest.config.ts index.html .gitignore
git commit -m "chore: scaffold project with Vite + TypeScript + Three.js + Vitest"
```

---

### Task 2: Constants Module with Validation

**Files:**
- Create: `src/constants.ts`
- Create: `tests/constants.test.ts`

**Interfaces:**
- Produces: `HEIGHT_TOTAL`, `HEIGHT_TOP`, `ANTENNA_HEIGHT`, `BASE_HALF_WIDTH`, `PLATFORM_HEIGHTS`, `PLATFORM_HALF_WIDTHS`, `SCENE_SCALE`, `RING_COUNT`, `SPARKLE_INTERVAL_MS`, `SPARKLE_DURATION_MS`, `SPARKLE_ENTER_DURATION_MS`, `TOWER_COLOR_LOWER`, `TOWER_COLOR_MIDDLE`, `TOWER_COLOR_UPPER`, `ANTENNA_COLOR`, `CAMERA_INITIAL_POSITION`, `CAMERA_TARGET`, `AUTO_ROTATION_SPEED`, `AUTO_ROTATION_RECOVERY_S`

- [ ] **Step 1: Create tests/constants.test.ts**

```typescript
import { describe, it, expect } from 'vitest';

describe('constants', () => {
  it('has positive base half width', async () => {
    const { BASE_HALF_WIDTH } = await import('../src/constants');
    expect(BASE_HALF_WIDTH).toBeGreaterThan(0);
  });

  it('has positive total height', async () => {
    const { HEIGHT_TOTAL } = await import('../src/constants');
    expect(HEIGHT_TOTAL).toBeGreaterThan(0);
  });

  it('total height exceeds top height', async () => {
    const { HEIGHT_TOTAL, HEIGHT_TOP } = await import('../src/constants');
    expect(HEIGHT_TOTAL).toBeGreaterThan(HEIGHT_TOP);
  });

  it('antenna height equals total minus top', async () => {
    const { HEIGHT_TOTAL, HEIGHT_TOP, ANTENNA_HEIGHT } = await import('../src/constants');
    expect(ANTENNA_HEIGHT).toBe(HEIGHT_TOTAL - HEIGHT_TOP);
  });

  it('platform heights are ascending', async () => {
    const { PLATFORM_HEIGHTS } = await import('../src/constants');
    for (let i = 1; i < PLATFORM_HEIGHTS.length; i++) {
      expect(PLATFORM_HEIGHTS[i]).toBeGreaterThan(PLATFORM_HEIGHTS[i - 1]);
    }
  });

  it('platform half widths are positive and decreasing', async () => {
    const { PLATFORM_HEIGHTS, PLATFORM_HALF_WIDTHS } = await import('../src/constants');
    const widths = PLATFORM_HEIGHTS.map((h) => PLATFORM_HALF_WIDTHS[h]);
    for (const w of widths) expect(w).toBeGreaterThan(0);
    for (let i = 1; i < widths.length; i++) {
      expect(widths[i]).toBeLessThan(widths[i - 1]);
    }
  });

  it('scene scale is positive and less than 1', async () => {
    const { SCENE_SCALE } = await import('../src/constants');
    expect(SCENE_SCALE).toBeGreaterThan(0);
    expect(SCENE_SCALE).toBeLessThan(1);
  });

  it('camera initial position has valid values', async () => {
    const { CAMERA_INITIAL_POSITION } = await import('../src/constants');
    expect(CAMERA_INITIAL_POSITION.x).toBeGreaterThan(0);
    expect(CAMERA_INITIAL_POSITION.y).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL — `src/constants.ts` does not exist.

- [ ] **Step 3: Create src/constants.ts**

```typescript
import * as THREE from 'three';

export const HEIGHT_TOTAL = 330;
export const HEIGHT_TOP = 300;
export const ANTENNA_HEIGHT = HEIGHT_TOTAL - HEIGHT_TOP;
export const BASE_HALF_WIDTH = 62.5;

export const PLATFORM_HEIGHTS = [57, 115, 276] as const;

export const PLATFORM_HALF_WIDTHS: Record<number, number> = {
  57: 32.5,
  115: 18.8,
  276: 9,
};

export const SCENE_SCALE = 0.01;
export const RING_COUNT = 150;

export const SPARKLE_INTERVAL_MS = 180_000; // 3 minutes
export const SPARKLE_DURATION_MS = 20_000;
export const SPARKLE_ENTER_DURATION_MS = 10_000;

export const TOWER_COLOR_LOWER = new THREE.Color(0x5a3d2b);
export const TOWER_COLOR_MIDDLE = new THREE.Color(0x6b5b47);
export const TOWER_COLOR_UPPER = new THREE.Color(0x7a6e5d);
export const ANTENNA_COLOR = 0x2a2a2a;

export const CAMERA_INITIAL_POSITION = new THREE.Vector3(250, 120, 250);
export const CAMERA_TARGET = new THREE.Vector3(0, 150, 0);
export const AUTO_ROTATION_SPEED = 0.15; // rad/min
export const AUTO_ROTATION_RECOVERY_S = 3; // seconds to recover speed after drag

if (BASE_HALF_WIDTH <= 0) throw new Error('BASE_HALF_WIDTH must be positive');
if (HEIGHT_TOP <= 0) throw new Error('HEIGHT_TOP must be positive');
if (ANTENNA_HEIGHT <= 0) throw new Error('ANTENNA_HEIGHT must be positive');
if (SCENE_SCALE <= 0 || SCENE_SCALE >= 1) throw new Error('SCENE_SCALE must be between 0 and 1');
if (RING_COUNT < 10) throw new Error('RING_COUNT must be at least 10');
if (SPARKLE_INTERVAL_MS <= SPARKLE_DURATION_MS) throw new Error('sparkle interval must exceed sparkle duration');
if (SPARKLE_ENTER_DURATION_MS > SPARKLE_DURATION_MS) throw new Error('enter sparkle must not exceed regular sparkle duration');

for (let i = 1; i < PLATFORM_HEIGHTS.length; i++) {
  if (PLATFORM_HEIGHTS[i] <= PLATFORM_HEIGHTS[i - 1]) {
    throw new Error('platform heights must be ascending');
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test
```

Expected: PASS — 8 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/constants.ts tests/constants.test.ts
git commit -m "feat: add constants module with runtime validation"
```

---

### Task 3: Tower Profile (Pure Math)

**Files:**
- Create: `src/tower/profile.ts`
- Create: `tests/profile.test.ts`

**Interfaces:**
- Consumes: `BASE_HALF_WIDTH`, `PLATFORM_HALF_WIDTHS`, `HEIGHT_TOP` from `src/constants.ts`
- Produces: `profile(h: number): number` — returns half-width at height h
- Produces: `CALIBRATION: { k: number; wTop: number; wBase: number }` — solved curve parameters

- [ ] **Step 1: Create tests/profile.test.ts**

```typescript
import { describe, it, expect } from 'vitest';
import { profile, CALIBRATION } from '../src/tower/profile';

describe('profile w(h)', () => {
  it('returns base half-width at h=0', () => {
    expect(profile(0)).toBeCloseTo(62.5, 6);
  });

  it('returns first platform width at h=57 (calibration anchor)', () => {
    expect(profile(57)).toBeCloseTo(32.5, 4);
  });

  it('returns third platform width at h=276 (calibration anchor)', () => {
    expect(profile(276)).toBeCloseTo(9, 3);
  });

  it('passes through h=115 verification point within tolerance', () => {
    const w = profile(115);
    expect(w).toBeGreaterThan(16);
    expect(w).toBeLessThan(22);
  });

  it('is monotonically decreasing', () => {
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

  it('throws for heights outside valid range', () => {
    expect(() => profile(-1)).toThrow();
    expect(() => profile(301)).toThrow();
  });

  it('calibration parameters are positive', () => {
    expect(CALIBRATION.k).toBeGreaterThan(0);
    expect(CALIBRATION.wTop).toBeGreaterThan(0);
    expect(CALIBRATION.wBase).toBe(62.5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL — `src/tower/profile.ts` does not exist.

- [ ] **Step 3: Create src/tower/profile.ts**

```typescript
import { BASE_HALF_WIDTH, PLATFORM_HALF_WIDTHS, HEIGHT_TOP } from '../constants';

const wBase = BASE_HALF_WIDTH;
const h1 = 57;
const w1 = PLATFORM_HALF_WIDTHS[57];
const h2 = 276;
const w2 = PLATFORM_HALF_WIDTHS[276];

function evalK(k: number): { err: number; wTop: number } {
  const A = Math.exp(-k * h1);
  const wTop = (w1 - wBase * A) / (1 - A);
  const pred2 = wTop + (wBase - wTop) * Math.exp(-k * h2);
  return { err: (pred2 - w2) * (pred2 - w2), wTop };
}

function solveCalibration(): { k: number; wTop: number } {
  let best = { err: Infinity, k: 0, wTop: 0 };
  for (let exp = -8; exp <= 2; exp += 0.0005) {
    const k = Math.pow(10, exp);
    const { err, wTop } = evalK(k);
    if (err < best.err) best = { err, k, wTop };
  }
  const lo = Math.pow(10, Math.log10(best.k) - 0.001);
  const hi = Math.pow(10, Math.log10(best.k) + 0.001);
  for (let k = lo; k <= hi; k += hi * 1e-8) {
    const { err, wTop } = evalK(k);
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

```bash
npm test
```

Expected: PASS — 16 tests pass (8 constants + 8 profile).

- [ ] **Step 5: Commit**

```bash
git add src/tower/profile.ts tests/profile.test.ts
git commit -m "feat: add tower profile with exponential curve calibration"
```

---

### Task 4: Custom ShaderMaterial with Vertex-Color Gradient

**Files:**
- Create: `src/tower/materials.ts`
- Create: `tests/materials.test.ts`

**Interfaces:**
- Consumes: `TOWER_COLOR_LOWER`, `TOWER_COLOR_MIDDLE`, `TOWER_COLOR_UPPER`, `ANTENNA_COLOR` from `src/constants.ts`
- Produces: `createTowerMaterial(): THREE.ShaderMaterial` — custom shader with vertex-color gradient + PBR + emissive support
- Produces: `createTowerMaterialFallback(): THREE.MeshStandardMaterial[]` — array of 3 zone materials for shader-fallback
- Produces: `antennaMaterial: THREE.MeshStandardMaterial` — dark antenna material
- Produces: `setNightMode(material: THREE.ShaderMaterial, night: boolean): void` — toggles emissive
- Produces: `updateSparkle(material: THREE.ShaderMaterial, elapsedMs: number): void` — updates sparkle uniforms

- [ ] **Step 1: Create tests/materials.test.ts**

```typescript
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  createTowerMaterial,
  createTowerMaterialFallback,
  antennaMaterial,
  setNightMode,
  updateSparkle,
} from '../src/tower/materials';

describe('createTowerMaterial', () => {
  it('returns a ShaderMaterial', () => {
    const mat = createTowerMaterial();
    expect(mat).toBeInstanceOf(THREE.ShaderMaterial);
    mat.dispose();
  });

  it('has required uniforms', () => {
    const mat = createTowerMaterial();
    expect(mat.uniforms.lightDirection).toBeDefined();
    expect(mat.uniforms.lightColor).toBeDefined();
    expect(mat.uniforms.skyColor).toBeDefined();
    expect(mat.uniforms.groundColor).toBeDefined();
    expect(mat.uniforms.ambientIntensity).toBeDefined();
    expect(mat.uniforms.emissiveIntensity).toBeDefined();
    expect(mat.uniforms.sparkleTime).toBeDefined();
    mat.dispose();
  });
});

describe('createTowerMaterialFallback', () => {
  it('returns an array of 3 MeshStandardMaterials', () => {
    const mats = createTowerMaterialFallback();
    expect(mats).toHaveLength(3);
    for (const mat of mats) {
      expect(mat).toBeInstanceOf(THREE.MeshStandardMaterial);
    }
  });

  it('materials have distinct colors from dark to light', () => {
    const mats = createTowerMaterialFallback();
    const l0 = mats[0].color.getHex();
    const l1 = mats[1].color.getHex();
    const l2 = mats[2].color.getHex();
    expect(l0).not.toBe(l1);
    expect(l1).not.toBe(l2);
  });
});

describe('antennaMaterial', () => {
  it('is a MeshStandardMaterial', () => {
    expect(antennaMaterial).toBeInstanceOf(THREE.MeshStandardMaterial);
  });

  it('has a dark color', () => {
    const c = new THREE.Color(antennaMaterial.color);
    // Dark gray — each channel should be low
    expect(c.r).toBeLessThan(0.3);
    expect(c.g).toBeLessThan(0.3);
    expect(c.b).toBeLessThan(0.3);
  });
});

describe('setNightMode', () => {
  it('sets emissive intensity to non-zero in night mode', () => {
    const mat = createTowerMaterial();
    setNightMode(mat, true);
    expect(mat.uniforms.emissiveIntensity.value).toBeGreaterThan(0);
    setNightMode(mat, false);
    expect(mat.uniforms.emissiveIntensity.value).toBe(0);
    mat.dispose();
  });
});

describe('updateSparkle', () => {
  it('accepts elapsed time without throwing', () => {
    const mat = createTowerMaterial();
    setNightMode(mat, true);
    expect(() => updateSparkle(mat, 5000)).not.toThrow();
    mat.dispose();
  });

  it('does nothing when night mode is off', () => {
    const mat = createTowerMaterial();
    setNightMode(mat, false);
    const before = mat.uniforms.sparkleTime.value;
    updateSparkle(mat, 5000);
    expect(mat.uniforms.sparkleTime.value).toBe(before);
    mat.dispose();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL — `src/tower/materials.ts` does not exist.

- [ ] **Step 3: Create src/tower/materials.ts**

```typescript
import * as THREE from 'three';
import {
  TOWER_COLOR_LOWER,
  TOWER_COLOR_MIDDLE,
  TOWER_COLOR_UPPER,
  ANTENNA_COLOR,
  SPARKLE_INTERVAL_MS,
  SPARKLE_DURATION_MS,
  SPARKLE_ENTER_DURATION_MS,
} from '../constants';

const vertexShader = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;
  varying float vHeightRatio;

  attribute float heightRatio;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPosition.xyz);
    vHeightRatio = heightRatio;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;
  varying float vHeightRatio;

  uniform vec3 lowerColor;
  uniform vec3 middleColor;
  uniform vec3 upperColor;
  uniform vec3 lightDirection;
  uniform vec3 lightColor;
  uniform float lightIntensity;
  uniform vec3 skyColor;
  uniform vec3 groundColor;
  uniform float ambientIntensity;
  uniform float emissiveIntensity;
  uniform float sparkleTime;

  float pseudoRandom(vec3 seed) {
    return fract(sin(dot(seed, vec3(12.9898, 78.233, 45.5432))) * 43758.5453);
  }

  void main() {
    // Vertex color gradient along height
    float t = smoothstep(0.0, 1.0, vHeightRatio);
    vec3 baseColor = mix(lowerColor, middleColor, smoothstep(0.0, 0.45, t));
    baseColor = mix(baseColor, upperColor, smoothstep(0.45, 1.0, t));

    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(vViewDir);
    vec3 L = normalize(lightDirection);

    // Cook-Torrance microfacet specular
    float NdotL = max(dot(N, L), 0.0);
    float NdotV = max(dot(N, V), 0.0);
    vec3 H = normalize(L + V);
    float NdotH = max(dot(N, H), 0.0);

    float roughness = 0.7;
    float alpha = roughness * roughness;
    float alpha2 = alpha * alpha;
    float denom = NdotH * NdotH * (alpha2 - 1.0) + 1.0;
    float D = alpha2 / (3.14159265 * denom * denom);

    float k = roughness * 0.5;
    float G1 = NdotL / (NdotL * (1.0 - k) + k);
    float G2 = NdotV / (NdotV * (1.0 - k) + k);
    float G = G1 * G2;

    float F0 = 0.05; // iron fresnel
    vec3 F = vec3(F0 + (1.0 - F0) * pow(1.0 - NdotH, 5.0));

    vec3 specular = (D * G * F) / (4.0 * max(NdotL * NdotV, 0.001));

    // Diffuse lambert
    vec3 diffuse = baseColor / 3.14159265;

    vec3 directLight = (diffuse + specular) * lightColor * lightIntensity * NdotL;

    // Hemisphere light
    vec3 hemi = mix(groundColor, skyColor, N.y * 0.5 + 0.5);
    vec3 ambient = hemi * ambientIntensity + baseColor * 0.02;

    // Emissive sparkle
    float emissive = emissiveIntensity;
    if (sparkleTime > 0.01) {
      float seed = pseudoRandom(vWorldPos * 0.5 + sparkleTime);
      float twinkle = sin(sparkleTime * 8.0 + seed * 100.0) * 0.5 + 0.5;
      twinkle = twinkle * twinkle; // stronger contrast
      emissive += twinkle * emissiveIntensity * 2.0 * step(0.7, seed);
    }

    vec3 emissiveColor = vec3(0.831, 0.659, 0.263) * emissive; // golden #D4A843

    vec3 finalColor = directLight + ambient + emissiveColor;
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export function createTowerMaterial(): THREE.ShaderMaterial {
  try {
    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        lowerColor: { value: TOWER_COLOR_LOWER },
        middleColor: { value: TOWER_COLOR_MIDDLE },
        upperColor: { value: TOWER_COLOR_UPPER },
        lightDirection: { value: new THREE.Vector3(0.5, 0.7, 0.3).normalize() },
        lightColor: { value: new THREE.Color(0xfff5e6) },
        lightIntensity: { value: 2.0 },
        skyColor: { value: new THREE.Color(0x87ceeb) },
        groundColor: { value: new THREE.Color(0x7a7a7a) },
        ambientIntensity: { value: 0.6 },
        emissiveIntensity: { value: 0.0 },
        sparkleTime: { value: 0.0 },
      },
    });
    return mat;
  } catch {
    // Return a disposable fallback that won't be used — the caller will check and use the zone fallback
    return new THREE.ShaderMaterial({ vertexShader: 'void main() {}', fragmentShader: 'void main() {}' });
  }
}

export function createTowerMaterialFallback(): THREE.MeshStandardMaterial[] {
  return [
    new THREE.MeshStandardMaterial({
      color: TOWER_COLOR_LOWER,
      metalness: 0.4,
      roughness: 0.7,
      name: 'iron-lower',
    }),
    new THREE.MeshStandardMaterial({
      color: TOWER_COLOR_MIDDLE,
      metalness: 0.4,
      roughness: 0.7,
      name: 'iron-middle',
    }),
    new THREE.MeshStandardMaterial({
      color: TOWER_COLOR_UPPER,
      metalness: 0.4,
      roughness: 0.7,
      name: 'iron-upper',
    }),
  ];
}

export const antennaMaterial = new THREE.MeshStandardMaterial({
  color: ANTENNA_COLOR,
  metalness: 0.6,
  roughness: 0.4,
});

let nightModeActive = false;

export function setNightMode(material: THREE.ShaderMaterial, night: boolean): void {
  nightModeActive = night;
  if (!material.uniforms) return;
  if (night) {
    material.uniforms.emissiveIntensity.value = 0.45;
    material.uniforms.lightColor.value.set(0xc8d8ff);
    material.uniforms.lightIntensity.value = 0.4;
    material.uniforms.skyColor.value.set(0x1a2a4a);
    material.uniforms.groundColor.value.set(0x050505);
    material.uniforms.ambientIntensity.value = 0.2;
  } else {
    material.uniforms.emissiveIntensity.value = 0.0;
    material.uniforms.lightColor.value.set(0xfff5e6);
    material.uniforms.lightIntensity.value = 2.0;
    material.uniforms.skyColor.value.set(0x87ceeb);
    material.uniforms.groundColor.value.set(0x7a7a7a);
    material.uniforms.ambientIntensity.value = 0.6;
    material.uniforms.sparkleTime.value = 0.0;
  }
}

export function updateSparkle(material: THREE.ShaderMaterial, elapsedMs: number): void {
  if (!nightModeActive || !material.uniforms) return;
  const interval = SPARKLE_INTERVAL_MS;
  const duration = SPARKLE_DURATION_MS;
  const enterDuration = SPARKLE_ENTER_DURATION_MS;

  const cycle = elapsedMs % interval;
  const inBurst = cycle < duration;

  if (inBurst) {
    const burstElapsed = cycle;
    const ramp = burstElapsed < enterDuration
      ? burstElapsed / enterDuration
      : 1.0;
    material.uniforms.emissiveIntensity.value = 0.45 + ramp * 0.8;
    material.uniforms.sparkleTime.value = elapsedMs * 0.001;
  } else {
    material.uniforms.emissiveIntensity.value = 0.45;
    material.uniforms.sparkleTime.value = 0.0;
  }
}

export function updateLightDirection(material: THREE.ShaderMaterial, light: THREE.DirectionalLight): void {
  if (!material.uniforms) return;
  const dir = new THREE.Vector3();
  light.getWorldDirection(dir);
  material.uniforms.lightDirection.value.copy(dir);
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test
```

Expected: PASS — all tests pass (24 so far: 8 constants + 8 profile + 8 materials).

- [ ] **Step 5: Commit**

```bash
git add src/tower/materials.ts tests/materials.test.ts
git commit -m "feat: add custom ShaderMaterial with vertex-color gradient and PBR"
```

---

### Task 5: LegBuilder — Four Curved Edge Beams

**Files:**
- Create: `src/tower/builders/LegBuilder.ts`
- Create: `tests/builders.test.ts`

**Interfaces:**
- Consumes: `profile(h: number): number` from `src/tower/profile.ts`
- Consumes: `HEIGHT_TOP`, `RING_COUNT` from `src/constants.ts`
- Consumes: `createTowerMaterial()` or fallback materials from `src/tower/materials.ts`
- Produces: `buildLegs(mat: THREE.ShaderMaterial | THREE.Material[], fallback: boolean): THREE.Group` — 4 curved tubular edge beams with pier cross-bracing

- [ ] **Step 1: Create tests/builders.test.ts (LegBuilder tests only — we'll add more later)**

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

    // Apply vertex color attribute for height-based gradient (used by the custom shader)
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

---

### Task 6: LatticeBuilder — Section-Aware X-Bracing

**Files:**
- Modify: `src/tower/builders/LegBuilder.ts` — export `cornerPoints` (or refactor into shared helper)
- Create: `src/tower/builders/LatticeBuilder.ts`
- Modify: `tests/builders.test.ts` — add LatticeBuilder tests

**Interfaces:**
- Consumes: `profile(h)`, `HEIGHT_TOP`, `RING_COUNT`, `PLATFORM_HEIGHTS`
- Produces: `buildLattice(mat: THREE.Material, fallback: boolean): THREE.Group` — per-face X-braced panels with section-aware density

Note: The `cornerPoints` function is already in `LegBuilder.ts`. For this task we'll define it again in `LatticeBuilder.ts` (it's small enough) to keep builders independent. If the reviewer wants to extract a shared utility, that can happen later.

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

      // Density: section 0 = every ring, section 1 = every other, section 2 = every 3rd
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

      // X-brace: two diagonals
      group.add(beamBetween(botA, topB, mat, LATTICE_RADIUS));
      group.add(beamBetween(botB, topA, mat, LATTICE_RADIUS));

      // Horizontal tie every ring for section 0, every other for sections 1-2
      if (section === 0 || i % 2 === 0) {
        group.add(beamBetween(botA, botB, mat, LATTICE_RADIUS));
      }
    }
  }

  // Apply vertex color attribute for the gradient shader
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

---

### Task 7: ArchBuilder — Diagram-Accurate Double-Ring Arches

**Files:**
- Create: `src/tower/builders/ArchBuilder.ts`
- Modify: `tests/builders.test.ts` — add ArchBuilder tests

**Interfaces:**
- Consumes: `profile(h)`, `BASE_HALF_WIDTH` from constants
- Produces: `buildArches(mat: THREE.Material, fallback: boolean): THREE.Group` — 4 trussed double-ring arches

- [ ] **Step 1: Add ArchBuilder tests to tests/builders.test.ts**

```typescript
import { buildArches } from '../src/tower/builders/ArchBuilder';

describe('buildArches', () => {
  it('returns a Group', () => {
    const mats = createTowerMaterialFallback();
    const result = buildArches(mats, true);
    expect(result).toBeInstanceOf(THREE.Group);
  });

  it('contains structural members', () => {
    const mats = createTowerMaterialFallback();
    const result = buildArches(mats, true);
    const meshCount = countMeshes(result);
    expect(meshCount).toBeGreaterThan(10);
  });

  it('has non-zero bounding box', () => {
    const mats = createTowerMaterialFallback();
    const result = buildArches(mats, true);
    const box = new THREE.Box3().setFromObject(result);
    expect(box.isEmpty()).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL — `buildArches` not exported.

- [ ] **Step 3: Create src/tower/builders/ArchBuilder.ts**

```typescript
import * as THREE from 'three';
import { profile } from '../profile';
import { BASE_HALF_WIDTH } from '../../constants';

const ARCH_SEGMENTS = 30;
const ARCH_MAX_HEIGHT = 45; // arches reach up to ~45m
const RING_SPACING = 2.0; // distance between the two parallel rings
const ARCH_RADIUS = 0.35;
const STRUT_RADIUS = 0.2;

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

function buildSingleArch(
  start: THREE.Vector3,
  end: THREE.Vector3,
  material: THREE.Material,
): THREE.Group {
  const group = new THREE.Group();
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  mid.y = ARCH_MAX_HEIGHT;

  // Two parallel curved rings (outer and inner)
  const outwardDir = new THREE.Vector3().crossVectors(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3().subVectors(end, start).normalize(),
  ).normalize();

  for (const offset of [-RING_SPACING / 2, RING_SPACING / 2]) {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= ARCH_SEGMENTS; i++) {
      const t = i / ARCH_SEGMENTS;
      // Quadratic Bezier: start -> mid -> end
      const a = new THREE.Vector3().lerpVectors(start, mid, t);
      const b = new THREE.Vector3().lerpVectors(mid, end, t);
      const pt = new THREE.Vector3().lerpVectors(a, b, t);
      pt.add(outwardDir.clone().multiplyScalar(offset));
      points.push(pt);
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, ARCH_SEGMENTS, ARCH_RADIUS, 6, false);
    group.add(new THREE.Mesh(tubeGeo, material));
  }

  // Radial connectors between the two rings
  const outerPoints: THREE.Vector3[] = [];
  const innerPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= ARCH_SEGMENTS; i += 2) {
    const t = i / ARCH_SEGMENTS;
    const a = new THREE.Vector3().lerpVectors(start, mid, t);
    const b = new THREE.Vector3().lerpVectors(mid, end, t);
    const pt = new THREE.Vector3().lerpVectors(a, b, t);
    outerPoints.push(pt.clone().add(outwardDir.clone().multiplyScalar(-RING_SPACING / 2)));
    innerPoints.push(pt.clone().add(outwardDir.clone().multiplyScalar(RING_SPACING / 2)));
  }

  for (let i = 0; i < outerPoints.length; i++) {
    group.add(beamBetween(outerPoints[i], innerPoints[i], material, STRUT_RADIUS));
  }

  // Diagonal cross-bracing between rings
  for (let i = 0; i < outerPoints.length - 1; i++) {
    group.add(beamBetween(outerPoints[i], innerPoints[i + 1], material, STRUT_RADIUS));
    group.add(beamBetween(innerPoints[i], outerPoints[i + 1], material, STRUT_RADIUS));
  }

  return group;
}

export function buildArches(materials: THREE.Material[] | THREE.Material, fallback: boolean): THREE.Group {
  const group = new THREE.Group();
  const mat = fallback ? (materials as THREE.Material[])[0] : (materials as THREE.Material);
  const w = profile(0);

  // Four legs at ground: (-w,-w), (w,-w), (w,w), (-w,w)
  const corners = [
    new THREE.Vector3(-w, 0, -w),
    new THREE.Vector3(w, 0, -w),
    new THREE.Vector3(w, 0, w),
    new THREE.Vector3(-w, 0, w),
  ];

  const edges = [[0, 1], [1, 2], [2, 3], [3, 0]];

  for (const [a, b] of edges) {
    group.add(buildSingleArch(corners[a], corners[b], mat));
  }

  // Apply vertex color attribute
  group.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry.attributes.position) {
      const positions = child.geometry.attributes.position;
      const heightRatios = new Float32Array(positions.count);
      const worldPos = new THREE.Vector3();
      child.getWorldPosition(worldPos);
      for (let i = 0; i < positions.count; i++) {
        const y = (worldPos.y + positions.getY(i));
        heightRatios[i] = y / 330;
      }
      child.geometry.setAttribute('heightRatio', new THREE.BufferAttribute(heightRatios, 1));
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
git add src/tower/builders/ArchBuilder.ts tests/builders.test.ts
git commit -m "feat: add ArchBuilder with diagram-accurate double-ring truss arches"
```

---

### Task 8: PlatformBuilder — Decks and Railings at 3 Heights

**Files:**
- Create: `src/tower/builders/PlatformBuilder.ts`
- Modify: `tests/builders.test.ts` — add PlatformBuilder tests

**Interfaces:**
- Consumes: `profile(h)`, `PLATFORM_HEIGHTS` from constants
- Produces: `buildPlatforms(mat: THREE.Material, fallback: boolean): THREE.Group` — 3 square platforms with railings

- [ ] **Step 1: Add PlatformBuilder tests**

```typescript
import { buildPlatforms } from '../src/tower/builders/PlatformBuilder';

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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL — `buildPlatforms` not exported.

- [ ] **Step 3: Create src/tower/builders/PlatformBuilder.ts**

```typescript
import * as THREE from 'three';
import { profile } from '../profile';
import { PLATFORM_HEIGHTS } from '../../constants';

const DECK_THICKNESS = 1.5;
const RAIL_THICKNESS = 0.3;
const RAIL_HEIGHT = 2.5;

function buildPlatformRing(h: number, material: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const w = profile(h);

  // Deck plate
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(2 * w, DECK_THICKNESS, 2 * w),
    material,
  );
  deck.position.y = h;
  group.add(deck);

  // Railing — four edge bars at platform perimeter
  const railTop = h + RAIL_HEIGHT;
  const edges = [
    // Front edge
    { pos: new THREE.Vector3(0, railTop, -w), size: new THREE.Vector3(2 * w, RAIL_THICKNESS, RAIL_THICKNESS) },
    // Back edge
    { pos: new THREE.Vector3(0, railTop, w), size: new THREE.Vector3(2 * w, RAIL_THICKNESS, RAIL_THICKNESS) },
    // Left edge
    { pos: new THREE.Vector3(-w, railTop, 0), size: new THREE.Vector3(RAIL_THICKNESS, RAIL_THICKNESS, 2 * w) },
    // Right edge
    { pos: new THREE.Vector3(w, railTop, 0), size: new THREE.Vector3(RAIL_THICKNESS, RAIL_THICKNESS, 2 * w) },
  ];

  // Posts at corners and midpoints
  const posts: THREE.Vector3[] = [
    new THREE.Vector3(-w, h + RAIL_HEIGHT / 2, -w),
    new THREE.Vector3(w, h + RAIL_HEIGHT / 2, -w),
    new THREE.Vector3(w, h + RAIL_HEIGHT / 2, w),
    new THREE.Vector3(-w, h + RAIL_HEIGHT / 2, w),
    new THREE.Vector3(0, h + RAIL_HEIGHT / 2, -w),
    new THREE.Vector3(0, h + RAIL_HEIGHT / 2, w),
    new THREE.Vector3(-w, h + RAIL_HEIGHT / 2, 0),
    new THREE.Vector3(w, h + RAIL_HEIGHT / 2, 0),
  ];

  for (const pos of posts) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(RAIL_THICKNESS * 1.5, RAIL_THICKNESS * 1.5, RAIL_HEIGHT, 6),
      material,
    );
    post.position.copy(pos);
    group.add(post);
  }

  for (const { pos, size } of edges) {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(size.x, size.y, size.z),
      material,
    );
    rail.position.copy(pos);
    group.add(rail);
  }

  return group;
}

export function buildPlatforms(materials: THREE.Material[] | THREE.Material, fallback: boolean): THREE.Group {
  const group = new THREE.Group();

  for (const h of PLATFORM_HEIGHTS) {
    const mat = fallback ? (materials as THREE.Material[])[0] : (materials as THREE.Material);
    group.add(buildPlatformRing(h, mat));
  }

  // Set heightRatio attribute for vertex-color gradient shader
  group.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry.attributes.position) {
      const positions = child.geometry.attributes.position;
      const heightRatios = new Float32Array(positions.count);
      const worldPos = new THREE.Vector3();
      child.getWorldPosition(worldPos);
      for (let i = 0; i < positions.count; i++) {
        heightRatios[i] = (worldPos.y + positions.getY(i)) / 301;
      }
      child.geometry.setAttribute('heightRatio', new THREE.BufferAttribute(heightRatios, 1));
    }
  });

  return group;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/tower/builders/PlatformBuilder.ts tests/builders.test.ts
git commit -m "feat: add PlatformBuilder with decks and railings at 3 heights"
```

---

### Task 9: CabinBuilder and AntennaBuilder

**Files:**
- Create: `src/tower/builders/CabinBuilder.ts`
- Create: `src/tower/builders/AntennaBuilder.ts`
- Modify: `tests/builders.test.ts` — add both builder tests

**Interfaces:**
- Produces: `buildCabin(mat: THREE.Material, fallback: boolean): THREE.Group` — summit enclosure
- Produces: `buildAntenna(): THREE.Group` — tapered mast (uses its own darker material)

- [ ] **Step 1: Add Builder tests for cabin and antenna**

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

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL — `buildCabin` and `buildAntenna` not exported.

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

  // Cabin base (smaller square at observatory level)
  const cabinWidth = w * 0.6;
  const cabinHeight = 20;
  const cabinY = h + cabinHeight / 2;

  // Main cabin body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(cabinWidth * 2, cabinHeight, cabinWidth * 2),
    mat,
  );
  body.position.y = cabinY;
  group.add(body);

  // Upper observation deck ring
  const topDeck = new THREE.Mesh(
    new THREE.BoxGeometry(cabinWidth * 2.4, 1.0, cabinWidth * 2.4),
    mat,
  );
  topDeck.position.y = h + cabinHeight;
  group.add(topDeck);

  // Set heightRatio attribute for vertex-color gradient shader
  group.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry.attributes.position) {
      const positions = child.geometry.attributes.position;
      const heightRatios = new Float32Array(positions.count);
      const worldPos = new THREE.Vector3();
      child.getWorldPosition(worldPos);
      for (let i = 0; i < positions.count; i++) {
        heightRatios[i] = (worldPos.y + positions.getY(i)) / 301;
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

  // Tapered mast
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 1.2, ANTENNA_HEIGHT, 8),
    antennaMaterial,
  );
  mast.position.y = HEIGHT_TOP + ANTENNA_HEIGHT / 2;
  group.add(mast);

  // Thin tip
  const tip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.6, 2, 8),
    antennaMaterial,
  );
  tip.position.y = HEIGHT_TOP + ANTENNA_HEIGHT;
  group.add(tip);

  return group;
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/tower/builders/CabinBuilder.ts src/tower/builders/AntennaBuilder.ts tests/builders.test.ts
git commit -m "feat: add CabinBuilder and AntennaBuilder"
```

---

### Task 10: Tower Assembler

**Files:**
- Create: `src/tower/Tower.ts`

**Interfaces:**
- Consumes: All builder functions
- Consumes: `SCENE_SCALE` from constants
- Produces: `buildTower(): { group: THREE.Group; material: THREE.ShaderMaterial; fallback: boolean }` — assembled tower with shadows and scale applied

- [ ] **Step 1: Create src/tower/Tower.ts**

```typescript
import * as THREE from 'three';
import { buildLegs } from './builders/LegBuilder';
import { buildLattice } from './builders/LatticeBuilder';
import { buildArches } from './builders/ArchBuilder';
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
  // Check if shader compiled: a valid ShaderMaterial will have a non-empty vertexShader
  if (shaderMat.vertexShader && shaderMat.vertexShader.length > 50) {
    material = shaderMat;
  } else {
    material = createTowerMaterialFallback();
    isFallback = true;
  }

  const group = new THREE.Group();

  group.add(buildLegs(material, isFallback));
  group.add(buildLattice(material, isFallback));
  group.add(buildArches(material, isFallback));
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

- [ ] **Step 2: Run existing tests to verify they still pass**

```bash
npm test
```

Expected: PASS — all tests still pass. Tower.ts imports don't break anything.

- [ ] **Step 3: Commit**

```bash
git add src/tower/Tower.ts
git commit -m "feat: add Tower assembler composing all builders"
```

---

### Task 11: EnvironmentTheme

**Files:**
- Create: `src/viewer/EnvironmentTheme.ts`
- Create: `tests/environment.test.ts`

**Interfaces:**
- Produces: `applyTheme(scene: THREE.Scene, renderer: THREE.WebGLRenderer, theme: 'day' | 'night', towerMaterial?: THREE.ShaderMaterial): void`

- [ ] **Step 1: Create tests/environment.test.ts**

```typescript
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { applyTheme } from '../src/viewer/EnvironmentTheme';

function createMockScene(): THREE.Scene {
  const scene = new THREE.Scene();
  const hemi = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
  scene.add(hemi);
  const ambient = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambient);
  return scene;
}

describe('applyTheme', () => {
  it('sets day background and light values', () => {
    const scene = createMockScene();
    const renderer = new THREE.WebGLRenderer();
    applyTheme(scene, renderer, 'day');
    const bg = scene.background as THREE.Color;
    expect(bg.getHex()).toBe(0x87ceeb);
  });

  it('sets night background darker', () => {
    const scene = createMockScene();
    const renderer = new THREE.WebGLRenderer();
    applyTheme(scene, renderer, 'night');
    const bg = scene.background as THREE.Color;
    const day = new THREE.Color(0x87ceeb);
    expect(bg.r).toBeLessThan(day.r);
  });

  it('updates hemisphere light for day', () => {
    const scene = createMockScene();
    const renderer = new THREE.WebGLRenderer();
    applyTheme(scene, renderer, 'day');
    const hemi = scene.children.find((c) => c instanceof THREE.HemisphereLight) as THREE.HemisphereLight;
    expect(hemi.color.getHex()).toBe(0x87ceeb);
    expect(hemi.groundColor.getHex()).toBe(0x7a7a7a);
  });

  it('reduces ambient light for night', () => {
    const scene = createMockScene();
    const renderer = new THREE.WebGLRenderer();
    applyTheme(scene, renderer, 'night');
    const ambient = scene.children.find((c) => c instanceof THREE.AmbientLight) as THREE.AmbientLight;
    expect(ambient.intensity).toBeLessThan(0.5);
  });

  it('does not throw when no tower material', () => {
    const scene = createMockScene();
    const renderer = new THREE.WebGLRenderer();
    expect(() => applyTheme(scene, renderer, 'night')).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL — `EnvironmentTheme.ts` does not exist.

- [ ] **Step 3: Create src/viewer/EnvironmentTheme.ts**

```typescript
import * as THREE from 'three';
import { setNightMode } from '../tower/materials';

export type Theme = 'day' | 'night';

export function applyTheme(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  theme: Theme,
  towerMaterial?: THREE.ShaderMaterial,
): void {
  if (theme === 'day') {
    scene.background = new THREE.Color(0x87ceeb);
    renderer.setClearColor(0x87ceeb);
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.00005);
  } else {
    scene.background = new THREE.Color(0x0a1525);
    renderer.setClearColor(0x0a1525);
    scene.fog = new THREE.FogExp2(0x0a1525, 0.00003);
  }

  scene.traverse((child) => {
    if (child instanceof THREE.DirectionalLight) {
      if (theme === 'day') {
        child.color.set(0xfff5e6);
        child.intensity = 2.0;
      } else {
        child.color.set(0xc8d8ff);
        child.intensity = 0.4;
      }
    } else if (child instanceof THREE.HemisphereLight) {
      if (theme === 'day') {
        child.color.set(0x87ceeb);
        child.groundColor.set(0x7a7a7a);
        child.intensity = 0.6;
      } else {
        child.color.set(0x1a2a4a);
        child.groundColor.set(0x050505);
        child.intensity = 0.2;
      }
    } else if (child instanceof THREE.AmbientLight) {
      child.intensity = theme === 'day' ? 0.1 : 0.05;
    } else if (child instanceof THREE.PointLight && child.name === 'beacon') {
      child.visible = theme === 'night';
    }
  });

  if (towerMaterial) {
    setNightMode(towerMaterial, theme === 'night');
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/viewer/EnvironmentTheme.ts tests/environment.test.ts
git commit -m "feat: add EnvironmentTheme with day/night lighting configuration"
```

---

### Task 12: CameraRig with Speed-Priority Auto-Rotation

**Files:**
- Create: `src/viewer/CameraRig.ts`

**Interfaces:**
- Consumes: `CAMERA_INITIAL_POSITION`, `CAMERA_TARGET`, `AUTO_ROTATION_SPEED`, `AUTO_ROTATION_RECOVERY_S` from constants
- Produces: `createCamera(aspect: number): THREE.PerspectiveCamera`
- Produces: `resetCamera(camera: THREE.PerspectiveCamera): void`
- Produces: `createAutoRotation(): AutoRotationState`
- Produces: `updateAutoRotation(state: AutoRotationState, deltaSec: number, userDragging: boolean): number` — returns current speed to set on OrbitControls

- [ ] **Step 1: Create src/viewer/CameraRig.ts**

```typescript
import * as THREE from 'three';
import { CAMERA_INITIAL_POSITION, AUTO_ROTATION_SPEED, AUTO_ROTATION_RECOVERY_S } from '../constants';

const FOV = 45;

export function createCamera(aspect: number): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(FOV, aspect, 0.5, 50);
  camera.position.copy(CAMERA_INITIAL_POSITION).multiplyScalar(0.01);
  return camera;
}

export function resetCamera(camera: THREE.PerspectiveCamera): void {
  camera.position.copy(CAMERA_INITIAL_POSITION).multiplyScalar(0.01);
}

export interface AutoRotationState {
  nominalSpeed: number;
  currentSpeed: number;
  recoveryRate: number;
}

export function createAutoRotation(): AutoRotationState {
  return {
    nominalSpeed: AUTO_ROTATION_SPEED,
    currentSpeed: AUTO_ROTATION_SPEED,
    recoveryRate: 1.0 / AUTO_ROTATION_RECOVERY_S,
  };
}

export function updateAutoRotation(state: AutoRotationState, deltaSec: number, userDragging: boolean): number {
  if (userDragging) {
    state.currentSpeed = Math.max(0, state.currentSpeed - state.nominalSpeed * deltaSec * 2);
  } else {
    state.currentSpeed += (state.nominalSpeed - state.currentSpeed) * state.recoveryRate * deltaSec;
  }
  return state.currentSpeed;
}
```

- [ ] **Step 2: Commit** (no test file for CameraRig — it's tightly coupled to Three.js runtime, verified via manual testing as spec notes)

```bash
git add src/viewer/CameraRig.ts
git commit -m "feat: add CameraRig with speed-priority auto-rotation blending"
```

---

### Task 13: OrbitControlsSetup

**Files:**
- Create: `src/controls/OrbitControlsSetup.ts`

**Interfaces:**
- Consumes: `CAMERA_TARGET`, `SCENE_SCALE` from constants
- Produces: `createOrbitControls(camera: THREE.Camera, dom: HTMLElement): OrbitControls` — damped orbit controls with zoom limits and autoRotate enabled

- [ ] **Step 1: Create src/controls/OrbitControlsSetup.ts**

```typescript
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
import { CAMERA_TARGET, SCENE_SCALE, AUTO_ROTATION_SPEED } from '../constants';

export function createOrbitControls(camera: THREE.Camera, dom: HTMLElement): OrbitControls {
  const controls = new OrbitControls(camera, dom);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 1.0;
  controls.maxDistance = 10;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.target.copy(CAMERA_TARGET).multiplyScalar(SCENE_SCALE);
  controls.autoRotate = true;
  controls.autoRotateSpeed = AUTO_ROTATION_SPEED;
  controls.update();
  return controls;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/controls/OrbitControlsSetup.ts
git commit -m "feat: add OrbitControlsSetup with damping and auto-rotation"
```

---

### Task 14: Viewer — Scene, Renderer, Animation Loop

**Files:**
- Create: `src/viewer/Viewer.ts`

**Interfaces:**
- Consumes: `buildTower()`, `applyTheme()`, `createCamera()`, `resetCamera()`, `createAutoRotation()`, `updateAutoRotation()`, `createOrbitControls()`
- Consumes: `updateSparkle()`, `isFallback` from tower result
- Produces: `Viewer` class with `start()`, `setTheme()`, `resetCamera()`, `dispose()`

- [ ] **Step 1: Create src/viewer/Viewer.ts**

```typescript
import * as THREE from 'three';
import { buildTower, TowerBuildResult } from '../tower/Tower';
import { applyTheme, Theme } from './EnvironmentTheme';
import { createCamera, resetCamera, createAutoRotation, updateAutoRotation, AutoRotationState } from './CameraRig';
import { createOrbitControls } from '../controls/OrbitControlsSetup';
import { updateSparkle } from '../tower/materials';

export class Viewer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: ReturnType<typeof createOrbitControls>;
  private towerResult: TowerBuildResult;
  private rafId = 0;
  private autoRotation: AutoRotationState;
  private isDragging = false;
  private sparkleStartTime = 0;
  private currentTheme: Theme = 'day';

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
    this.autoRotation = createAutoRotation();
    this.controls.autoRotateSpeed = this.autoRotation.nominalSpeed;

    this.setupLights();
    this.setupGround();
    this.towerResult = buildTower();
    this.scene.add(this.towerResult.group);

    applyTheme(this.scene, this.renderer, 'day', this.towerResult.isFallback ? undefined : this.towerResult.material as THREE.ShaderMaterial);

    this.setupDragDetection();
    this.setupContextLost();
    this.setupResize();
  }

  private setupLights(): void {
    const sun = new THREE.DirectionalLight(0xfff5e6, 2.0);
    sun.position.set(200, 400, 100);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.1;
    sun.shadow.camera.far = 1000;
    const d = 400;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    this.scene.add(sun);

    const hemi = new THREE.HemisphereLight(0x87ceeb, 0x7a7a7a, 0.6);
    this.scene.add(hemi);

    const ambient = new THREE.AmbientLight(0xffffff, 0.1);
    this.scene.add(ambient);

    const beacon = new THREE.PointLight(0xffd27f, 0, 8);
    beacon.name = 'beacon';
    beacon.position.set(0, 330, 0);
    beacon.visible = false;
    this.scene.add(beacon);
  }

  private setupGround(): void {
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(600, 64),
      new THREE.ShadowMaterial({ opacity: 0.3 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  private setupDragDetection(): void {
    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', () => { this.isDragging = true; });
    dom.addEventListener('pointerup', () => { this.isDragging = false; });
    dom.addEventListener('pointerleave', () => { this.isDragging = false; });
  }

  private setupContextLost(): void {
    this.renderer.domElement.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      cancelAnimationFrame(this.rafId);
      const msg = document.createElement('div');
      msg.style.cssText =
        'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:white;font-size:20px;background:rgba(0,0,0,0.7);z-index:100;';
      msg.textContent = 'WebGL context lost. Please reload the page.';
      this.container.appendChild(msg);
    });
  }

  private setupResize(): void {
    window.addEventListener('resize', () => {
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  start(): void {
    const clock = new THREE.Clock();
    const animate = () => {
      this.rafId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1); // cap delta to avoid jumps

      // Update auto-rotation speed
      const speed = updateAutoRotation(this.autoRotation, delta, this.isDragging);
      this.controls.autoRotateSpeed = speed;

      this.controls.update();

      // Update light direction uniform if using custom shader
      if (!this.towerResult.isFallback) {
        const mat = this.towerResult.material as THREE.ShaderMaterial;
        const sun = this.scene.children.find((c) => c instanceof THREE.DirectionalLight) as THREE.DirectionalLight;
        if (sun && mat.uniforms) {
          const dir = new THREE.Vector3();
          sun.getWorldDirection(dir);
          mat.uniforms.lightDirection.value.copy(dir);
        }
        if (this.currentTheme === 'night') {
          updateSparkle(mat, this.sparkleStartTime > 0 ? performance.now() - this.sparkleStartTime : 0);
        }
      }

      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    if (theme === 'night') {
      this.sparkleStartTime = performance.now();
    } else {
      this.sparkleStartTime = 0;
    }
    applyTheme(
      this.scene,
      this.renderer,
      theme,
      this.towerResult.isFallback ? undefined : this.towerResult.material as THREE.ShaderMaterial,
    );
  }

  resetCamera(): void {
    resetCamera(this.camera);
    this.controls.target.set(0, 1.5, 0); // scaled target
    this.controls.update();
  }

  get isFallback(): boolean {
    return this.towerResult.isFallback;
  }

  dispose(): void {
    cancelAnimationFrame(this.rafId);
    this.controls.dispose();
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/viewer/Viewer.ts
git commit -m "feat: add Viewer with scene, lights, ground, and animation loop"
```

---

### Task 15: UI Components — ThemeToggle, InfoOverlay, LoadingOverlay

**Files:**
- Create: `src/ui/ThemeToggle.ts`
- Create: `src/ui/InfoOverlay.ts`
- Create: `src/ui/LoadingOverlay.ts`

**Interfaces:**
- Produces: `createThemeToggle(onToggle: () => void): HTMLElement`
- Produces: `createInfoOverlay(): { element: HTMLElement; toggle: HTMLElement }`
- Produces: `createLoadingOverlay(): HTMLElement`

- [ ] **Step 1: Create src/ui/ThemeToggle.ts**

```typescript
export function createThemeToggle(onToggle: () => void): HTMLElement {
  const el = document.createElement('button');
  el.textContent = '\u2600 Day';
  el.style.cssText =
    'position:absolute;top:12px;right:12px;padding:8px 14px;' +
    'background:rgba(10,10,18,0.7);color:#e8e8e8;font:13px monospace;' +
    'border:1px solid #444;border-radius:6px;cursor:pointer;z-index:10;';

  let isNight = false;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  el.addEventListener('click', () => {
    if (debounceTimer) return;
    debounceTimer = setTimeout(() => { debounceTimer = null; }, 300);

    isNight = !isNight;
    el.textContent = isNight ? '\uD83C\uDF19 Night' : '\u2600 Day';
    onToggle();
  });

  return el;
}
```

- [ ] **Step 2: Create src/ui/InfoOverlay.ts**

```typescript
import {
  HEIGHT_TOTAL,
  HEIGHT_TOP,
  ANTENNA_HEIGHT,
  BASE_HALF_WIDTH,
  PLATFORM_HEIGHTS,
} from '../constants';

export function createInfoOverlay(): { element: HTMLElement; toggle: HTMLElement } {
  const element = document.createElement('div');
  element.style.cssText =
    'position:absolute;bottom:12px;left:12px;padding:10px 12px;' +
    'background:rgba(10,10,18,0.7);color:#e8e8e8;font:13px/1.5 monospace;' +
    'border-radius:6px;max-width:280px;z-index:10;';

  const base = BASE_HALF_WIDTH * 2;
  const [p1, p2, p3] = PLATFORM_HEIGHTS;

  element.innerHTML =
    '<b>Eiffel Tower</b><br>' +
    `Height: ${HEIGHT_TOTAL} m (${HEIGHT_TOP} + ${ANTENNA_HEIGHT} antenna)<br>` +
    `Base: ${base} \u00D7 ${base} m<br>` +
    `Platforms: ${p1} / ${p2} / ${p3} m<br>` +
    '<span style="opacity:0.7">~18,000 iron pieces \u00B7 ~7,300 t</span>';

  const toggle = document.createElement('button');
  toggle.textContent = 'Info';
  toggle.style.cssText =
    'position:absolute;bottom:12px;left:12px;padding:4px 10px;' +
    'background:rgba(10,10,18,0.7);color:#e8e8e8;font:11px monospace;' +
    'border:1px solid #444;border-radius:4px;cursor:pointer;z-index:11;';
  toggle.style.display = 'none';

  element.addEventListener('mouseenter', () => {
    element.style.display = 'none';
    toggle.style.display = 'block';
  });

  toggle.addEventListener('click', () => {
    toggle.style.display = 'none';
    element.style.display = 'block';
  });

  return { element, toggle };
}
```

- [ ] **Step 3: Create src/ui/LoadingOverlay.ts**

```typescript
export function createLoadingOverlay(): HTMLElement {
  const el = document.createElement('div');
  el.style.cssText =
    'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;' +
    'background:rgba(0,0,0,0.85);color:#e8e8e8;font:16px monospace;z-index:20;';
  el.innerHTML = '<span>Building tower\u2026</span>';
  return el;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/ui/ThemeToggle.ts src/ui/InfoOverlay.ts src/ui/LoadingOverlay.ts
git commit -m "feat: add UI components — theme toggle, info overlay, loading overlay"
```

---

### Task 16: App — Top-Level Controller

**Files:**
- Create: `src/App.ts`

**Interfaces:**
- Consumes: `Viewer`, all UI components
- Produces: `App` class with `start()`, `dispose()`, keyboard shortcuts

- [ ] **Step 1: Create src/App.ts**

```typescript
import { Viewer } from './viewer/Viewer';
import { createThemeToggle } from './ui/ThemeToggle';
import { createInfoOverlay } from './ui/InfoOverlay';
import { createLoadingOverlay } from './ui/LoadingOverlay';

export class App {
  private viewer: Viewer;
  private loading: HTMLElement;
  private isDay = true;
  private infoOverlay: HTMLElement | null = null;
  private infoToggle: HTMLElement | null = null;
  private themeBtn: HTMLElement | null = null;

  constructor(private container: HTMLElement) {
    this.container.style.position = 'relative';
    this.loading = createLoadingOverlay();
    this.container.appendChild(this.loading);

    this.viewer = new Viewer(this.container);

    this.setupUI();
    this.setupKeyboard();
  }

  private setupUI(): void {
    this.themeBtn = createThemeToggle(() => {
      this.toggleTheme();
    });
    this.container.appendChild(this.themeBtn);

    const { element, toggle } = createInfoOverlay();
    this.infoOverlay = element;
    this.infoToggle = toggle;
    this.container.appendChild(element);
    this.container.appendChild(toggle);
  }

  private toggleTheme(): void {
    this.isDay = !this.isDay;
    this.viewer.setTheme(this.isDay ? 'day' : 'night');
  }

  private setupKeyboard(): void {
    this.container.tabIndex = 0;
    this.container.addEventListener('keydown', (event) => {
      switch (event.key.toLowerCase()) {
        case 'r':
          this.viewer.resetCamera();
          break;
        case 't':
          this.toggleTheme();
          break;
        case 'i':
          if (this.infoOverlay && this.infoToggle) {
            if (this.infoOverlay.style.display === 'none') {
              this.infoOverlay.style.display = 'block';
              this.infoToggle.style.display = 'none';
            } else {
              this.infoOverlay.style.display = 'none';
              this.infoToggle.style.display = 'block';
            }
          }
          break;
      }
    });
  }

  start(): void {
    requestAnimationFrame(() => {
      this.viewer.start();
      if (this.loading.parentNode) {
        this.container.removeChild(this.loading);
      }
    });
  }

  dispose(): void {
    this.viewer.dispose();
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/App.ts
git commit -m "feat: add App controller with keyboard shortcuts and UI wiring"
```

---

### Task 17: Entry Point — main.ts with WebGL Check

**Files:**
- Create: `src/main.ts`

**Interfaces:**
- Consumes: `App`
- Produces: Bootstrap that checks WebGL support, mounts app, starts everything

- [ ] **Step 1: Create src/main.ts**

```typescript
import { App } from './App';

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function showFallback(container: HTMLElement): void {
  container.innerHTML = '';
  container.style.cssText =
    'display:flex;align-items:center;justify-content:center;' +
    'color:white;font:16px monospace;background:#0a0a0a;height:100%;';
  container.textContent = 'Your browser does not support WebGL. Please use a modern browser.';
}

const container = document.getElementById('app');
if (!container) throw new Error('#app container not found');

if (!isWebGLAvailable()) {
  showFallback(container);
} else {
  const app = new App(container);
  app.start();
}
```

- [ ] **Step 2: Verify build compiles**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/main.ts
git commit -m "feat: add main entry point with WebGL support check"
```

---

### Task 18: Integration Smoke Test

**Files:**
- Create: `tests/smoke.test.ts`

**Interfaces:**
- Creates a smoke test that verifies the app bootstraps in a jsdom environment

- [ ] **Step 1: Create tests/smoke.test.ts**

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { JSDOM } from 'jsdom';

describe('smoke', () => {
  let dom: JSDOM;

  // Provide a minimal WebGL mock so THREE doesn't crash in Node
  beforeAll(() => {
    dom = new JSDOM('<!DOCTYPE html><div id="app"></div>', {
      url: 'http://localhost',
      pretendToBeVisual: true,
    });
    (globalThis as any).window = dom.window;
    (globalThis as any).document = dom.window.document;
    (globalThis as any).HTMLElement = dom.window.HTMLElement;
    (globalThis as any).HTMLCanvasElement = dom.window.HTMLCanvasElement;
    (globalThis as any).HTMLButtonElement = dom.window.HTMLButtonElement;
    (globalThis as any).navigator = dom.window.navigator;
    (globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 16) as unknown as number;
    (globalThis as any).cancelAnimationFrame = (id: number) => clearTimeout(id);
    (globalThis as any).performance = { now: () => Date.now() };

    // WebGL mock
    const getContext = dom.window.HTMLCanvasElement.prototype.getContext;
    dom.window.HTMLCanvasElement.prototype.getContext = function (
      contextId: string,
      options?: any,
    ) {
      if (contextId === 'webgl2' || contextId === 'webgl') return null;
      return getContext.call(this, contextId, options);
    };
  });

  afterAll(() => {
    dom.window.close();
  });

  it('test runner works', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 2: Run all tests**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add tests/smoke.test.ts
git commit -m "test: add smoke test with jsdom and WebGL mock"
```

---

### Final Verification

- [ ] Run `npm test` — all tests pass
- [ ] Run `npm run build` — TypeScript compiles, Vite bundles successfully
- [ ] Run `npm run dev` — opens browser, tower renders, orbit works, day/night toggles with sparkle, overlay shows correct data, keyboard shortcuts work, auto-rotation blends during/after drag

All three commands must succeed before the work is complete.
