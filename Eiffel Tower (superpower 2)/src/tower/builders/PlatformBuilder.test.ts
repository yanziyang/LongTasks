import { describe, it, expect } from 'vitest';
import { buildPlatforms } from './PlatformBuilder';

describe('PlatformBuilder', () => {
  it('returns a group with three platform meshes', () => {
    const platforms = buildPlatforms();
    const meshes = platforms.children.filter((c) => c.type === 'Mesh');
    expect(meshes.length).toBeGreaterThanOrEqual(3);
  });
});
