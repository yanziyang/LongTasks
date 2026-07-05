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
