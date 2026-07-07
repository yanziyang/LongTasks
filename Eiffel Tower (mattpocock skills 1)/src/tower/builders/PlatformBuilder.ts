import * as THREE from 'three';
import { profile } from '../profile';
import {
  PLATFORM_HEIGHTS,
  CROSS_GIRDER_DEPTHS,
  CROSS_GIRDER_GRID_COUNT,
} from '../../constants';

const CYLINDER_GEO = new THREE.CylinderGeometry(1, 1, 1, 6);
const DECK_THICKNESS = 1.5;
const RAIL_THICKNESS = 0.3;
const RAIL_HEIGHT = 2.5;
const GIRDER_CHORD_RADIUS = 0.35;
const GIRDER_BRACE_RADIUS = 0.2;

function beamBetween(a: THREE.Vector3, b: THREE.Vector3, mat: THREE.Material, radius: number): THREE.Mesh | null {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  if (len < 0.01) return null;
  const geo = CYLINDER_GEO.clone();
  geo.scale(radius, len, radius);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return mesh;
}

function buildWarrenGirder(
  start: THREE.Vector3,
  end: THREE.Vector3,
  depth: number,
  mat: THREE.Material,
): THREE.Group {
  const group = new THREE.Group();
  const dir = new THREE.Vector3().subVectors(end, start);
  const length = dir.length();
  const upLocal = new THREE.Vector3(0, -1, 0);
  const panelCount = Math.max(2, Math.floor(length / 2));

  const topPts: THREE.Vector3[] = [];
  const botPts: THREE.Vector3[] = [];
  for (let i = 0; i <= panelCount; i++) {
    const t = i / panelCount;
    const pt = new THREE.Vector3().lerpVectors(start, end, t);
    topPts.push(pt.clone());
    botPts.push(pt.clone().addScaledVector(upLocal, depth));
  }

  const topBeam1 = beamBetween(topPts[0], topPts[panelCount], mat, GIRDER_CHORD_RADIUS);
  const botBeam1 = beamBetween(botPts[0], botPts[panelCount], mat, GIRDER_CHORD_RADIUS);
  if (topBeam1) group.add(topBeam1);
  if (botBeam1) group.add(botBeam1);

  for (let i = 1; i < panelCount; i++) {
    const vert = beamBetween(topPts[i], botPts[i], mat, GIRDER_BRACE_RADIUS);
    if (vert) group.add(vert);
  }

  for (let i = 0; i < panelCount; i++) {
    const diag1 = beamBetween(topPts[i], botPts[i + 1], mat, GIRDER_BRACE_RADIUS);
    const diag2 = beamBetween(botPts[i], topPts[i + 1], mat, GIRDER_BRACE_RADIUS);
    if (diag1) group.add(diag1);
    if (diag2) group.add(diag2);
  }

  return group;
}

function buildPlatformRing(h: number, mat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const w = profile(h);
  const depth = CROSS_GIRDER_DEPTHS[h] ?? 3;

  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(2 * w, DECK_THICKNESS, 2 * w),
    mat,
  );
  deck.position.y = h;
  group.add(deck);

  const gridCount = CROSS_GIRDER_GRID_COUNT;
  const step = (2 * w) / (gridCount + 1);
  const girderY = h - DECK_THICKNESS / 2;

  for (let i = 1; i <= gridCount; i++) {
    const x = -w + i * step;
    const start = new THREE.Vector3(x, girderY, -w);
    const end = new THREE.Vector3(x, girderY, w);
    group.add(buildWarrenGirder(start, end, depth, mat));
  }

  for (let i = 1; i <= gridCount; i++) {
    const z = -w + i * step;
    const start = new THREE.Vector3(-w, girderY, z);
    const end = new THREE.Vector3(w, girderY, z);
    group.add(buildWarrenGirder(start, end, depth, mat));
  }

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
      mat,
    );
    post.position.copy(pos);
    group.add(post);
  }

  for (const { pos, size } of edges) {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(size.x, size.y, size.z),
      mat,
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

  return group;
}
