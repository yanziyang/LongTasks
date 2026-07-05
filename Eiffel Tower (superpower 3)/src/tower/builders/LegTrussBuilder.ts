import * as THREE from 'three';
import { profile } from '../profile';
import {
  HEIGHT_TOP,
  LEG_TRUSS_WIDTH_BASE,
  LEG_TRUSS_WIDTH_TOP,
  LEG_TRUSS_BAY_HEIGHT,
  LEG_SECTION_HEIGHT,
} from '../../constants';

const CHORD_RADIUS = 0.5;
const STRUT_RADIUS = 0.25;
const BRACE_RADIUS = 0.2;
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

function legCenterAtHeight(corner: number, h: number): THREE.Vector3 {
  const w = profile(Math.min(h, LEG_SECTION_HEIGHT));
  const sx = corner === 0 || corner === 3 ? -w : w;
  const sz = corner === 0 || corner === 1 ? -w : w;
  return new THREE.Vector3(sx, h, sz);
}

function legTrussWidth(h: number): number {
  const t = Math.min(h / LEG_SECTION_HEIGHT, 1);
  return LEG_TRUSS_WIDTH_BASE + (LEG_TRUSS_WIDTH_TOP - LEG_TRUSS_WIDTH_BASE) * t;
}

function chordOffset(corner: number, chordIndex: number, halfWidth: number): { dx: number; dz: number } {
  const cornerSigns = [
    { x: -1, z: -1 },
    { x: 1, z: -1 },
    { x: 1, z: 1 },
    { x: -1, z: 1 },
  ];
  const sign = cornerSigns[corner];
  const chordSigns = [
    { dx: -1, dz: -1 },
    { dx: 1, dz: -1 },
    { dx: 1, dz: 1 },
    { dx: -1, dz: 1 },
  ];
  const cs = chordSigns[chordIndex];
  return { dx: sign.x * cs.dx * halfWidth, dz: sign.z * cs.dz * halfWidth };
}

function chordPoint(corner: number, chordIndex: number, h: number): THREE.Vector3 {
  const center = legCenterAtHeight(corner, h);
  const hw = legTrussWidth(h) / 2;
  const { dx, dz } = chordOffset(corner, chordIndex, hw);
  return new THREE.Vector3(center.x + dx, h, center.z + dz);
}

function buildSingleLeg(corner: number, mat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const bayCount = Math.floor(LEG_SECTION_HEIGHT / LEG_TRUSS_BAY_HEIGHT);

  const ringHeights: number[] = [];
  for (let i = 0; i <= bayCount; i++) {
    ringHeights.push(i * LEG_TRUSS_BAY_HEIGHT);
  }

  const chordCurves: THREE.Vector3[][] = [[], [], [], []];
  for (let i = 0; i <= bayCount; i++) {
    const h = ringHeights[i];
    for (let c = 0; c < 4; c++) {
      chordCurves[c].push(chordPoint(corner, c, h));
    }
  }

  for (let c = 0; c < 4; c++) {
    const curve = new THREE.CatmullRomCurve3(chordCurves[c]);
    const geo = new THREE.TubeGeometry(curve, bayCount * 4, CHORD_RADIUS, 6, false);
    group.add(new THREE.Mesh(geo, mat));
  }

  for (let bay = 0; bay < bayCount; bay++) {
    const h0 = ringHeights[bay];
    const h1 = ringHeights[bay + 1];

    for (const h of [h0, h1]) {
      for (let c = 0; c < 4; c++) {
        const next = (c + 1) % 4;
        const p0 = chordPoint(corner, c, h);
        const p1 = chordPoint(corner, next, h);
        const strut = beamBetween(p0, p1, mat, STRUT_RADIUS);
        if (strut) group.add(strut);
      }
    }

    const midH = (h0 + h1) / 2;
    for (let c = 0; c < 4; c++) {
      const next = (c + 1) % 4;
      const p0 = chordPoint(corner, c, midH);
      const p1 = chordPoint(corner, next, midH);
      const strut = beamBetween(p0, p1, mat, STRUT_RADIUS);
      if (strut) group.add(strut);
    }

    for (let c = 0; c < 4; c++) {
      const next = (c + 1) % 4;
      const botA = chordPoint(corner, c, h0);
      const botB = chordPoint(corner, next, h0);
      const topA = chordPoint(corner, c, h1);
      const topB = chordPoint(corner, next, h1);
      const d1 = beamBetween(botA, topB, mat, BRACE_RADIUS);
      const d2 = beamBetween(botB, topA, mat, BRACE_RADIUS);
      if (d1) group.add(d1);
      if (d2) group.add(d2);
    }
  }

  return group;
}

export function buildLegTrusses(materials: THREE.Material[] | THREE.Material, fallback: boolean): THREE.Group {
  const group = new THREE.Group();
  if (!materials) return group;

  const mat = fallback
    ? (materials as THREE.Material[])[0]
    : (materials as THREE.Material);

  for (let corner = 0; corner < 4; corner++) {
    const leg = buildSingleLeg(corner, mat);
    leg.name = `leg-${corner}`;
    group.add(leg);
  }

  group.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry && child.geometry.attributes.position) {
      const positions = child.geometry.attributes.position;
      const heightRatios = new Float32Array(positions.count);
      const vertex = new THREE.Vector3();
      const matrix = child.matrixWorld;
      for (let i = 0; i < positions.count; i++) {
        vertex.set(positions.getX(i), positions.getY(i), positions.getZ(i));
        vertex.applyMatrix4(matrix);
        heightRatios[i] = vertex.y / HEIGHT_TOP;
      }
      child.geometry.setAttribute('heightRatio', new THREE.BufferAttribute(heightRatios, 1));
    }
  });

  return group;
}
