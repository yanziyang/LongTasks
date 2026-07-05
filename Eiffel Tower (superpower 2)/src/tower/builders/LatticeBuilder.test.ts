import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { buildLattice } from './LatticeBuilder';

describe('LatticeBuilder', () => {
  it('creates an InstancedMesh with one instance per segment', () => {
    const segments = [
      { start: new THREE.Vector3(0, 0, 0), end: new THREE.Vector3(1, 1, 0) },
      { start: new THREE.Vector3(0, 0, 0), end: new THREE.Vector3(1, 0, 0) },
    ];
    const mesh = buildLattice(segments, 0.5);
    expect(mesh).toBeInstanceOf(THREE.InstancedMesh);
    expect(mesh.count).toBe(2);
  });
});
