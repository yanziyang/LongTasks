import * as THREE from 'three';
import { TOWER_COLOR, ANTENNA_COLOR } from '../constants';

export const dayMaterial = new THREE.MeshStandardMaterial({
  color: TOWER_COLOR,
  metalness: 0.3,
  roughness: 0.7,
  emissive: 0x000000,
  emissiveIntensity: 0,
});

export const nightMaterial = new THREE.MeshStandardMaterial({
  color: TOWER_COLOR,
  metalness: 0.3,
  roughness: 0.7,
  emissive: new THREE.Color(0xffd27f),
  emissiveIntensity: 0.45,
});

export const antennaMaterial = new THREE.MeshStandardMaterial({
  color: ANTENNA_COLOR,
  metalness: 0.5,
  roughness: 0.5,
});
