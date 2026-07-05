import { describe, it, expect } from 'vitest';
import { buildArches } from './ArchBuilder';

describe('ArchBuilder', () => {
  it('returns a group with children', () => {
    const arches = buildArches();
    expect(arches.children.length).toBeGreaterThan(0);
  });
});
