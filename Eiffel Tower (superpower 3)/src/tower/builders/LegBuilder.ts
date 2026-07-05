import * as THREE from 'three';
import { profile } from '../profile';
import { HEIGHT_TOP, RING_COUNT } from '../../constants';

const PIER_RADIUS = 1.2;

function cornerPoints(corner: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const density = RING_COUNT;
  for (let i = 0; i <= density; i++) {
    const h = (HEIGHT_TOP * i) / density;
    const w = profile(h);
    const sx = corner === 0 || corner === 3 ? -w : w;
    const sz = corner === 0 || corner === 1 ? -w : w;
    pts.push(new THREE.Vector3(sx, h, sz));
  }
  return pts;
}

export function buildLegs(materials: THREE.Material[] | THREE.Material, fallback: boolean): THREE.Group {
  const group = new THREE.Group();

  for (let c = 0; c < 4; c++) {
    const pts = cornerPoints(c);
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, Math.floor(RING_COUNT / 2), PIER_RADIUS, 8, false);

    const positions = geo.attributes.position;
    const heightRatios = new Float32Array(positions.count);
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);
      heightRatios[i] = y / HEIGHT_TOP;
    }
    geo.setAttribute('heightRatio', new THREE.BufferAttribute(heightRatios, 1));

    const mat = fallback ? materials : (materials as THREE.Material);
    group.add(new THREE.Mesh(geo, mat));
  }

  return group;
}
