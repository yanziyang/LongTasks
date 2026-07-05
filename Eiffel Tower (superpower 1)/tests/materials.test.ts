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
