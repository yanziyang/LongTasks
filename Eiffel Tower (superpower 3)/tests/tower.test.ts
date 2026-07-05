import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { buildTower } from '../src/tower/Tower';
import { SCENE_SCALE } from '../src/constants';

describe('buildTower', () => {
  it('returns a TowerBuildResult with a Group', () => {
    const result = buildTower();
    expect(result.group).toBeInstanceOf(THREE.Group);
  });

  it('contains meshes from all six builders', () => {
    const result = buildTower();
    let meshCount = 0;
    result.group.traverse((child) => {
      if (child instanceof THREE.Mesh) meshCount++;
    });
    expect(meshCount).toBeGreaterThan(100);
  });

  it('has material defined', () => {
    const result = buildTower();
    expect(result.material).toBeDefined();
  });

  it('has isFallback as a boolean', () => {
    const result = buildTower();
    expect(typeof result.isFallback).toBe('boolean');
  });

  it('has non-zero bounding box', () => {
    const result = buildTower();
    const box = new THREE.Box3().setFromObject(result.group);
    expect(box.isEmpty()).toBe(false);
  });

  it('applies SCENE_SCALE', () => {
    const result = buildTower();
    expect(result.group.scale.x).toBe(SCENE_SCALE);
    expect(result.group.scale.y).toBe(SCENE_SCALE);
    expect(result.group.scale.z).toBe(SCENE_SCALE);
  });
});
