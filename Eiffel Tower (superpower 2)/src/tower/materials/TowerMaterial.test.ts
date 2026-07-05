import { describe, it, expect } from 'vitest';
import { createIronMaterial } from './TowerMaterial';

describe('TowerMaterial', () => {
  it('returns a MeshStandardMaterial with expected color', () => {
    const mat = createIronMaterial();
    expect(mat.type).toBe('MeshStandardMaterial');
    expect(mat.color.getHexString()).toBe('6e5c4b');
    expect(mat.roughness).toBe(0.7);
    expect(mat.metalness).toBe(0.4);
  });
});
