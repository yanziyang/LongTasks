import * as THREE from 'three';

export function buildAntenna(): THREE.Group {
  const group = new THREE.Group();
  const height = 54;
  const geometry = new THREE.CylinderGeometry(0.3, 1.5, height, 8);
  const material = new THREE.MeshStandardMaterial({ color: 0x6e5c4b, roughness: 0.7, metalness: 0.4 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = height / 2;
  mesh.castShadow = true;
  group.add(mesh);
  return group;
}
