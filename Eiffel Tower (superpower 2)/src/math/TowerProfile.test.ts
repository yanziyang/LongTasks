import { describe, it, expect } from 'vitest';
import { TowerProfile } from './TowerProfile';

describe('TowerProfile', () => {
  it('returns base width at height 0', () => {
    expect(TowerProfile.getWidthAtHeight(0)).toBeCloseTo(125, 1);
  });

  it('returns top width at max height', () => {
    expect(TowerProfile.getWidthAtHeight(330)).toBeCloseTo(0, 1);
  });

  it('returns a smaller width at mid height', () => {
    const mid = TowerProfile.getWidthAtHeight(165);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(125);
  });
});
