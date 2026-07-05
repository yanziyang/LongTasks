import * as THREE from 'three';
import { buildLegs } from './builders/LegBuilder';
import { buildLattice } from './builders/LatticeBuilder';
import { buildArches } from './builders/ArchBuilder';
import { buildPlatforms } from './builders/PlatformBuilder';
import { buildCabin } from './builders/CabinBuilder';
import { buildAntenna } from './builders/AntennaBuilder';
import {
  createTowerMaterial,
  createTowerMaterialFallback,
} from './materials';
import { SCENE_SCALE } from '../constants';

export interface TowerBuildResult {
  group: THREE.Group;
  material: THREE.ShaderMaterial | THREE.Material[];
  isFallback: boolean;
}

export function buildTower(): TowerBuildResult {
  let material: THREE.ShaderMaterial | THREE.Material[];
  let isFallback = false;

  const shaderMat = createTowerMaterial();
  if (shaderMat.vertexShader && shaderMat.vertexShader.length > 50) {
    material = shaderMat;
  } else {
    material = createTowerMaterialFallback();
    isFallback = true;
  }

  const group = new THREE.Group();

  group.add(buildLegs(material, isFallback));
  group.add(buildLattice(material, isFallback));
  group.add(buildArches(material, isFallback));
  group.add(buildPlatforms(material, isFallback));
  group.add(buildCabin(material, isFallback));
  group.add(buildAntenna());

  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });

  group.scale.setScalar(SCENE_SCALE);

  return { group, material, isFallback };
}
