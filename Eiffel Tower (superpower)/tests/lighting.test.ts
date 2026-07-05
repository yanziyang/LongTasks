import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { Lighting } from '../src/scene/Lighting';

describe('Lighting', () => {
  it('starts in day mode', () => {
    const scene = new THREE.Scene();
    const l = new Lighting(scene);
    expect(l.isNight).toBe(false);
  });

  it('can switch to night and back', () => {
    const scene = new THREE.Scene();
    const l = new Lighting(scene);
    l.setNight();
    expect(l.isNight).toBe(true);
    l.setDay();
    expect(l.isNight).toBe(false);
  });

  it('does not throw on update', () => {
    const scene = new THREE.Scene();
    const l = new Lighting(scene);
    expect(() => l.update(0)).not.toThrow();
    expect(() => l.update(70_000)).not.toThrow();
  });
});
