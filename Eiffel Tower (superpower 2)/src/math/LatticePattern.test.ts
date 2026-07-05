import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { LatticePattern } from './LatticePattern';

describe('LatticePattern', () => {
  it('generates requested number of horizontal points', () => {
    const start = new THREE.Vector3(0, 0, 0);
    const end = new THREE.Vector3(10, 0, 0);
    const points = LatticePattern.horizontalPoints(start, end, 5);
    expect(points).toHaveLength(5);
    expect(points[0].x).toBeCloseTo(0);
    expect(points[4].x).toBeCloseTo(10);
  });
});
