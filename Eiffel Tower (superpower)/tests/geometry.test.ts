import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createTower } from '../src/tower/geometry';

describe('createTower (edge beams)', () => {
  it('returns a Group', () => {
    expect(createTower()).toBeInstanceOf(THREE.Group);
  });

  it('contains exactly 4 edge-beam meshes at this stage', () => {
    const g = createTower();
    const meshes = g.children.filter((c) => c instanceof THREE.Mesh);
    expect(meshes.length).toBe(4);
  });

  it('is scaled by the scene scale', () => {
    const g = createTower();
    expect(g.scale.x).toBeCloseTo(0.01, 5);
  });
});
