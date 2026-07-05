import * as THREE from 'three';
import { profile } from '../profile';
import { PLATFORM_HEIGHTS } from '../../constants';

const DECK_THICKNESS = 1.5;
const RAIL_THICKNESS = 0.3;
const RAIL_HEIGHT = 2.5;

function buildPlatformRing(h: number, material: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const w = profile(h);

  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(2 * w, DECK_THICKNESS, 2 * w),
    material,
  );
  deck.position.y = h;
  group.add(deck);

  const railTop = h + RAIL_HEIGHT;
  const edges = [
    { pos: new THREE.Vector3(0, railTop, -w), size: new THREE.Vector3(2 * w, RAIL_THICKNESS, RAIL_THICKNESS) },
    { pos: new THREE.Vector3(0, railTop, w), size: new THREE.Vector3(2 * w, RAIL_THICKNESS, RAIL_THICKNESS) },
    { pos: new THREE.Vector3(-w, railTop, 0), size: new THREE.Vector3(RAIL_THICKNESS, RAIL_THICKNESS, 2 * w) },
    { pos: new THREE.Vector3(w, railTop, 0), size: new THREE.Vector3(RAIL_THICKNESS, RAIL_THICKNESS, 2 * w) },
  ];

  const posts: THREE.Vector3[] = [
    new THREE.Vector3(-w, h + RAIL_HEIGHT / 2, -w),
    new THREE.Vector3(w, h + RAIL_HEIGHT / 2, -w),
    new THREE.Vector3(w, h + RAIL_HEIGHT / 2, w),
    new THREE.Vector3(-w, h + RAIL_HEIGHT / 2, w),
    new THREE.Vector3(0, h + RAIL_HEIGHT / 2, -w),
    new THREE.Vector3(0, h + RAIL_HEIGHT / 2, w),
    new THREE.Vector3(-w, h + RAIL_HEIGHT / 2, 0),
    new THREE.Vector3(w, h + RAIL_HEIGHT / 2, 0),
  ];

  for (const pos of posts) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(RAIL_THICKNESS * 1.5, RAIL_THICKNESS * 1.5, RAIL_HEIGHT, 6),
      material,
    );
    post.position.copy(pos);
    group.add(post);
  }

  for (const { pos, size } of edges) {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(size.x, size.y, size.z),
      material,
    );
    rail.position.copy(pos);
    group.add(rail);
  }

  return group;
}

export function buildPlatforms(materials: THREE.Material[] | THREE.Material, fallback: boolean): THREE.Group {
  const group = new THREE.Group();

  for (const h of PLATFORM_HEIGHTS) {
    const mat = fallback ? (materials as THREE.Material[])[0] : (materials as THREE.Material);
    group.add(buildPlatformRing(h, mat));
  }

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
