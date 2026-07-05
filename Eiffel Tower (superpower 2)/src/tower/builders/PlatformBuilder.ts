import * as THREE from 'three';
import { TowerProfile } from '../../math/TowerProfile';

function buildPlatform(width: number, y: number): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(width, 2, width);
  const material = new THREE.MeshStandardMaterial({ color: 0x4a3f35, roughness: 0.8, metalness: 0.2 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = y;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function buildPlatforms(): THREE.Group {
  const group = new THREE.Group();
  group.add(buildPlatform(TowerProfile.getWidthAtHeight(57) + 8, 57));
  group.add(buildPlatform(TowerProfile.getWidthAtHeight(115) + 6, 115));
  group.add(buildPlatform(TowerProfile.getWidthAtHeight(276) + 4, 276));
  return group;
}
