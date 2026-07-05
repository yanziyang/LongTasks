### Task 4: Custom ShaderMaterial with Vertex-Color Gradient

**Files:**
- Create: `src/tower/materials.ts`
- Create: `tests/materials.test.ts`

**Interfaces:**
- Consumes: `TOWER_COLOR_LOWER`, `TOWER_COLOR_MIDDLE`, `TOWER_COLOR_UPPER`, `ANTENNA_COLOR` from `src/constants.ts`
- Produces: `createTowerMaterial(): THREE.ShaderMaterial`
- Produces: `createTowerMaterialFallback(): THREE.MeshStandardMaterial[]`
- Produces: `antennaMaterial: THREE.MeshStandardMaterial`
- Produces: `setNightMode(material: THREE.ShaderMaterial, night: boolean): void`
- Produces: `updateSparkle(material: THREE.ShaderMaterial, elapsedMs: number): void`
- Produces: `updateLightDirection(material: THREE.ShaderMaterial, light: THREE.DirectionalLight): void`

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
    float t = smoothstep(0.0, 1.0, vHeightRatio);
    vec3 baseColor = mix(lowerColor, middleColor, smoothstep(0.0, 0.45, t));
    baseColor = mix(baseColor, upperColor, smoothstep(0.45, 1.0, t));

    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(vViewDir);
    vec3 L = normalize(lightDirection);

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

    float F0 = 0.05;
    vec3 F = vec3(F0 + (1.0 - F0) * pow(1.0 - NdotH, 5.0));

    vec3 specular = (D * G * F) / (4.0 * max(NdotL * NdotV, 0.001));

    vec3 diffuse = baseColor / 3.14159265;

    vec3 directLight = (diffuse + specular) * lightColor * lightIntensity * NdotL;

    vec3 hemi = mix(groundColor, skyColor, N.y * 0.5 + 0.5);
    vec3 ambient = hemi * ambientIntensity + baseColor * 0.02;

    float emissive = emissiveIntensity;
    if (sparkleTime > 0.01) {
      float seed = pseudoRandom(vWorldPos * 0.5 + sparkleTime);
      float twinkle = sin(sparkleTime * 8.0 + seed * 100.0) * 0.5 + 0.5;
      twinkle = twinkle * twinkle;
      emissive += twinkle * emissiveIntensity * 2.0 * step(0.7, seed);
    }

    vec3 emissiveColor = vec3(0.831, 0.659, 0.263) * emissive;

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

Expected: PASS — 24 tests pass (8 constants + 8 profile + 8 materials).

- [ ] **Step 5: Commit**

```bash
git add src/tower/materials.ts tests/materials.test.ts
git commit -m "feat: add custom ShaderMaterial with vertex-color gradient and PBR"
```
