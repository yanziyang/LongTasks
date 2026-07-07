import * as THREE from 'three';
import {
  SEINE_Y,
  CHAMP_DE_MARS_Y,
  TROCADERO_Y,
  GROUND_TILE_SIZE,
} from '../../constants';
import {
  riverMaterial,
  grassMaterial,
  trocaderoMaterial,
} from '../materials';

function buildSlopedPlane(
  yA: number,
  yB: number,
  zA: number,
  zB: number,
  halfSize: number,
  mat: THREE.Material,
): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(halfSize * 2, Math.abs(zB - zA));
  const mesh = new THREE.Mesh(geo, mat);
  const midZ = (zA + zB) / 2;
  const midY = (yA + yB) / 2;
  mesh.position.set(0, midY, midZ);
  mesh.rotation.x = -Math.PI / 2 + Math.atan2(yB - yA, zB - zA);
  mesh.receiveShadow = true;
  return mesh;
}

export function buildGroundPlane(): THREE.Group {
  const group = new THREE.Group();
  const half = GROUND_TILE_SIZE / 2;

  const riverZ0 = -half;
  const riverZ1 = 0;
  const riverY = SEINE_Y;
  const riverGeo = new THREE.PlaneGeometry(2 * half, Math.abs(riverZ1 - riverZ0));
  const river = new THREE.Mesh(riverGeo, riverMaterial);
  river.position.set(0, riverY, (riverZ0 + riverZ1) / 2);
  river.rotation.x = -Math.PI / 2;
  river.receiveShadow = true;
  group.add(river);

  const champZ0 = 0;
  const champZ1 = 80;
  const champGeo = new THREE.PlaneGeometry(2 * half, champZ1 - champZ0);
  const champ = new THREE.Mesh(champGeo, grassMaterial);
  champ.position.set(0, CHAMP_DE_MARS_Y, (champZ0 + champZ1) / 2);
  champ.rotation.x = -Math.PI / 2;
  champ.receiveShadow = true;
  group.add(champ);

  const trocZ0 = champZ1;
  const trocZ1 = half;
  const slope = buildSlopedPlane(CHAMP_DE_MARS_Y, TROCADERO_Y, trocZ0, trocZ1, half, trocaderoMaterial);
  group.add(slope);

  return group;
}
