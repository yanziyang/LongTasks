import * as THREE from 'three';
import {
  SPARKLE_LIGHT_COUNT,
  SPARKLE_INTERVAL_MS,
  SPARKLE_DURATION_MS,
  HEIGHT_TOTAL,
} from '../constants';

export class Lighting {
  sun: THREE.DirectionalLight;
  private ambient: THREE.AmbientLight;
  private points: THREE.PointLight[];
  private _night = false;

  constructor(private scene: THREE.Scene) {
    this.sun = new THREE.DirectionalLight(0xfff2cc, 2.2);
    this.sun.position.set(8, 12, 6);
    this.scene.add(this.sun);

    this.ambient = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(this.ambient);

    this.points = [];
    for (let i = 0; i < SPARKLE_LIGHT_COUNT; i++) {
      const h = (HEIGHT_TOTAL * (i + 0.5)) / SPARKLE_LIGHT_COUNT;
      const p = new THREE.PointLight(0xffd27f, 0, 4, 2);
      const angle = (i / SPARKLE_LIGHT_COUNT) * Math.PI * 2;
      p.position.set(Math.cos(angle) * 0.05, h, Math.sin(angle) * 0.05);
      this.points.push(p);
      this.scene.add(p);
    }
  }

  get isNight(): boolean {
    return this._night;
  }

  setDay(): void {
    this._night = false;
    this.sun.intensity = 2.2;
    this.ambient.intensity = 0.45;
    for (const p of this.points) p.intensity = 0;
  }

  setNight(): void {
    this._night = true;
    this.sun.intensity = 0.05;
    this.ambient.intensity = 0.08;
  }

  update(elapsedMs: number): void {
    if (!this._night) return;
    const cycle = elapsedMs % SPARKLE_INTERVAL_MS;
    const inBurst = cycle < SPARKLE_DURATION_MS;
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      if (inBurst) {
        p.intensity = 0.5 + Math.random() * 1.5;
      } else {
        p.intensity = 0.25;
      }
    }
  }
}
