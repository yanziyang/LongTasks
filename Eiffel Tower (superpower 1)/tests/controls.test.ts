// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createControls } from '../src/scene/Controls';

describe('createControls', () => {
  it('returns an OrbitControls with damping enabled', () => {
    const camera = new THREE.PerspectiveCamera();
    const el = document.createElement('div');
    const controls = createControls(camera, el);
    expect(controls.enableDamping).toBe(true);
    expect(controls.minDistance).toBeGreaterThan(0);
    expect(controls.maxDistance).toBeGreaterThan(controls.minDistance);
  });
});
