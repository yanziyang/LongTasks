import * as THREE from 'three';
import { TowerProfile } from '../../math/TowerProfile';
import { buildLattice } from './LatticeBuilder';

export function buildArches(): THREE.Group {
  const group = new THREE.Group();
  const baseWidth = TowerProfile.getWidthAtHeight(0) / 2;
  const archHeight = 40;
  const segments = 16;
  const memberSize = 1.2;

  const directions = [
    new THREE.Vector3(1, 0, 1),
    new THREE.Vector3(-1, 0, 1),
    new THREE.Vector3(-1, 0, -1),
    new THREE.Vector3(1, 0, -1),
  ];

  directions.forEach((dir) => {
    const side = dir.clone().normalize().multiplyScalar(baseWidth);
    const left = new THREE.Vector3(side.x, 0, -side.z);
    const right = new THREE.Vector3(-side.x, 0, side.z);

    const archPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = THREE.MathUtils.lerp(left.x, right.x, t);
      const z = THREE.MathUtils.lerp(left.z, right.z, t);
      const y = archHeight * Math.sin(t * Math.PI);
      archPoints.push(new THREE.Vector3(x, y, z));
    }

    const chords: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    for (let i = 0; i < archPoints.length - 1; i++) {
      chords.push({ start: archPoints[i], end: archPoints[i + 1] });
    }
    group.add(buildLattice(chords, memberSize));

    const hangers: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    for (let i = 1; i < archPoints.length - 1; i += 2) {
      hangers.push({ start: archPoints[i], end: new THREE.Vector3(archPoints[i].x, 0, archPoints[i].z) });
    }
    group.add(buildLattice(hangers, memberSize * 0.6));
  });

  return group;
}
