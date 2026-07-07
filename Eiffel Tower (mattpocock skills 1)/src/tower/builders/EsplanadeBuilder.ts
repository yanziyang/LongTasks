import * as THREE from 'three';
import { profile } from '../profile';
import {
  PIER_HEIGHT,
  PIER_BASE_HALF,
  PIER_TOP_HALF,
  ESPLANADE_HEIGHT_OFFSET,
} from '../../constants';

function pierPosition(corner: number): { x: number; z: number } {
  const w0 = profile(0);
  const sx = corner === 0 || corner === 3 ? -1 : 1;
  const sz = corner === 0 || corner === 1 ? -1 : 1;
  return { x: sx * (w0 + PIER_BASE_HALF * 0.3), z: sz * (w0 + PIER_BASE_HALF * 0.3) };
}

function buildSinglePier(corner: number, mat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const { x, z } = pierPosition(corner);
  const segments = 6;

  for (let i = 0; i < segments; i++) {
    const tBot = i / segments;
    const tTop = (i + 1) / segments;
    const yBot = tBot * PIER_HEIGHT;
    const yTop = tTop * PIER_HEIGHT;
    const halfBot = PIER_BASE_HALF + (PIER_TOP_HALF - PIER_BASE_HALF) * tBot;
    const halfTop = PIER_BASE_HALF + (PIER_TOP_HALF - PIER_BASE_HALF) * tTop;
    const avgHalf = (halfBot + halfTop) / 2;
    const blockHeight = yTop - yBot;

    const geo = new THREE.BoxGeometry(avgHalf * 2, blockHeight, avgHalf * 2);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, yBot + blockHeight / 2, z);
    group.add(mesh);
  }

  return group;
}

export function buildEsplanade(mat: THREE.Material): THREE.Group {
  const group = new THREE.Group();

  for (let corner = 0; corner < 4; corner++) {
    const pier = buildSinglePier(corner, mat);
    pier.name = `pier-${corner}`;
    group.add(pier);
  }

  const tieHeight = PIER_HEIGHT + ESPLANADE_HEIGHT_OFFSET;
  const corners = [0, 1, 2, 3, 0];
  const tieMat = mat;

  for (let i = 0; i < 4; i++) {
    const a = pierPosition(corners[i]);
    const b = pierPosition(corners[i + 1]);
    const start = new THREE.Vector3(a.x, tieHeight, a.z);
    const end = new THREE.Vector3(b.x, tieHeight, b.z);
    const dir = new THREE.Vector3().subVectors(end, start);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

    const tieGeo = new THREE.BoxGeometry(len, 1.0, 3.0);
    const tie = new THREE.Mesh(tieGeo, tieMat);
    tie.position.copy(mid);
    tie.lookAt(end);
    group.add(tie);
  }

  return group;
}
