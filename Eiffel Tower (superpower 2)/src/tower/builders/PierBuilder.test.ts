import { describe, it, expect } from 'vitest';
import { buildPier } from './PierBuilder';

describe('PierBuilder', () => {
  it('returns a non-empty group', () => {
    const pier = buildPier();
    expect(pier.children.length).toBeGreaterThan(0);
  });
});
