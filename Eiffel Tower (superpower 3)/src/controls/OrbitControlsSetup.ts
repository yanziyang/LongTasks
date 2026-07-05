import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
import { CAMERA_TARGET, SCENE_SCALE, AUTO_ROTATION_SPEED } from '../constants';

export function createOrbitControls(camera: THREE.Camera, dom: HTMLElement): OrbitControls {
  const controls = new OrbitControls(camera, dom);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 1.0;
  controls.maxDistance = 10;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.target.copy(CAMERA_TARGET).multiplyScalar(SCENE_SCALE);
  controls.autoRotate = true;
  controls.autoRotateSpeed = AUTO_ROTATION_SPEED;
  controls.update();
  return controls;
}
