import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createTower, setTowerNight } from '../src/tower/geometry';
import { dayMaterial, nightMaterial } from '../src/tower/materials';

describe('createTower (edge beams)', () => {
  it('returns a Group', () => {
    expect(createTower()).toBeInstanceOf(THREE.Group);
  });

  it('contains the 4 edge beams plus lattice members', () => {
    const g = createTower();
    const meshes = g.children.filter((c) => c instanceof THREE.Mesh);
    expect(meshes.length).toBeGreaterThan(50);
  });

  it('is scaled by the scene scale', () => {
    const g = createTower();
    expect(g.scale.x).toBeCloseTo(0.01, 5);
  });
});

describe('setTowerNight', () => {
  it('swaps structural mesh materials to night and back', () => {
    const g = createTower();
    setTowerNight(g, true);
    const mats = g.children
      .filter((c) => (c as any).material === nightMaterial);
    expect(mats.length).toBeGreaterThan(0);
    setTowerNight(g, false);
    const dayMats = g.children.filter((c) => (c as any).material === dayMaterial);
    expect(dayMats.length).toBeGreaterThan(0);
  });
});
