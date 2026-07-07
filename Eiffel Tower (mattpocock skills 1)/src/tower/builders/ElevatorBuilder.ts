import * as THREE from 'three';
import { profile } from '../profile';
import {
  ELEVATOR_SHAFT_HALF,
  ELEVATOR_LEGS,
  ELEVATOR_TOP,
  ELEVATOR_BAY_HEIGHT,
  ELEVATOR_MACHINERY_HEIGHT,
  LEG_SECTION_HEIGHT,
} from '../../constants';

const CHORD_RADIUS = 0.25;
const BRACE_RADIUS = 0.15;
const STRUT_RADIUS = 0.2;
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

function shaftCenter(corner: number, h: number): THREE.Vector3 {
  const w = profile(h);
  const sx = corner === 0 || corner === 3 ? -1 : 1;
  const sz = corner === 0 || corner === 1 ? -1 : 1;
  const innerX = sx * (w - ELEVATOR_SHAFT_HALF);
  const innerZ = sz * (w - ELEVATOR_SHAFT_HALF);
  return new THREE.Vector3(innerX, h, innerZ);
}

function buildSingleShaft(corner: number, mat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const half = ELEVATOR_SHAFT_HALF;
  const bayCount = Math.floor((ELEVATOR_TOP - LEG_SECTION_HEIGHT) / ELEVATOR_BAY_HEIGHT);

  const chordOffsets = [
    { dx: -1, dz: -1 },
    { dx: 1, dz: -1 },
    { dx: 1, dz: 1 },
    { dx: -1, dz: 1 },
  ];

  const ringHeights: number[] = [];
  for (let i = 0; i <= bayCount; i++) {
    ringHeights.push(LEG_SECTION_HEIGHT + i * ELEVATOR_BAY_HEIGHT);
  }

  for (let bay = 0; bay < bayCount; bay++) {
    const h0 = ringHeights[bay];
    const h1 = ringHeights[bay + 1];

    for (const h of [h0, h1]) {
      const center = shaftCenter(corner, h);
      for (let c = 0; c < 4; c++) {
        const next = (c + 1) % 4;
        const pa = new THREE.Vector3(
          center.x + chordOffsets[c].dx * half,
          h,
          center.z + chordOffsets[c].dz * half,
        );
        const pb = new THREE.Vector3(
          center.x + chordOffsets[next].dx * half,
          h,
          center.z + chordOffsets[next].dz * half,
        );
        const strut = beamBetween(pa, pb, mat, STRUT_RADIUS);
        if (strut) group.add(strut);
      }
    }

    const centerBot = shaftCenter(corner, h0);
    const centerTop = shaftCenter(corner, h1);

    for (let c = 0; c < 4; c++) {
      const chordBot = new THREE.Vector3(
        centerBot.x + chordOffsets[c].dx * half,
        h0,
        centerBot.z + chordOffsets[c].dz * half,
      );
      const chordTop = new THREE.Vector3(
        centerTop.x + chordOffsets[c].dx * half,
        h1,
        centerTop.z + chordOffsets[c].dz * half,
      );
      const chord = beamBetween(chordBot, chordTop, mat, CHORD_RADIUS);
      if (chord) group.add(chord);
    }

    const midH = (h0 + h1) / 2;
    shaftCenter(corner, midH);
    for (let c = 0; c < 4; c++) {
      const next = (c + 1) % 4;
      const botA = new THREE.Vector3(
        centerBot.x + chordOffsets[c].dx * half,
        h0,
        centerBot.z + chordOffsets[c].dz * half,
      );
      const botB = new THREE.Vector3(
        centerBot.x + chordOffsets[next].dx * half,
        h0,
        centerBot.z + chordOffsets[next].dz * half,
      );
      const topA = new THREE.Vector3(
        centerTop.x + chordOffsets[c].dx * half,
        h1,
        centerTop.z + chordOffsets[c].dz * half,
      );
      const topB = new THREE.Vector3(
        centerTop.x + chordOffsets[next].dx * half,
        h1,
        centerTop.z + chordOffsets[next].dz * half,
      );
      const d1 = beamBetween(botA, topB, mat, BRACE_RADIUS);
      const d2 = beamBetween(botB, topA, mat, BRACE_RADIUS);
      if (d1) group.add(d1);
      if (d2) group.add(d2);
    }
  }

  const topCenter = shaftCenter(corner, ELEVATOR_TOP);
  const penthouseBot = topCenter.y;
  const phGeo = new THREE.BoxGeometry(half * 2, ELEVATOR_MACHINERY_HEIGHT, half * 2);
  const ph = new THREE.Mesh(phGeo, mat);
  ph.position.set(topCenter.x, penthouseBot + ELEVATOR_MACHINERY_HEIGHT / 2, topCenter.z);
  group.add(ph);

  return group;
}

export function buildElevatorShafts(materials: THREE.Material[] | THREE.Material, fallback: boolean): THREE.Group {
  const group = new THREE.Group();
  if (!materials) return group;

  const mat = fallback
    ? (materials as THREE.Material[])[0]
    : (materials as THREE.Material);

  for (const corner of ELEVATOR_LEGS) {
    const shaft = buildSingleShaft(corner, mat);
    shaft.name = `elevator-shaft-${corner}`;
    group.add(shaft);
  }

  return group;
}
