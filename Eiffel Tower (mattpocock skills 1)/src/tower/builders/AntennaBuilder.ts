import * as THREE from 'three';
import { antennaMaterial } from '../materials';
import { HEIGHT_TOP, ANTENNA_HEIGHT } from '../../constants';

export function buildAntenna(): THREE.Group {
  const group = new THREE.Group();

  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 1.2, ANTENNA_HEIGHT, 8),
    antennaMaterial,
  );
  mast.position.y = HEIGHT_TOP + ANTENNA_HEIGHT / 2;
  group.add(mast);

  const tip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.6, 2, 8),
    antennaMaterial,
  );
  tip.position.y = HEIGHT_TOP + ANTENNA_HEIGHT;
  group.add(tip);

  return group;
}
