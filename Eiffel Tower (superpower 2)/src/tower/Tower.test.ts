import { describe, it, expect } from 'vitest';
import { buildTower } from './Tower';

describe('Tower', () => {
  it('assembles a tower with children', () => {
    const tower = buildTower();
    expect(tower.children.length).toBeGreaterThan(0);
  });
});
