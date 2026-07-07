import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { applyTheme } from '../src/viewer/EnvironmentTheme';

function createMockRenderer(): THREE.WebGLRenderer {
  return { setClearColor: () => {} } as unknown as THREE.WebGLRenderer;
}

function createMockScene(): THREE.Scene {
  const scene = new THREE.Scene();
  const hemi = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
  scene.add(hemi);
  const ambient = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambient);
  return scene;
}

describe('applyTheme', () => {
  it('sets day background and light values', () => {
    const scene = createMockScene();
    const renderer = createMockRenderer();
    applyTheme(scene, renderer, 'day');
    const bg = scene.background as THREE.Color;
    expect(bg.getHex()).toBe(0x87ceeb);
  });

  it('sets night background darker', () => {
    const scene = createMockScene();
    const renderer = createMockRenderer();
    applyTheme(scene, renderer, 'night');
    const bg = scene.background as THREE.Color;
    const day = new THREE.Color(0x87ceeb);
    expect(bg.r).toBeLessThan(day.r);
  });

  it('updates hemisphere light for day', () => {
    const scene = createMockScene();
    const renderer = createMockRenderer();
    applyTheme(scene, renderer, 'day');
    const hemi = scene.children.find((c) => c instanceof THREE.HemisphereLight) as THREE.HemisphereLight;
    expect(hemi.color.getHex()).toBe(0x87ceeb);
    expect(hemi.groundColor.getHex()).toBe(0x7a7a7a);
  });

  it('reduces ambient light for night', () => {
    const scene = createMockScene();
    const renderer = createMockRenderer();
    applyTheme(scene, renderer, 'night');
    const ambient = scene.children.find((c) => c instanceof THREE.AmbientLight) as THREE.AmbientLight;
    expect(ambient.intensity).toBeLessThan(0.5);
  });

  it('does not throw when no tower materials', () => {
    const scene = createMockScene();
    const renderer = createMockRenderer();
    expect(() => applyTheme(scene, renderer, 'night')).not.toThrow();
  });

  it('accepts tower materials without throwing', () => {
    const scene = createMockScene();
    const renderer = createMockRenderer();
    const dayMat = new THREE.MeshStandardMaterial();
    const nightMat = new THREE.MeshStandardMaterial();
    expect(() => applyTheme(scene, renderer, 'night', dayMat, nightMat)).not.toThrow();
  });
});
