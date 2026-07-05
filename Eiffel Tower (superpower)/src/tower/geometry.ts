import * as THREE from 'three';
import { profile } from './profile';
import { dayMaterial } from './materials';
import { HEIGHT_TOP, RING_COUNT, SCENE_SCALE } from '../constants';

const PIER_RADIUS = 1.2;

function cornerPoints(corner: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= RING_COUNT; i++) {
    const h = (HEIGHT_TOP * i) / RING_COUNT;
    const w = profile(h);
    const sx = corner === 0 || corner === 3 ? -w : w;
    const sz = corner === 0 || corner === 1 ? -w : w;
    pts.push(new THREE.Vector3(sx, h, sz));
  }
  return pts;
}

export function createTower(): THREE.Group {
  const group = new THREE.Group();

  for (let c = 0; c < 4; c++) {
    const curve = new THREE.CatmullRomCurve3(cornerPoints(c));
    const geo = new THREE.TubeGeometry(curve, RING_COUNT, PIER_RADIUS, 6, false);
    group.add(new THREE.Mesh(geo, dayMaterial));
  }

  group.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });
  group.scale.setScalar(SCENE_SCALE);
  return group;
}
