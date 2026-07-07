import * as THREE from 'three';
import {
  TOWER_COLOR_LOWER,
  TOWER_COLOR_MIDDLE,
  TOWER_COLOR_UPPER,
  ANTENNA_COLOR,
  PIER_COLOR,
  NIGHT_EMISSIVE_COLOR,
  NIGHT_EMISSIVE_INTENSITY,
  TWINKLE_POINT_COUNT,
  SPARKLE_INTERVAL_MS,
  SPARKLE_DURATION_MS,
  SPARKLE_ENTER_DURATION_MS,
} from '../constants';

function generateGrainTexture(size: number, baseR: number, baseG: number, baseB: number, noiseAmp: number): THREE.DataTexture {
  const data = new Uint8Array(size * size * 3);
  for (let i = 0; i < data.length; i += 3) {
    const noise = (Math.random() - 0.5) * noiseAmp;
    data[i] = Math.min(255, Math.max(0, baseR + noise));
    data[i + 1] = Math.min(255, Math.max(0, baseG + noise));
    data[i + 2] = Math.min(255, Math.max(0, baseB + noise));
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function generateRoughnessTexture(size: number): THREE.DataTexture {
  const data = new Uint8Array(size * size);
  for (let i = 0; i < data.length; i++) {
    data[i] = 150 + Math.floor((Math.random() - 0.5) * 60);
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RedFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.LinearSRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function generateMetalnessTexture(size: number): THREE.DataTexture {
  const data = new Uint8Array(size * size);
  for (let i = 0; i < data.length; i++) {
    data[i] = 90 + Math.floor((Math.random() - 0.5) * 30);
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RedFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.LinearSRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function generateNormalTexture(size: number): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  const bumpSize = 4;
  const bumpAmp = 20;
  const heightMap = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const bx = Math.floor(x / bumpSize);
      const by = Math.floor(y / bumpSize);
      const r = bx * 12.9898 + by * 78.233;
      const h = (Math.sin(r) * 43758.5453) % 1;
      heightMap[y * size + x] = (h - 0.5) * bumpAmp;
    }
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const hl = heightMap[y * size + ((x - 1 + size) % size)];
      const hr = heightMap[y * size + ((x + 1) % size)];
      const hu = heightMap[((y - 1 + size) % size) * size + x];
      const hd = heightMap[((y + 1) % size) * size + x];
      const nx = (hl - hr) * 0.5;
      const ny = (hu - hd) * 0.5;
      const nz = 1.0;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      data[idx] = Math.floor(((nx / len) * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.floor(((ny / len) * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.floor(((nz / len) * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.LinearSRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

const TEX_SIZE = 256;

const albedoTex = generateGrainTexture(TEX_SIZE, 210, 200, 185, 15);
const roughnessTex = generateRoughnessTexture(TEX_SIZE);
const metalnessTex = generateMetalnessTexture(TEX_SIZE);
const normalTex = generateNormalTexture(TEX_SIZE);

export function createTowerMaterial(): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: albedoTex,
    roughnessMap: roughnessTex,
    roughness: 0.75,
    metalnessMap: metalnessTex,
    metalness: 0.45,
    normalMap: normalTex,
    normalScale: new THREE.Vector2(0.3, 0.3),
    vertexColors: true,
    name: 'tower-iron',
  });
  return mat;
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

export function createPierMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: PIER_COLOR,
    roughness: 0.9,
    metalness: 0.05,
    name: 'pier-stone',
  });
}

export function createGlassMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: 0xc8d8e8,
    metalness: 0.1,
    roughness: 0.15,
    opacity: 0.45,
    transparent: true,
    envMapIntensity: 0.5,
    clearcoat: 0.3,
    name: 'pavilion-glass',
  });
}

export const antennaMaterial = new THREE.MeshStandardMaterial({
  color: ANTENNA_COLOR,
  metalness: 0.6,
  roughness: 0.4,
});

export const nightTowerMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  map: albedoTex,
  roughnessMap: roughnessTex,
  roughness: 0.75,
  metalnessMap: metalnessTex,
  metalness: 0.45,
  normalMap: normalTex,
  normalScale: new THREE.Vector2(0.3, 0.3),
  vertexColors: true,
  emissive: NIGHT_EMISSIVE_COLOR,
  emissiveIntensity: NIGHT_EMISSIVE_INTENSITY,
  name: 'tower-iron-night',
});

export const riverMaterial = new THREE.MeshStandardMaterial({
  color: 0x3a6b8c,
  roughness: 0.2,
  metalness: 0.3,
  name: 'seine-water',
});

export const grassMaterial = new THREE.MeshStandardMaterial({
  color: 0x4a7c3f,
  roughness: 0.95,
  metalness: 0,
  name: 'grass',
});

export const trocaderoMaterial = new THREE.MeshStandardMaterial({
  color: 0x8a8a7a,
  roughness: 0.8,
  metalness: 0.05,
  name: 'trocadero-stone',
});

export const esplanadeMaterial = new THREE.MeshStandardMaterial({
  color: 0xa09a8e,
  roughness: 0.7,
  metalness: 0.05,
  name: 'esplanade-paving',
});

export interface NightModeGroup {
  twinkleLights: THREE.PointLight[];
  emissiveMeshes: THREE.Mesh[];
}

export function createNightModeGroup(towerGroup: THREE.Group): NightModeGroup {
  const twinkleLights: THREE.PointLight[] = [];
  const emissiveMeshes: THREE.Mesh[] = [];
  const box = new THREE.Box3().setFromObject(towerGroup);

  for (let i = 0; i < TWINKLE_POINT_COUNT; i++) {
    const x = (Math.random() - 0.5) * (box.max.x - box.min.x) * 0.8;
    const y = box.min.y + Math.random() * (box.max.y - box.min.y);
    const z = (Math.random() - 0.5) * (box.max.z - box.min.z) * 0.8;
    const light = new THREE.PointLight(0xffd27f, 0, 4);
    light.position.set(x, y, z);
    light.name = 'twinkle';
    twinkleLights.push(light);

    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 4, 4),
      new THREE.MeshBasicMaterial({ color: 0xffd27f }),
    );
    dot.visible = false;
    dot.position.copy(light.position);
    dot.name = 'twinkle-dot';
    emissiveMeshes.push(dot);
  }

  const beacon = new THREE.PointLight(0xffd27f, 0, 8);
  beacon.name = 'beacon';
  beacon.position.set(0, 330 * 0.01, 0);
  twinkleLights.push(beacon);

  return { twinkleLights, emissiveMeshes };
}

