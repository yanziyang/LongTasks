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

  describe('input validation', () => {
    it('throws on memberSize of 0', () => {
      const segments = [{ start: new THREE.Vector3(), end: new THREE.Vector3(1, 0, 0) }];
      expect(() => buildLattice(segments, 0)).toThrow('memberSize must be a positive number, got 0');
    });

    it('throws on negative memberSize', () => {
      const segments = [{ start: new THREE.Vector3(), end: new THREE.Vector3(1, 0, 0) }];
      expect(() => buildLattice(segments, -1)).toThrow('memberSize must be a positive number, got -1');
    });

    it('throws on NaN memberSize', () => {
      const segments = [{ start: new THREE.Vector3(), end: new THREE.Vector3(1, 0, 0) }];
      expect(() => buildLattice(segments, NaN)).toThrow('memberSize must be a number, got NaN');
    });

    it('throws on undefined memberSize', () => {
      const segments = [{ start: new THREE.Vector3(), end: new THREE.Vector3(1, 0, 0) }];
      expect(() => buildLattice(segments, undefined as any)).toThrow('memberSize must be a number');
    });

    it('throws on segment with non-Vector3 start', () => {
      const segments = [{ start: { x: 0, y: 0, z: 0 } as any, end: new THREE.Vector3(1, 0, 0) }];
      expect(() => buildLattice(segments, 0.5)).toThrow('segment[0].start must be a Vector3 instance');
    });

    it('throws on segment with null start', () => {
      const segments = [{ start: null as any, end: new THREE.Vector3(1, 0, 0) }];
      expect(() => buildLattice(segments, 0.5)).toThrow('segment[0].start must be a Vector3 instance');
    });

    it('throws on segment with non-Vector3 end', () => {
      const segments = [{ start: new THREE.Vector3(), end: null as any }];
      expect(() => buildLattice(segments, 0.5)).toThrow('segment[0].end must be a Vector3 instance');
    });

    it('reports correct index for invalid segment', () => {
      const segments = [
        { start: new THREE.Vector3(), end: new THREE.Vector3(1, 0, 0) },
        { start: null as any, end: new THREE.Vector3(1, 0, 0) },
      ];
      expect(() => buildLattice(segments, 0.5)).toThrow('segment[1].start');
    });
  });
});
