import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  createTowerMaterial,
  createTowerMaterialFallback,
  createPierMaterial,
  createGlassMaterial,
  antennaMaterial,
  nightTowerMaterial,
  setNightMode,
  updateSparkle,
  createNightModeGroup,
} from '../src/tower/materials';

describe('createTowerMaterial', () => {
  it('returns a MeshStandardMaterial', () => {
    const mat = createTowerMaterial();
    expect(mat).toBeInstanceOf(THREE.MeshStandardMaterial);
    mat.dispose();
  });

  it('has vertexColors enabled', () => {
    const mat = createTowerMaterial();
    expect(mat.vertexColors).toBe(true);
    mat.dispose();
  });

  it('has a name', () => {
    const mat = createTowerMaterial();
    expect(mat.name).toBe('tower-iron');
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

describe('createPierMaterial', () => {
  it('returns a MeshStandardMaterial', () => {
    const mat = createPierMaterial();
    expect(mat).toBeInstanceOf(THREE.MeshStandardMaterial);
  });

  it('has high roughness for stone look', () => {
    const mat = createPierMaterial();
    expect(mat.roughness).toBeGreaterThan(0.5);
  });
});

describe('createGlassMaterial', () => {
  it('returns a MeshPhysicalMaterial', () => {
    const mat = createGlassMaterial();
    expect(mat).toBeInstanceOf(THREE.MeshPhysicalMaterial);
  });

  it('is transparent', () => {
    const mat = createGlassMaterial();
    expect(mat.transparent).toBe(true);
    expect(mat.opacity).toBeLessThan(1);
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

describe('nightTowerMaterial', () => {
  it('is a MeshStandardMaterial', () => {
    expect(nightTowerMaterial).toBeInstanceOf(THREE.MeshStandardMaterial);
  });

  it('has emissive set', () => {
    expect(nightTowerMaterial.emissive).toBeDefined();
    expect(nightTowerMaterial.emissiveIntensity).toBeGreaterThan(0);
  });
});

describe('createNightModeGroup', () => {
  it('returns twinkle lights and emissive meshes', () => {
    const group = new THREE.Group();
    const result = createNightModeGroup(group);
    expect(result.twinkleLights.length).toBeGreaterThan(0);
    expect(result.emissiveMeshes.length).toBeGreaterThan(0);
  });

  it('includes a beacon light', () => {
    const group = new THREE.Group();
    const result = createNightModeGroup(group);
    const beacon = result.twinkleLights.find((l) => l.name === 'beacon');
    expect(beacon).toBeDefined();
  });
});

describe('setNightMode', () => {
  it('does not throw with valid materials', () => {
    const dayMat = createTowerMaterial();
    const group = new THREE.Group();
    const ng = createNightModeGroup(group);
    expect(() => setNightMode(dayMat, nightTowerMaterial, ng, true, group)).not.toThrow();
    dayMat.dispose();
  });

  it('handles null nightGroup', () => {
    const dayMat = createTowerMaterial();
    expect(() => setNightMode(dayMat, nightTowerMaterial, null, true)).not.toThrow();
    dayMat.dispose();
  });
});

describe('updateSparkle', () => {
  it('accepts elapsed time without throwing', () => {
    const group = new THREE.Group();
    const ng = createNightModeGroup(group);
    expect(() => updateSparkle(ng, 5000)).not.toThrow();
  });

  it('does nothing with null nightGroup', () => {
    expect(() => updateSparkle(null, 5000)).not.toThrow();
  });
});
