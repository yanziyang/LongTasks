import * as THREE from 'three';
import { HEIGHT_TOP, TOWER_COLOR_LOWER, TOWER_COLOR_MIDDLE, TOWER_COLOR_UPPER } from '../constants';

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function paintColor(heightRatio: number): THREE.Color {
  const t = smoothstep(0, 1, heightRatio);
  const color = new THREE.Color();
  color.copy(TOWER_COLOR_LOWER).lerp(TOWER_COLOR_MIDDLE, smoothstep(0, 0.45, t));
  color.lerp(TOWER_COLOR_UPPER, smoothstep(0.45, 1, t));
  return color;
}

export function applyVertexColors(group: THREE.Group): void {
  group.updateMatrixWorld();

  group.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    if (!child.geometry || !child.geometry.attributes.position) return;

    const positions = child.geometry.attributes.position;
    const colors = new Float32Array(positions.count * 3);
    const vertex = new THREE.Vector3();
    const matrix = child.matrixWorld;

    for (let i = 0; i < positions.count; i++) {
      vertex.set(positions.getX(i), positions.getY(i), positions.getZ(i));
      vertex.applyMatrix4(matrix);
      const hr = Math.max(0, Math.min(1, vertex.y / HEIGHT_TOP));
      const c = paintColor(hr);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    child.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  });
}
