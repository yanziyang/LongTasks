import * as THREE from 'three';
import { profile } from '../profile';
import {
  HEIGHT_TOP,
  LEG_SECTION_HEIGHT,
  BODY_BAY_HEIGHT,
  PLATFORM_HEIGHTS,
  ARCH_MAX_HEIGHT,
  ARCH_SEGMENTS,
  ARCH_RING_SPACING,
  LEG_TRUSS_WIDTH_BASE,
  LEG_TRUSS_WIDTH_TOP,
} from '../../constants';

const CHORD_RADIUS = 0.5;
const STRUT_RADIUS = 0.3;
const BRACE_RADIUS = 0.25;
const ARCH_TUBE_RADIUS = 0.35;
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

function cornerPoint(corner: number, h: number): THREE.Vector3 {
  const w = profile(h);
  const sx = corner === 0 || corner === 3 ? -w : w;
  const sz = corner === 0 || corner === 1 ? -w : w;
  return new THREE.Vector3(sx, h, sz);
}

function legInnerChordAtHeight(corner: number, h: number): THREE.Vector3 {
  const center = cornerPoint(corner, h);
  const t = Math.min(h / LEG_SECTION_HEIGHT, 1);
  const legW = LEG_TRUSS_WIDTH_BASE + (LEG_TRUSS_WIDTH_TOP - LEG_TRUSS_WIDTH_BASE) * t;
  const halfLeg = legW / 2;
  const centerSignX = corner === 0 || corner === 3 ? -1 : 1;
  const centerSignZ = corner === 0 || corner === 1 ? -1 : 1;
  return new THREE.Vector3(
    center.x - centerSignX * halfLeg,
    h,
    center.z - centerSignZ * halfLeg,
  );
}

function densityTier(h: number): number {
  if (h < PLATFORM_HEIGHTS[1]) return 0;
  if (h < PLATFORM_HEIGHTS[2]) return 1;
  return 2;
}

function buildCornerChords(mat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const segments = 60;
  for (let c = 0; c < 4; c++) {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const h = LEG_SECTION_HEIGHT + (HEIGHT_TOP - LEG_SECTION_HEIGHT) * (i / segments);
      points.push(cornerPoint(c, h));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const geo = new THREE.TubeGeometry(curve, segments, CHORD_RADIUS, 6, false);
    group.add(new THREE.Mesh(geo, mat));
  }
  return group;
}

function buildBodyLattice(mat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const bayCount = Math.floor((HEIGHT_TOP - LEG_SECTION_HEIGHT) / BODY_BAY_HEIGHT);
  const faces: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0]];

  for (const [a, b] of faces) {
    for (let bay = 0; bay < bayCount; bay++) {
      const h0 = LEG_SECTION_HEIGHT + bay * BODY_BAY_HEIGHT;
      const h1 = LEG_SECTION_HEIGHT + (bay + 1) * BODY_BAY_HEIGHT;
      const tier = densityTier(h0);

      let skip = false;
      if (tier === 1) skip = bay % 2 === 1;
      if (tier === 2) skip = bay % 3 !== 0;
      if (skip) continue;

      const botA = cornerPoint(a, h0);
      const botB = cornerPoint(b, h0);
      const topA = cornerPoint(a, h1);
      const topB = cornerPoint(b, h1);

      if (tier === 0) {
        const d1 = beamBetween(botA, topB, mat, BRACE_RADIUS);
        const d2 = beamBetween(botB, topA, mat, BRACE_RADIUS);
        if (d1) group.add(d1);
        if (d2) group.add(d2);
        const tie1 = beamBetween(botA, botB, mat, STRUT_RADIUS);
        const tie2 = beamBetween(topA, topB, mat, STRUT_RADIUS);
        if (tie1) group.add(tie1);
        if (tie2) group.add(tie2);
        const vertical = beamBetween(
          new THREE.Vector3().lerpVectors(botA, botB, 0.5),
          new THREE.Vector3().lerpVectors(topA, topB, 0.5),
          mat, STRUT_RADIUS,
        );
        if (vertical) group.add(vertical);
        const midH = (h0 + h1) / 2;
        const midA = cornerPoint(a, midH);
        const midB = cornerPoint(b, midH);
        const k1 = beamBetween(midA, topB, mat, BRACE_RADIUS);
        const k2 = beamBetween(midB, topA, mat, BRACE_RADIUS);
        if (k1) group.add(k1);
        if (k2) group.add(k2);
      } else if (tier === 1) {
        const d1 = beamBetween(botA, topB, mat, BRACE_RADIUS);
        const d2 = beamBetween(botB, topA, mat, BRACE_RADIUS);
        if (d1) group.add(d1);
        if (d2) group.add(d2);
        const tie = beamBetween(topA, topB, mat, STRUT_RADIUS);
        if (tie) group.add(tie);
        const vertical = beamBetween(
          new THREE.Vector3().lerpVectors(botA, botB, 0.5),
          new THREE.Vector3().lerpVectors(topA, topB, 0.5),
          mat, STRUT_RADIUS,
        );
        if (vertical) group.add(vertical);
      } else {
        const d1 = beamBetween(botA, topB, mat, BRACE_RADIUS);
        if (d1) group.add(d1);
        const tie = beamBetween(topA, topB, mat, STRUT_RADIUS);
        if (tie) group.add(tie);
      }
    }
  }

  return group;
}

