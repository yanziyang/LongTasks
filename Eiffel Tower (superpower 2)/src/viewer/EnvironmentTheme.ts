import * as THREE from 'three';

export type Theme = 'day' | 'night';

export function applyTheme(scene: THREE.Scene, renderer: THREE.WebGLRenderer, theme: Theme): void {
  if (theme === 'day') {
    scene.background = new THREE.Color(0x87ceeb);
    renderer.setClearColor(0x87ceeb);
  } else {
    scene.background = new THREE.Color(0x0a1525);
    renderer.setClearColor(0x0a1525);
  }

  scene.traverse((child) => {
    if (child instanceof THREE.DirectionalLight) {
      if (theme === 'day') {
        child.color.set(0xfff5e6);
        child.intensity = 2.0;
      } else {
        child.color.set(0x6688aa);
        child.intensity = 0.5;
      }
    } else if (child instanceof THREE.HemisphereLight) {
      if (theme === 'day') {
        child.color.set(0x87ceeb);
        child.groundColor.set(0x7a7a7a);
        child.intensity = 0.6;
      } else {
        child.color.set(0x223344);
        child.groundColor.set(0x111122);
        child.intensity = 0.3;
      }
    } else if (child instanceof THREE.AmbientLight) {
      child.intensity = theme === 'day' ? 0.1 : 0.2;
    } else if (child instanceof THREE.PointLight && child.name === 'beacon') {
      child.visible = theme === 'night';
    }
  });
}
