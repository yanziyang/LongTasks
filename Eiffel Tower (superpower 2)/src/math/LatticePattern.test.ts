import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { LatticePattern } from './LatticePattern';

describe('LatticePattern', () => {
  describe('horizontalPoints', () => {
    it('generates requested number of horizontal points', () => {
      const start = new THREE.Vector3(0, 0, 0);
      const end = new THREE.Vector3(10, 0, 0);
      const points = LatticePattern.horizontalPoints(start, end, 5);
      expect(points).toHaveLength(5);
      expect(points[0].x).toBeCloseTo(0);
      expect(points[4].x).toBeCloseTo(10);
    });

    it('returns single point at start when count is 1', () => {
      const start = new THREE.Vector3(2, 3, 4);
      const end = new THREE.Vector3(8, 9, 10);
      const points = LatticePattern.horizontalPoints(start, end, 1);
      expect(points).toHaveLength(1);
      expect(points[0].x).toBeCloseTo(2);
      expect(points[0].y).toBeCloseTo(3);
      expect(points[0].z).toBeCloseTo(4);
    });

    it('throws on count of 0', () => {
      const start = new THREE.Vector3(0, 0, 0);
      const end = new THREE.Vector3(1, 0, 0);
      expect(() => LatticePattern.horizontalPoints(start, end, 0)).toThrow(
        'count must be a positive integer',
      );
    });

    it('throws on negative count', () => {
      const start = new THREE.Vector3(0, 0, 0);
      const end = new THREE.Vector3(1, 0, 0);
      expect(() => LatticePattern.horizontalPoints(start, end, -3)).toThrow(
        'count must be a positive integer',
      );
    });

    it('throws on NaN count', () => {
      const start = new THREE.Vector3(0, 0, 0);
      const end = new THREE.Vector3(1, 0, 0);
      expect(() => LatticePattern.horizontalPoints(start, end, NaN)).toThrow(
        'count must be a positive integer',
      );
    });
  });

  describe('diagonalPoints', () => {
    it('generates correct number of segments for rows x cols', () => {
      const bl = new THREE.Vector3(0, 0, 0);
      const tr = new THREE.Vector3(10, 10, 0);
      const segments = LatticePattern.diagonalPoints(bl, tr, 3, 4);
      expect(segments).toHaveLength(12); // 3 rows * 4 cols
    });

    it('produces correct coordinates for a 2x2 grid', () => {
      const bl = new THREE.Vector3(0, 0, 5);
      const tr = new THREE.Vector3(4, 6, 5);
      const segments = LatticePattern.diagonalPoints(bl, tr, 2, 2);
      expect(segments).toHaveLength(4);

      // Cell (0,0): bottom-left quadrant
      expect(segments[0].start.x).toBeCloseTo(0);
      expect(segments[0].start.y).toBeCloseTo(0);
      expect(segments[0].end.x).toBeCloseTo(2);
      expect(segments[0].end.y).toBeCloseTo(3);

      // Cell (0,1): bottom-right quadrant
      expect(segments[1].start.x).toBeCloseTo(2);
      expect(segments[1].start.y).toBeCloseTo(0);
      expect(segments[1].end.x).toBeCloseTo(4);
      expect(segments[1].end.y).toBeCloseTo(3);

      // Cell (1,0): top-left quadrant
      expect(segments[2].start.x).toBeCloseTo(0);
      expect(segments[2].start.y).toBeCloseTo(3);
      expect(segments[2].end.x).toBeCloseTo(2);
      expect(segments[2].end.y).toBeCloseTo(6);

      // Cell (1,1): top-right quadrant
      expect(segments[3].start.x).toBeCloseTo(2);
      expect(segments[3].start.y).toBeCloseTo(3);
      expect(segments[3].end.x).toBeCloseTo(4);
      expect(segments[3].end.y).toBeCloseTo(6);
    });

    it('preserves z coordinate from bottomLeft', () => {
      const bl = new THREE.Vector3(0, 0, 7);
      const tr = new THREE.Vector3(2, 2, 7);
      const segments = LatticePattern.diagonalPoints(bl, tr, 1, 1);
      expect(segments[0].start.z).toBeCloseTo(7);
      expect(segments[0].end.z).toBeCloseTo(7);
    });

    it('handles rows=1 correctly', () => {
      const bl = new THREE.Vector3(0, 0, 0);
      const tr = new THREE.Vector3(6, 4, 0);
      const segments = LatticePattern.diagonalPoints(bl, tr, 1, 3);
      expect(segments).toHaveLength(3);
      // All segments should have same y range (full height)
      for (const seg of segments) {
        expect(seg.start.y).toBeCloseTo(0);
        expect(seg.end.y).toBeCloseTo(4);
      }
    });

    it('handles cols=1 correctly', () => {
      const bl = new THREE.Vector3(0, 0, 0);
      const tr = new THREE.Vector3(6, 4, 0);
      const segments = LatticePattern.diagonalPoints(bl, tr, 2, 1);
      expect(segments).toHaveLength(2);
      // All segments should have same x range (full width)
      for (const seg of segments) {
        expect(seg.start.x).toBeCloseTo(0);
        expect(seg.end.x).toBeCloseTo(6);
      }
    });

    it('handles 1x1 grid (single segment covers full area)', () => {
      const bl = new THREE.Vector3(1, 2, 0);
      const tr = new THREE.Vector3(5, 8, 0);
      const segments = LatticePattern.diagonalPoints(bl, tr, 1, 1);
      expect(segments).toHaveLength(1);
      expect(segments[0].start.x).toBeCloseTo(1);
      expect(segments[0].start.y).toBeCloseTo(2);
      expect(segments[0].end.x).toBeCloseTo(5);
      expect(segments[0].end.y).toBeCloseTo(8);
    });

    it('throws on rows of 0', () => {
      const bl = new THREE.Vector3(0, 0, 0);
      const tr = new THREE.Vector3(1, 1, 0);
      expect(() => LatticePattern.diagonalPoints(bl, tr, 0, 2)).toThrow(
        'rows must be a positive integer',
      );
    });

    it('throws on negative rows', () => {
      const bl = new THREE.Vector3(0, 0, 0);
      const tr = new THREE.Vector3(1, 1, 0);
      expect(() => LatticePattern.diagonalPoints(bl, tr, -1, 2)).toThrow(
        'rows must be a positive integer',
      );
    });

    it('throws on cols of 0', () => {
      const bl = new THREE.Vector3(0, 0, 0);
      const tr = new THREE.Vector3(1, 1, 0);
      expect(() => LatticePattern.diagonalPoints(bl, tr, 2, 0)).toThrow(
        'cols must be a positive integer',
      );
    });

    it('throws on negative cols', () => {
      const bl = new THREE.Vector3(0, 0, 0);
      const tr = new THREE.Vector3(1, 1, 0);
      expect(() => LatticePattern.diagonalPoints(bl, tr, 2, -5)).toThrow(
        'cols must be a positive integer',
      );
    });

    it('throws on NaN rows', () => {
      const bl = new THREE.Vector3(0, 0, 0);
      const tr = new THREE.Vector3(1, 1, 0);
      expect(() => LatticePattern.diagonalPoints(bl, tr, NaN, 2)).toThrow(
        'rows must be a positive integer',
      );
    });

    it('throws on inverted x bounds', () => {
      const bl = new THREE.Vector3(10, 0, 0);
      const tr = new THREE.Vector3(5, 10, 0);
      expect(() => LatticePattern.diagonalPoints(bl, tr, 2, 2)).toThrow('topRight.x');
    });

    it('throws on inverted y bounds', () => {
      const bl = new THREE.Vector3(0, 10, 0);
      const tr = new THREE.Vector3(10, 5, 0);
      expect(() => LatticePattern.diagonalPoints(bl, tr, 2, 2)).toThrow('topRight.y');
    });

    it('allows zero-width (equal x) bounds', () => {
      const bl = new THREE.Vector3(5, 0, 0);
      const tr = new THREE.Vector3(5, 10, 0);
      const segments = LatticePattern.diagonalPoints(bl, tr, 2, 2);
      expect(segments).toHaveLength(4);
      for (const seg of segments) {
        expect(seg.start.x).toBeCloseTo(5);
        expect(seg.end.x).toBeCloseTo(5);
      }
    });

    it('allows zero-height (equal y) bounds', () => {
      const bl = new THREE.Vector3(0, 5, 0);
      const tr = new THREE.Vector3(10, 5, 0);
      const segments = LatticePattern.diagonalPoints(bl, tr, 2, 2);
      expect(segments).toHaveLength(4);
      for (const seg of segments) {
        expect(seg.start.y).toBeCloseTo(5);
        expect(seg.end.y).toBeCloseTo(5);
      }
    });
  });
});
