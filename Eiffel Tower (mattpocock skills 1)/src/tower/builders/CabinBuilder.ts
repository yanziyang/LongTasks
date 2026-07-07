import * as THREE from 'three';
import { profile } from '../profile';
import { PLATFORM_HEIGHTS } from '../../constants';

export function buildCabin(materials: THREE.Material[] | THREE.Material, fallback: boolean): THREE.Group {
  const group = new THREE.Group();
  const mat = fallback ? (materials as THREE.Material[])[0] : (materials as THREE.Material);
  const h = PLATFORM_HEIGHTS[2];
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

  return group;
}
