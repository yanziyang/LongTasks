import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { buildInterLegLattice } from '../src/tower/builders/InterLegLatticeBuilder';
import { createTowerMaterialFallback } from '../src/tower/materials';

function countMeshes(obj: THREE.Object3D): number {
  let count = 0;
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) count++;
  });
  return count;
}

describe('buildInterLegLattice', () => {
  it('returns a Group', () => {
    const mats = createTowerMaterialFallback();
    const result = buildInterLegLattice(mats, true);
    expect(result).toBeInstanceOf(THREE.Group);
  });

  it('contains many meshes (body lattice + arch panels)', () => {
    const mats = createTowerMaterialFallback();
    const result = buildInterLegLattice(mats, true);
    expect(countMeshes(result)).toBeGreaterThan(500);
  });

  it('has non-zero bounding box', () => {
    const mats = createTowerMaterialFallback();
    const result = buildInterLegLattice(mats, true);
    const box = new THREE.Box3().setFromObject(result);
    expect(box.isEmpty()).toBe(false);
  });

  it('bounding box spans from ground to near HEIGHT_TOP', () => {
    const mats = createTowerMaterialFallback();
    const result = buildInterLegLattice(mats, true);
    const box = new THREE.Box3().setFromObject(result);
    expect(box.min.y).toBeLessThan(5);
    expect(box.max.y).toBeGreaterThan(250);
  });

  it('has heightRatio attribute on meshes', () => {
    const mats = createTowerMaterialFallback();
    const result = buildInterLegLattice(mats, true);
    let foundAttribute = false;
    result.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry.attributes.heightRatio) {
        foundAttribute = true;
      }
    });
    expect(foundAttribute).toBe(true);
  });
});
