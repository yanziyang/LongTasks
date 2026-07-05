import * as THREE from 'three';

const app = document.getElementById('app')!;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fb8d8);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(6, 1.6, 8);
camera.lookAt(0, 1.6, 0);

const sun = new THREE.DirectionalLight(0xfff2cc, 2.0);
sun.position.set(5, 8, 4);
scene.add(sun);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 40),
  new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 }),
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const placeholder = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 3.3, 0.5),
  new THREE.MeshStandardMaterial({ color: 0x6b5b47 }),
);
placeholder.position.y = 1.65;
scene.add(placeholder);

renderer.setAnimationLoop(() => {
  renderer.render(scene, camera);
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
