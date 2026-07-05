import * as THREE from 'three';
import { createIronMaterial } from '../materials/TowerMaterial';

export interface LatticeSegment {
  start: THREE.Vector3;
  end: THREE.Vector3;
}

export function buildLattice(segments: LatticeSegment[], memberSize: number): THREE.InstancedMesh {
  if (segments.length === 0) {
    return new THREE.InstancedMesh(new THREE.BoxGeometry(), createIronMaterial(), 0);
  }

  const geometry = new THREE.BoxGeometry(memberSize, 1, memberSize);
  const material = createIronMaterial();
  const mesh = new THREE.InstancedMesh(geometry, material, segments.length);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const center = new THREE.Vector3();
  const direction = new THREE.Vector3();

  segments.forEach((segment, i) => {
    center.addVectors(segment.start, segment.end).multiplyScalar(0.5);
    direction.subVectors(segment.end, segment.start);
    const length = direction.length();

    dummy.position.copy(center);
    dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    dummy.scale.set(1, length, 1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  });

  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}
