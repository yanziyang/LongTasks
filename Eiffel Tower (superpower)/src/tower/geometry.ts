import * as THREE from 'three';
import { profile } from './profile';
import { dayMaterial, nightMaterial, antennaMaterial } from './materials';
import { HEIGHT_TOP, RING_COUNT, SCENE_SCALE, PLATFORM_HEIGHTS, ANTENNA_HEIGHT } from '../constants';

const PIER_RADIUS = 1.2;
const LATTICE_RADIUS = 0.4;

function sectionForHeight(h: number): number {
  if (h < 57) return 0;
  if (h < 115) return 1;
  return 2;
}

function beamBetween(a: THREE.Vector3, b: THREE.Vector3, mat: THREE.Material, radius: number): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const geo = new THREE.CylinderGeometry(radius, radius, len, 6);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return mesh;
}

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

  const rings: THREE.Vector3[][] = [0, 1, 2, 3].map((c) => cornerPoints(c));
  const faces: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
  ];

  for (const [a, b] of faces) {
    for (let i = 0; i < RING_COUNT; i++) {
      const h0 = (HEIGHT_TOP * i) / RING_COUNT;
      const section = sectionForHeight(h0);
      const skip = section === 2 ? i % 2 === 1 : false;
      if (skip) continue;

      const botA = rings[a][i];
      const botB = rings[b][i];
      const topA = rings[a][i + 1];
      const topB = rings[b][i + 1];

      group.add(beamBetween(botA, topB, dayMaterial, LATTICE_RADIUS));
      group.add(beamBetween(botB, topA, dayMaterial, LATTICE_RADIUS));
      group.add(beamBetween(botA, botB, dayMaterial, LATTICE_RADIUS));
    }
  }

  for (const h of PLATFORM_HEIGHTS) {
    const w = profile(h);
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(2 * w, 1.5, 2 * w),
      dayMaterial,
    );
    slab.position.y = h;
    group.add(slab);
  }

  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 1.2, ANTENNA_HEIGHT, 8),
    antennaMaterial,
  );
  antenna.position.y = HEIGHT_TOP + ANTENNA_HEIGHT / 2;
  group.add(antenna);

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

export function setTowerNight(group: THREE.Group, night: boolean): void {
  const mat = night ? nightMaterial : dayMaterial;
  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh && (mesh.material === dayMaterial || mesh.material === nightMaterial)) {
      mesh.material = mat;
    }
  });
}
