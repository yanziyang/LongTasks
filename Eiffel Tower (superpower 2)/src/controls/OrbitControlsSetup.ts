import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TARGET } from '../viewer/CameraRig';

export function createOrbitControls(camera: THREE.Camera, domElement: HTMLElement): OrbitControls {
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.copy(TARGET);
  controls.minDistance = 50;
  controls.maxDistance = 800;
  controls.maxPolarAngle = Math.PI / 2 - 0.02;
  return controls;
}
