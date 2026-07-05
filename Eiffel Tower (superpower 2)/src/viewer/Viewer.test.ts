import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';

vi.mock('three', async () => {
  const actual = await vi.importActual<typeof THREE>('three');
  return {
    ...actual,
    WebGLRenderer: vi.fn().mockImplementation(() => {
      const canvas = document.createElement('canvas');
      return {
        domElement: canvas,
        setPixelRatio: vi.fn(),
        setSize: vi.fn(),
        setClearColor: vi.fn(),
        getClearColor: vi.fn((target: THREE.Color) => target),
        shadowMap: { enabled: false, type: 0 },
        dispose: vi.fn(),
        render: vi.fn(),
      };
    }),
  };
});

import { Viewer } from './Viewer';

describe('Viewer', () => {
  it('creates a canvas inside the container', () => {
    const container = document.createElement('div');
    const viewer = new Viewer(container);
    expect(container.querySelector('canvas')).not.toBeNull();
    viewer.dispose();
  });
});
