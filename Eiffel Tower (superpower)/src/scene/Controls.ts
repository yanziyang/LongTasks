import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';

export function createControls(camera: THREE.Camera, dom: HTMLElement): OrbitControls {
  const controls = new OrbitControls(camera, dom);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 2;
  controls.maxDistance = 20;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.target.set(0, 1.4, 0);
  controls.update();
  return controls;
}
