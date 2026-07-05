import * as THREE from 'three';

export const LatticePattern = {
  horizontalPoints(start: THREE.Vector3, end: THREE.Vector3, count: number): THREE.Vector3[] {
    if (!Number.isFinite(count) || count < 1) {
      throw new Error(`horizontalPoints: count must be a positive integer, got ${count}`);
    }
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1);
      points.push(new THREE.Vector3().lerpVectors(start, end, t));
    }
    return points;
  },

  diagonalPoints(
    bottomLeft: THREE.Vector3,
    topRight: THREE.Vector3,
    rows: number,
    cols: number,
  ): { start: THREE.Vector3; end: THREE.Vector3 }[] {
    if (!Number.isFinite(rows) || rows < 1) {
      throw new Error(`diagonalPoints: rows must be a positive integer, got ${rows}`);
    }
    if (!Number.isFinite(cols) || cols < 1) {
      throw new Error(`diagonalPoints: cols must be a positive integer, got ${cols}`);
    }
    if (topRight.x < bottomLeft.x) {
      throw new Error(
        `diagonalPoints: topRight.x (${topRight.x}) must be >= bottomLeft.x (${bottomLeft.x})`,
      );
    }
    if (topRight.y < bottomLeft.y) {
      throw new Error(
        `diagonalPoints: topRight.y (${topRight.y}) must be >= bottomLeft.y (${bottomLeft.y})`,
      );
    }
    const segments: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    const width = topRight.x - bottomLeft.x;
    const height = topRight.y - bottomLeft.y;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x0 = bottomLeft.x + (c / cols) * width;
        const y0 = bottomLeft.y + (r / rows) * height;
        const x1 = bottomLeft.x + ((c + 1) / cols) * width;
        const y1 = bottomLeft.y + ((r + 1) / rows) * height;

        const start = new THREE.Vector3(x0, y0, bottomLeft.z);
        const end = new THREE.Vector3(x1, y1, bottomLeft.z);
        segments.push({ start, end });
      }
    }
    return segments;
  },
};
