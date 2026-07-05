import { describe, it, expect } from 'vitest';
import { createCamera, resetCamera } from './CameraRig';

describe('CameraRig', () => {
  it('creates a camera at the initial position', () => {
    const camera = createCamera(1.5);
    expect(camera.position.x).toBeCloseTo(250);
    expect(camera.position.y).toBeCloseTo(120);
    expect(camera.position.z).toBeCloseTo(250);
  });
});