export function setNightMode(
  dayMaterial: THREE.MeshStandardMaterial,
  nightMaterial: THREE.MeshStandardMaterial,
  nightGroup: NightModeGroup | null,
  night: boolean,
  towerGroup?: THREE.Group,
): void {
  if (night) {
    towerGroup?.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material === dayMaterial) {
        child.material = nightMaterial;
      }
    });
  } else {
    towerGroup?.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material === nightMaterial) {
        child.material = dayMaterial;
      }
    });
  }

  if (nightGroup) {
    for (const light of nightGroup.twinkleLights) {
      light.intensity = night ? 0.2 : 0;
    }
    for (const dot of nightGroup.emissiveMeshes) {
      dot.visible = night;
    }
  }
}

export function updateSparkle(nightGroup: NightModeGroup | null, elapsedMs: number): void {
  if (!nightGroup) return;
  const interval = SPARKLE_INTERVAL_MS;
  const duration = SPARKLE_DURATION_MS;
  const enterDuration = SPARKLE_ENTER_DURATION_MS;

  const cycle = elapsedMs % interval;
  const inBurst = cycle < duration;

  if (inBurst) {
    const burstElapsed = cycle;
    const ramp = burstElapsed < enterDuration ? burstElapsed / enterDuration : 1.0;
    for (const light of nightGroup.twinkleLights) {
      if (light.name === 'beacon') {
        light.intensity = 1.5 * ramp;
      }
    }
  } else {
    for (const light of nightGroup.twinkleLights) {
      if (light.name === 'beacon') {
        light.intensity = 0;
      }
    }
  }

  if (nightGroup.twinkleLights.length > 1) {
    const t = elapsedMs * 0.001;
    for (let i = 0; i < nightGroup.twinkleLights.length - 1; i++) {
      const flicker = Math.sin(t * (3 + i % 5) + i * 1.7) * 0.5 + 0.5;
      const on = flicker > 0.55;
      nightGroup.twinkleLights[i].intensity = on ? 0.2 + Math.random() * 0.1 : 0;
    }
  }
}

export function updateLightDirection(_material: THREE.MeshStandardMaterial, _light: THREE.DirectionalLight): void {
  // MeshStandardMaterial uses scene lights automatically — no manual sync needed
}
