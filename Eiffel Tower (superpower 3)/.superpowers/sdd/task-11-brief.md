### Task 11: EnvironmentTheme

**Files:**
- Create: `src/viewer/EnvironmentTheme.ts`
- Create: `tests/environment.test.ts`

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

- [ ] **Step 2: Run test to verify it fails** — `npm test` → FAIL

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

- [ ] **Step 4: Run test** — `npm test` → PASS

- [ ] **Step 5: Commit**

```bash
git add src/viewer/EnvironmentTheme.ts tests/environment.test.ts
git commit -m "feat: add EnvironmentTheme with day/night lighting configuration"
```
