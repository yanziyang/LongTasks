import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { buildLegTrusses } from '../src/tower/builders/LegTrussBuilder';
import { createTowerMaterialFallback } from '../src/tower/materials';

function countMeshes(obj: THREE.Object3D): number {
  let count = 0;
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) count++;
  });
  return count;
}

describe('buildLegTrusses', () => {
  it('returns a Group', () => {
    const mats = createTowerMaterialFallback();
    const result = buildLegTrusses(mats, true);
    expect(result).toBeInstanceOf(THREE.Group);
  });

  it('contains 4 leg sub-groups', () => {
    const mats = createTowerMaterialFallback();
    const result = buildLegTrusses(mats, true);
    const legGroups = result.children.filter((c) => c instanceof THREE.Group);
    expect(legGroups.length).toBe(4);
  });

  it('each leg has many meshes (chords + bracing)', () => {
    const mats = createTowerMaterialFallback();
    const result = buildLegTrusses(mats, true);
    const legGroups = result.children.filter((c) => c instanceof THREE.Group);
    for (const leg of legGroups) {
      expect(countMeshes(leg)).toBeGreaterThan(200);
    }
  });

  it('has non-zero bounding box', () => {
    const mats = createTowerMaterialFallback();
    const result = buildLegTrusses(mats, true);
    const box = new THREE.Box3().setFromObject(result);
    expect(box.isEmpty()).toBe(false);
  });

  it('bounding box spans 0 to LEG_SECTION_HEIGHT in Y', () => {
    const mats = createTowerMaterialFallback();
    const result = buildLegTrusses(mats, true);
    const box = new THREE.Box3().setFromObject(result);
    expect(box.min.y).toBeLessThan(5);
    expect(box.max.y).toBeGreaterThan(50);
  });

  it('all meshes have valid geometry', () => {
    const mats = createTowerMaterialFallback();
    const result = buildLegTrusses(mats, true);
    result.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        expect(child.geometry).toBeDefined();
        expect(child.geometry.attributes.position).toBeDefined();
      }
    });
  });
});
