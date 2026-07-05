import * as THREE from 'three';
import { TowerProfile } from '../../math/TowerProfile';
import { buildLattice } from './LatticeBuilder';

export function buildPier(): THREE.Group {
  const group = new THREE.Group();
  const chordSize = 2.5;
  const memberSize = 0.6;
  const levels = 20;
  const heightStep = TowerProfile.TOTAL_HEIGHT / levels;

  const chordGeometry = new THREE.BoxGeometry(chordSize, heightStep + 0.5, chordSize);
  const chordMaterial = new THREE.MeshStandardMaterial({ color: 0x6e5c4b, roughness: 0.7, metalness: 0.4 });

  for (let i = 0; i < levels; i++) {
    const h0 = i * heightStep;
    const h1 = (i + 1) * heightStep;
    const w0 = TowerProfile.getWidthAtHeight(h0) / 2;
    const w1 = TowerProfile.getWidthAtHeight(h1) / 2;

    const corners0 = [
      new THREE.Vector3(w0, h0, w0),
      new THREE.Vector3(-w0, h0, w0),
      new THREE.Vector3(-w0, h0, -w0),
      new THREE.Vector3(w0, h0, -w0),
    ];
    const corners1 = [
      new THREE.Vector3(w1, h1, w1),
      new THREE.Vector3(-w1, h1, w1),
      new THREE.Vector3(-w1, h1, -w1),
      new THREE.Vector3(w1, h1, -w1),
    ];

    // Vertical chords
    corners0.forEach((c0, idx) => {
      const c1 = corners1[idx];
      const mesh = new THREE.Mesh(chordGeometry, chordMaterial);
      mesh.position.copy(c0).add(c1).multiplyScalar(0.5);
      mesh.lookAt(c1);
      mesh.scale.y = c0.distanceTo(c1) / heightStep;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    });

    // Bracing
    const bracing: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    for (let j = 0; j < 4; j++) {
      bracing.push({ start: corners0[j], end: corners1[(j + 1) % 4] });
      bracing.push({ start: corners0[(j + 1) % 4], end: corners1[j] });
      bracing.push({ start: corners0[j], end: corners1[j] });
    }
    group.add(buildLattice(bracing, memberSize));
  }

  return group;
}
