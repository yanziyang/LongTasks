import * as THREE from 'three';

export const INITIAL_POSITION = new THREE.Vector3(250, 120, 250);
export const TARGET = new THREE.Vector3(0, 150, 0);

export function createCamera(aspect: number): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 2000);
  resetCamera(camera);
  return camera;
}

export function resetCamera(camera: THREE.PerspectiveCamera): void {
  camera.position.copy(INITIAL_POSITION);
  camera.lookAt(TARGET);
}
