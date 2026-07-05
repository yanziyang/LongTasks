import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createOrbitControls } from './OrbitControlsSetup';

describe('OrbitControlsSetup', () => {
  it('creates controls with damping enabled', () => {
    const camera = new THREE.PerspectiveCamera();
    const div = document.createElement('div');
    const controls = createOrbitControls(camera, div);
    expect(controls.enableDamping).toBe(true);
    expect(controls.dampingFactor).toBe(0.05);
  });
});
