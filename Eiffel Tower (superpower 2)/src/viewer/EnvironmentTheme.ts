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
}
