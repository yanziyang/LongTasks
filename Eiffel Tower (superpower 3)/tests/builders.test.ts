import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { buildLegs } from '../src/tower/builders/LegBuilder';
import { buildCabin } from '../src/tower/builders/CabinBuilder';
import { buildAntenna } from '../src/tower/builders/AntennaBuilder';
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
