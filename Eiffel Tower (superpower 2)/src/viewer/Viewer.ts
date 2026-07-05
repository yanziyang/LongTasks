import * as THREE from 'three';
import { buildTower } from '../tower/Tower';
import { applyTheme, Theme } from './EnvironmentTheme';
import { createCamera, resetCamera } from './CameraRig';
import { createOrbitControls } from '../controls/OrbitControlsSetup';

export class Viewer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: ReturnType<typeof createOrbitControls>;
  private rafId = 0;

  constructor(private container: HTMLElement) {
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = createCamera(aspect);
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.controls = createOrbitControls(this.camera, this.renderer.domElement);

    this.setupLights();
    this.setupGround();
    this.scene.add(buildTower());
    applyTheme(this.scene, this.renderer, 'day');
  }

  private setupLights(): void {
    const sun = new THREE.DirectionalLight(0xfff5e6, 2.0);
    sun.position.set(200, 400, 100);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    this.scene.add(sun);

    const hemi = new THREE.HemisphereLight(0x87ceeb, 0x7a7a7a, 0.6);
    this.scene.add(hemi);

    const ambient = new THREE.AmbientLight(0xffffff, 0.1);
    this.scene.add(ambient);
  }

  private setupGround(): void {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(1200, 1200),
      new THREE.ShadowMaterial({ opacity: 0.3 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  start(): void {
    const animate = () => {
      this.rafId = requestAnimationFrame(animate);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  setTheme(theme: Theme): void {
    applyTheme(this.scene, this.renderer, theme);
  }

  resetCamera(): void {
    resetCamera(this.camera);
    this.controls.target.set(0, 150, 0);
    this.controls.update();
  }

  dispose(): void {
    cancelAnimationFrame(this.rafId);
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
