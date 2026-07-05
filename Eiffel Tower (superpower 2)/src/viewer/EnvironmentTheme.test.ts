import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import { applyTheme } from './EnvironmentTheme';

function createMockRenderer() {
  return {
    setClearColor: vi.fn(),
    getClearColor: vi.fn((target: THREE.Color) => target),
  } as unknown as THREE.WebGLRenderer;
}

describe('EnvironmentTheme', () => {
  it('applies day theme background', () => {
    const scene = new THREE.Scene();
    const renderer = createMockRenderer();
    applyTheme(scene, renderer, 'day');
    expect(scene.background).toBeInstanceOf(THREE.Color);
    expect((scene.background as THREE.Color).getHexString()).toBe('87ceeb');
  });

  it('applies night theme background', () => {
    const scene = new THREE.Scene();
    const renderer = createMockRenderer();
    applyTheme(scene, renderer, 'night');
    expect(scene.background).toBeInstanceOf(THREE.Color);
    expect((scene.background as THREE.Color).getHexString()).toBe('0a1525');
  });

  it('sets clear color for day theme', () => {
    const scene = new THREE.Scene();
    const renderer = createMockRenderer();
    applyTheme(scene, renderer, 'day');
    expect(renderer.setClearColor).toHaveBeenCalledWith(0x87ceeb);
  });

  it('sets clear color for night theme', () => {
    const scene = new THREE.Scene();
    const renderer = createMockRenderer();
    applyTheme(scene, renderer, 'night');
    expect(renderer.setClearColor).toHaveBeenCalledWith(0x0a1525);
  });
});
