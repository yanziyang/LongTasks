import { describe, it, expect } from 'vitest';
import { buildAntenna } from './AntennaBuilder';

describe('AntennaBuilder', () => {
  it('returns a group containing an antenna mesh', () => {
    const antenna = buildAntenna();
    expect(antenna.children.length).toBeGreaterThan(0);
  });
});
