import * as THREE from 'three';
import { buildTower, buildSceneGround, TowerBuildResult } from '../tower/Tower';
import { applyTheme, Theme } from './EnvironmentTheme';
import { createCamera, resetCamera, createAutoRotation, updateAutoRotation, AutoRotationState } from './CameraRig';
import { createOrbitControls } from '../controls/OrbitControlsSetup';
import { updateSparkle, createNightModeGroup, NightModeGroup } from '../tower/materials';
import { CAMERA_TARGET, SCENE_SCALE } from '../constants';

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
  private nightGroup: NightModeGroup | null = null;

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

    this.nightGroup = createNightModeGroup(this.towerResult.group);
    if (this.nightGroup) {
      for (const light of this.nightGroup.twinkleLights) {
        this.scene.add(light);
      }
      for (const dot of this.nightGroup.emissiveMeshes) {
        this.scene.add(dot);
      }
    }

    applyTheme(
      this.scene,
      this.renderer,
      'day',
      this.towerResult.material,
      this.towerResult.nightMaterial,
      this.nightGroup,
      this.towerResult.group,
    );

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
  }

  private setupGround(): void {
    const groundGroup = buildSceneGround();
    this.scene.add(groundGroup);

    const shadowPlane = new THREE.Mesh(
      new THREE.CircleGeometry(600, 64),
      new THREE.ShadowMaterial({ opacity: 0.3 }),
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.receiveShadow = true;
    this.scene.add(shadowPlane);
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

      if (this.currentTheme === 'night') {
        updateSparkle(this.nightGroup, this.sparkleStartTime > 0 ? performance.now() - this.sparkleStartTime : 0);
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
      this.towerResult.material,
      this.towerResult.nightMaterial,
      this.nightGroup,
      this.towerResult.group,
    );
  }

  resetCamera(): void {
    resetCamera(this.camera);
    this.controls.target.set(0, CAMERA_TARGET.y * SCENE_SCALE, 0);
    this.controls.update();
  }

  dispose(): void {
    cancelAnimationFrame(this.rafId);
    this.controls.dispose();
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
