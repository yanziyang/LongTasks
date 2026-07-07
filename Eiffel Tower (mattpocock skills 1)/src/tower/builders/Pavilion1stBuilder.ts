import * as THREE from 'three';
import { profile } from '../profile';
import {
  PAVILION_1ST_AREA_RATIO,
  PAVILION_HEIGHT,
  PAVILION_FRAME_THICKNESS,
  PLATFORM_HEIGHTS,
} from '../../constants';
import { createGlassMaterial } from '../materials';

function buildSteelFrame(w: number, h: number, d: number, posY: number, frameMat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const t = PAVILION_FRAME_THICKNESS;

  const bottomFrame = new THREE.Mesh(new THREE.BoxGeometry(w * 2, t, t), frameMat);
  bottomFrame.position.set(0, posY, -d);
  group.add(bottomFrame);

  const topFrame = new THREE.Mesh(new THREE.BoxGeometry(w * 2, t, t), frameMat);
  topFrame.position.set(0, posY + h, -d);
  group.add(topFrame);

  const bottomFrameZ = new THREE.Mesh(new THREE.BoxGeometry(w * 2, t, t), frameMat);
  bottomFrameZ.position.set(0, posY, d);
  group.add(bottomFrameZ);

  const topFrameZ = new THREE.Mesh(new THREE.BoxGeometry(w * 2, t, t), frameMat);
  topFrameZ.position.set(0, posY + h, d);
  group.add(topFrameZ);

  const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(t, h, t), frameMat);
  leftFrame.position.set(-w, posY + h / 2, -d);
  group.add(leftFrame);

  const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(t, h, t), frameMat);
  rightFrame.position.set(w, posY + h / 2, -d);
  group.add(rightFrame);

  const leftFrameZ = new THREE.Mesh(new THREE.BoxGeometry(t, h, t), frameMat);
  leftFrameZ.position.set(-w, posY + h / 2, d);
  group.add(leftFrameZ);

  const rightFrameZ = new THREE.Mesh(new THREE.BoxGeometry(t, h, t), frameMat);
  rightFrameZ.position.set(w, posY + h / 2, d);
  group.add(rightFrameZ);

  const midVert = new THREE.Mesh(new THREE.BoxGeometry(t, h - t * 2, t), frameMat);
  midVert.position.set(0, posY + h / 2, -d);
  group.add(midVert);

  const midVertZ = new THREE.Mesh(new THREE.BoxGeometry(t, h - t * 2, t), frameMat);
  midVertZ.position.set(0, posY + h / 2, d);
  group.add(midVertZ);

  return group;
}

export function buildPavilion1st(
  materials: THREE.Material[] | THREE.Material,
  fallback: boolean,
  glassMat?: THREE.MeshPhysicalMaterial,
): THREE.Group {
  const group = new THREE.Group();
  const mat = fallback ? (materials as THREE.Material[])[0] : (materials as THREE.Material);
  const gMat = glassMat ?? createGlassMaterial();
  const h = PLATFORM_HEIGHTS[0];
  const w = profile(h);
  const pavW = w * PAVILION_1ST_AREA_RATIO;
  const pavD = pavW * 0.5;
  const y = h + PAVILION_HEIGHT / 2;

  const glassPanel = new THREE.Mesh(
    new THREE.BoxGeometry(pavW * 2 - PAVILION_FRAME_THICKNESS * 2, PAVILION_HEIGHT, pavD * 2 - PAVILION_FRAME_THICKNESS * 2),
    gMat,
  );
  glassPanel.position.y = y;
  group.add(glassPanel);

  const frame = buildSteelFrame(pavW, PAVILION_HEIGHT, pavD, h, mat);
  group.add(frame);

  const penthouseGeo = new THREE.BoxGeometry(pavW * 0.6, 4, pavD * 0.6);
  const penthouse = new THREE.Mesh(penthouseGeo, mat);
  penthouse.position.set(0, h + PAVILION_HEIGHT + 2, 0);
  group.add(penthouse);

  return group;
}
