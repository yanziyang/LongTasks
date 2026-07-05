### Task 14: Viewer — Scene, Renderer, Animation Loop

- [ ] **Step 1: Create src/viewer/Viewer.ts**

```typescript
import * as THREE from 'three';
import { buildTower, TowerBuildResult } from '../tower/Tower';
import { applyTheme, Theme } from './EnvironmentTheme';
import { createCamera, resetCamera, createAutoRotation, updateAutoRotation, AutoRotationState } from './CameraRig';
import { createOrbitControls } from '../controls/OrbitControlsSetup';
import { updateSparkle } from '../tower/materials';

export class Viewer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: ReturnType<typeof createOrbitControls>;
  private towerResult: TowerBuildResult;
  private rafId = 0;
  private autoRotation: AutoRotationState;
  private isDragging = false;
  private sparkleStartTime = 0;
  private currentTheme: Theme = 'day';

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
    this.autoRotation = createAutoRotation();
    this.controls.autoRotateSpeed = this.autoRotation.nominalSpeed;

    this.setupLights();
    this.setupGround();
    this.towerResult = buildTower();
    this.scene.add(this.towerResult.group);

    applyTheme(this.scene, this.renderer, 'day', this.towerResult.isFallback ? undefined : this.towerResult.material as THREE.ShaderMaterial);

    this.setupDragDetection();
    this.setupContextLost();
    this.setupResize();
  }

  private setupLights(): void {
    const sun = new THREE.DirectionalLight(0xfff5e6, 2.0);
    sun.position.set(200, 400, 100);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.1;
    sun.shadow.camera.far = 1000;
    const d = 400;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    this.scene.add(sun);

    const hemi = new THREE.HemisphereLight(0x87ceeb, 0x7a7a7a, 0.6);
    this.scene.add(hemi);

    const ambient = new THREE.AmbientLight(0xffffff, 0.1);
    this.scene.add(ambient);

    const beacon = new THREE.PointLight(0xffd27f, 0, 8);
    beacon.name = 'beacon';
    beacon.position.set(0, 330, 0);
    beacon.visible = false;
    this.scene.add(beacon);
  }

  private setupGround(): void {
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(600, 64),
      new THREE.ShadowMaterial({ opacity: 0.3 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  private setupDragDetection(): void {
    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', () => { this.isDragging = true; });
    dom.addEventListener('pointerup', () => { this.isDragging = false; });
    dom.addEventListener('pointerleave', () => { this.isDragging = false; });
  }

  private setupContextLost(): void {
    this.renderer.domElement.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      cancelAnimationFrame(this.rafId);
      const msg = document.createElement('div');
      msg.style.cssText =
        'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:white;font-size:20px;background:rgba(0,0,0,0.7);z-index:100;';
      msg.textContent = 'WebGL context lost. Please reload the page.';
      this.container.appendChild(msg);
    });
  }

  private setupResize(): void {
    window.addEventListener('resize', () => {
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  start(): void {
    const clock = new THREE.Clock();
    const animate = () => {
      this.rafId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);

      const speed = updateAutoRotation(this.autoRotation, delta, this.isDragging);
      this.controls.autoRotateSpeed = speed;

      this.controls.update();

      if (!this.towerResult.isFallback) {
        const mat = this.towerResult.material as THREE.ShaderMaterial;
        const sun = this.scene.children.find((c) => c instanceof THREE.DirectionalLight) as THREE.DirectionalLight;
        if (sun && mat.uniforms) {
          const dir = new THREE.Vector3();
          sun.getWorldDirection(dir);
          mat.uniforms.lightDirection.value.copy(dir);
        }
        if (this.currentTheme === 'night') {
          updateSparkle(mat, this.sparkleStartTime > 0 ? performance.now() - this.sparkleStartTime : 0);
        }
      }

      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    if (theme === 'night') {
      this.sparkleStartTime = performance.now();
    } else {
      this.sparkleStartTime = 0;
    }
    applyTheme(
      this.scene,
      this.renderer,
      theme,
      this.towerResult.isFallback ? undefined : this.towerResult.material as THREE.ShaderMaterial,
    );
  }

  resetCamera(): void {
    resetCamera(this.camera);
    this.controls.target.set(0, 1.5, 0);
    this.controls.update();
  }

  get isFallback(): boolean {
    return this.towerResult.isFallback;
  }

  dispose(): void {
    cancelAnimationFrame(this.rafId);
    this.controls.dispose();
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/viewer/Viewer.ts
git commit -m "feat: add Viewer with scene, lights, ground, and animation loop"
```
