import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { buildPlatforms } from '../src/tower/builders/PlatformBuilder';
import { buildCabin } from '../src/tower/builders/CabinBuilder';
import { buildAntenna } from '../src/tower/builders/AntennaBuilder';
import { createTowerMaterialFallback } from '../src/tower/materials';

function countMeshes(obj: THREE.Object3D): number {
  let count = 0;
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) count++;
  });
  return count;
}

describe('buildPlatforms', () => {
  it('returns a Group', () => {
    const mats = createTowerMaterialFallback();
    const result = buildPlatforms(mats, true);
    expect(result).toBeInstanceOf(THREE.Group);
  });

  it('contains platform deck, girders, and railing meshes', () => {
    const mats = createTowerMaterialFallback();
    const result = buildPlatforms(mats, true);
    const meshCount = countMeshes(result);
    expect(meshCount).toBeGreaterThan(20);
  });

  it('has non-zero bounding box', () => {
    const mats = createTowerMaterialFallback();
    const result = buildPlatforms(mats, true);
    const box = new THREE.Box3().setFromObject(result);
    expect(box.isEmpty()).toBe(false);
  });
});

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
