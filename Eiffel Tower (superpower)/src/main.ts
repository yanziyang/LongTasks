import * as THREE from 'three';
import { createTower, setTowerNight } from './tower/geometry';
import { createControls } from './scene/Controls';
import { Lighting } from './scene/Lighting';
import { createOverlay } from './ui/Overlay';
import { createDayNightToggle } from './ui/DayNightToggle';

const app = document.getElementById('app')!;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fb8d8);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(6, 1.6, 8);

const controls = createControls(camera, renderer.domElement);

const lighting = new Lighting(scene);

renderer.shadowMap.enabled = true;
lighting.sun.castShadow = true;
lighting.sun.shadow.mapSize.set(2048, 2048);
lighting.sun.shadow.camera.near = 0.5;
lighting.sun.shadow.camera.far = 50;
lighting.sun.shadow.camera.left = -6;
lighting.sun.shadow.camera.right = 6;
lighting.sun.shadow.camera.top = 8;
lighting.sun.shadow.camera.bottom = -2;
lighting.sun.shadow.bias = -0.0005;

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 40),
  new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 }),
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const tower = createTower();
scene.add(tower);

createOverlay(app);

createDayNightToggle(app, (night) => {
  setTowerNight(tower, night);
  if (night) lighting.setNight();
  else lighting.setDay();
  scene.background = new THREE.Color(night ? 0x05060f : 0x9fb8d8);
});

renderer.setAnimationLoop(() => {
  const now = performance.now();
  lighting.update(now);
  controls.update();
  renderer.render(scene, camera);
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.domElement.addEventListener('webglcontextlost', () => {
  console.error('WebGL context lost — renderer stopped.');
  renderer.setAnimationLoop(null);
});