function buildArchPanels(mat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const faces: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0]];

  for (const [a, b] of faces) {
    const start = legInnerChordAtHeight(a, 0);
    const end = legInnerChordAtHeight(b, 0);
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    mid.y = ARCH_MAX_HEIGHT;

    const outwardDir = new THREE.Vector3().crossVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3().subVectors(end, start).normalize(),
    ).normalize();

    for (const offset of [-ARCH_RING_SPACING / 2, ARCH_RING_SPACING / 2]) {
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= ARCH_SEGMENTS; i++) {
        const t = i / ARCH_SEGMENTS;
        const pa = new THREE.Vector3().lerpVectors(start, mid, t);
        const pb = new THREE.Vector3().lerpVectors(mid, end, t);
        const pt = new THREE.Vector3().lerpVectors(pa, pb, t);
        pt.add(outwardDir.clone().multiplyScalar(offset));
        points.push(pt);
      }
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, ARCH_SEGMENTS, ARCH_TUBE_RADIUS, 6, false);
      group.add(new THREE.Mesh(tubeGeo, mat));
    }

    const topTieStart = legInnerChordAtHeight(a, LEG_SECTION_HEIGHT);
    const topTieEnd = legInnerChordAtHeight(b, LEG_SECTION_HEIGHT);
    const topTie = beamBetween(topTieStart, topTieEnd, mat, STRUT_RADIUS);
    if (topTie) group.add(topTie);

    const postCount = 14;
    for (let i = 0; i < postCount; i++) {
      const t = (i + 0.5) / postCount;
      const pa = new THREE.Vector3().lerpVectors(start, mid, t);
      const pb = new THREE.Vector3().lerpVectors(mid, end, t);
      const archPt = new THREE.Vector3().lerpVectors(pa, pb, t);
      const topPt = new THREE.Vector3().lerpVectors(topTieStart, topTieEnd, t);
      topPt.y = LEG_SECTION_HEIGHT;

      const outerArchPt = archPt.clone().add(outwardDir.clone().multiplyScalar(-ARCH_RING_SPACING / 2));
      const post = beamBetween(outerArchPt, topPt, mat, STRUT_RADIUS);
      if (post) group.add(post);

      for (let j = i; j < i + 1 && j < postCount; j++) {
        const t2 = (j + 1.5) / postCount;
        if (t2 > 1) continue;
        const pa2 = new THREE.Vector3().lerpVectors(start, mid, t2);
        const pb2 = new THREE.Vector3().lerpVectors(mid, end, t2);
        const archPt2 = new THREE.Vector3().lerpVectors(pa2, pb2, t2);
        const topPt2 = new THREE.Vector3().lerpVectors(topTieStart, topTieEnd, t2);
        topPt2.y = LEG_SECTION_HEIGHT;

        const outerArchPt2 = archPt2.clone().add(outwardDir.clone().multiplyScalar(-ARCH_RING_SPACING / 2));
        const d1 = beamBetween(outerArchPt, topPt2, mat, BRACE_RADIUS);
        const d2 = beamBetween(topPt, outerArchPt2, mat, BRACE_RADIUS);
        if (d1) group.add(d1);
        if (d2) group.add(d2);
      }

      const innerArchPt = archPt.clone().add(outwardDir.clone().multiplyScalar(ARCH_RING_SPACING / 2));
      const radial = beamBetween(outerArchPt, innerArchPt, mat, STRUT_RADIUS);
      if (radial) group.add(radial);
    }

    for (let i = 0; i < postCount - 1; i++) {
      const t1 = (i + 0.5) / postCount;
      const t2 = (i + 1.5) / postCount;
      const pa1 = new THREE.Vector3().lerpVectors(start, mid, t1);
      const pb1 = new THREE.Vector3().lerpVectors(mid, end, t1);
      const archPt1 = new THREE.Vector3().lerpVectors(pa1, pb1, t1);
      const pa2 = new THREE.Vector3().lerpVectors(start, mid, t2);
      const pb2 = new THREE.Vector3().lerpVectors(mid, end, t2);
      const archPt2 = new THREE.Vector3().lerpVectors(pa2, pb2, t2);

      const inner1 = archPt1.clone().add(outwardDir.clone().multiplyScalar(ARCH_RING_SPACING / 2));
      const inner2 = archPt2.clone().add(outwardDir.clone().multiplyScalar(ARCH_RING_SPACING / 2));
      const d1 = beamBetween(inner1, archPt2.clone().add(outwardDir.clone().multiplyScalar(-ARCH_RING_SPACING / 2)), mat, BRACE_RADIUS);
      const d2 = beamBetween(archPt1.clone().add(outwardDir.clone().multiplyScalar(-ARCH_RING_SPACING / 2)), inner2, mat, BRACE_RADIUS);
      if (d1) group.add(d1);
      if (d2) group.add(d2);
    }
  }

  return group;
}

export function buildInterLegLattice(materials: THREE.Material[] | THREE.Material, fallback: boolean): THREE.Group {
  const group = new THREE.Group();
  if (!materials) return group;

  const mat = fallback
    ? (materials as THREE.Material[])[0]
    : (materials as THREE.Material);

  group.add(buildCornerChords(mat));
  group.add(buildBodyLattice(mat));
  group.add(buildArchPanels(mat));

  return group;
}
