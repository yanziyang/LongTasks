import * as THREE from 'three';
import { profile } from '../profile';
import { HEIGHT_TOP } from '../../constants';

export function buildCabin(materials: THREE.Material[] | THREE.Material, fallback: boolean): THREE.Group {
  const group = new THREE.Group();
  const mat = fallback ? (materials as THREE.Material[])[0] : (materials as THREE.Material);
  const h = 276;
  const w = profile(h);

  const cabinWidth = w * 0.6;
  const cabinHeight = 20;
  const cabinY = h + cabinHeight / 2;

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(cabinWidth * 2, cabinHeight, cabinWidth * 2),
    mat,
  );
  body.position.y = cabinY;
  group.add(body);

  const topDeck = new THREE.Mesh(
    new THREE.BoxGeometry(cabinWidth * 2.4, 1.0, cabinWidth * 2.4),
    mat,
  );
  topDeck.position.y = h + cabinHeight;
  group.add(topDeck);

  group.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry.attributes.position) {
      const positions = child.geometry.attributes.position;
      const heightRatios = new Float32Array(positions.count);
      const vertex = new THREE.Vector3();
      const matrix = child.matrixWorld;
      for (let i = 0; i < positions.count; i++) {
        vertex.set(positions.getX(i), positions.getY(i), positions.getZ(i));
        vertex.applyMatrix4(matrix);
        heightRatios[i] = vertex.y / 301;
      }
      child.geometry.setAttribute('heightRatio', new THREE.BufferAttribute(heightRatios, 1));
    }
  });

  return group;
}
