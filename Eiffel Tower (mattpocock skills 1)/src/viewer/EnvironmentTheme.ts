import * as THREE from 'three';
import { setNightMode, NightModeGroup } from '../tower/materials';

export type Theme = 'day' | 'night';

export function applyTheme(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  theme: Theme,
  dayMaterial?: THREE.MeshStandardMaterial,
  nightMaterial?: THREE.MeshStandardMaterial,
  nightGroup?: NightModeGroup | null,
  towerGroup?: THREE.Group,
): void {
  if (theme === 'day') {
    scene.background = new THREE.Color(0x87ceeb);
    renderer.setClearColor(0x87ceeb);
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.00005);
  } else {
    scene.background = new THREE.Color(0x0a1525);
    renderer.setClearColor(0x0a1525);
    scene.fog = new THREE.FogExp2(0x0a1525, 0.00003);
  }

  scene.traverse((child) => {
    if (child instanceof THREE.DirectionalLight) {
      if (theme === 'day') {
        child.color.set(0xfff5e6);
        child.intensity = 2.0;
      } else {
        child.color.set(0xc8d8ff);
        child.intensity = 0.4;
      }
    } else if (child instanceof THREE.HemisphereLight) {
      if (theme === 'day') {
        child.color.set(0x87ceeb);
        child.groundColor.set(0x7a7a7a);
        child.intensity = 0.6;
      } else {
        child.color.set(0x1a2a4a);
        child.groundColor.set(0x050505);
        child.intensity = 0.2;
      }
    } else if (child instanceof THREE.AmbientLight) {
      child.intensity = theme === 'day' ? 0.1 : 0.05;
    }
  });

  if (dayMaterial && nightMaterial) {
    setNightMode(dayMaterial, nightMaterial, nightGroup ?? null, theme === 'night', towerGroup);
  }
}
