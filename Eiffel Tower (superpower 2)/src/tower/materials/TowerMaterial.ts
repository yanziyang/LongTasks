import * as THREE from 'three';

export function createIronMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x6e5c4b,
    roughness: 0.7,
    metalness: 0.4,
  });
}
