import * as THREE from 'three';
import { profile } from '../profile';
import {
  STAIRCASE_INNER_OFFSET,
  STAIRCASE_TURNS,
  STAIRCASE_TUBE_RADIUS,
  PLATFORM_HEIGHTS,
} from '../../constants';

const CYLINDER_GEO = new THREE.CylinderGeometry(1, 1, 1, 6);

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

function outerRailPoint(angle: number, h: number): THREE.Vector3 {
  const w = profile(h);
  const offset = STAIRCASE_INNER_OFFSET + 1.5;
  const r = w - offset;
  const x = Math.cos(angle) * r;
  const z = Math.sin(angle) * r;
  return new THREE.Vector3(x, h, z);
}

function innerRailPoint(angle: number, h: number): THREE.Vector3 {
  const w = profile(h);
  const offset = STAIRCASE_INNER_OFFSET;
  const r = w - offset;
  const x = Math.cos(angle) * r;
  const z = Math.sin(angle) * r;
  return new THREE.Vector3(x, h, z);
}

export function buildSpiralStaircase(
  materials: THREE.Material[] | THREE.Material,
  fallback: boolean,
): THREE.Group {
  const group = new THREE.Group();
  const mat = fallback ? (materials as THREE.Material[])[0] : (materials as THREE.Material);

  const hStart = PLATFORM_HEIGHTS[1];
  const hEnd = PLATFORM_HEIGHTS[2];
  const totalHeight = hEnd - hStart;
  const totalAngle = STAIRCASE_TURNS * Math.PI * 2;
  const segmentCount = STAIRCASE_TURNS * 32;

  const innerPoints: THREE.Vector3[] = [];
  const outerPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= segmentCount; i++) {
    const t = i / segmentCount;
    const h = hStart + t * totalHeight;
    const angle = t * totalAngle;
    innerPoints.push(innerRailPoint(angle, h));
    outerPoints.push(outerRailPoint(angle, h));
  }

  const innerCurve = new THREE.CatmullRomCurve3(innerPoints);
  const outerCurve = new THREE.CatmullRomCurve3(outerPoints);

  const innerTube = new THREE.TubeGeometry(innerCurve, segmentCount, STAIRCASE_TUBE_RADIUS, 6, false);
  const outerTube = new THREE.TubeGeometry(outerCurve, segmentCount, STAIRCASE_TUBE_RADIUS, 6, false);
  group.add(new THREE.Mesh(innerTube, mat));
  group.add(new THREE.Mesh(outerTube, mat));

  const balusterCount = STAIRCASE_TURNS * 16;
  for (let i = 0; i <= balusterCount; i++) {
    const t = i / balusterCount;
    const h = hStart + t * totalHeight;
    const angle = t * totalAngle;
    const inner = innerRailPoint(angle, h);
    const outer = outerRailPoint(angle, h);
    const baluster = beamBetween(inner, outer, mat, STAIRCASE_TUBE_RADIUS * 0.6);
    if (baluster) group.add(baluster);
  }

  return group;
}
