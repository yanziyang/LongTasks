import * as THREE from 'three';

export const TowerProfile = {
  BASE_WIDTH: 125,
  TOP_WIDTH: 0,
  TOTAL_HEIGHT: 330,

  getWidthAtHeight(height: number): number {
    const t = Math.max(0, Math.min(1, height / this.TOTAL_HEIGHT));
    return this.BASE_WIDTH * (1 - t ** 1.6);
  },

  getPierCenter(height: number): THREE.Vector3 {
    const half = this.getWidthAtHeight(height) / 2;
    return new THREE.Vector3(half, height, half);
  },
};
