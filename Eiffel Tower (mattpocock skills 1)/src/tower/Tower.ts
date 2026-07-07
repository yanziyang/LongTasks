import * as THREE from 'three';
import { buildLegTrusses } from './builders/LegTrussBuilder';
import { buildInterLegLattice } from './builders/InterLegLatticeBuilder';
import { buildPlatforms } from './builders/PlatformBuilder';
import { buildCabin } from './builders/CabinBuilder';
import { buildAntenna } from './builders/AntennaBuilder';
import { buildEsplanade } from './builders/EsplanadeBuilder';
import { buildElevatorShafts } from './builders/ElevatorBuilder';
import { buildPavilion1st } from './builders/Pavilion1stBuilder';
import { buildPavilion2nd } from './builders/Pavilion2ndBuilder';
import { buildSpiralStaircase } from './builders/SpiralStaircaseBuilder';
import { buildGroundPlane } from './builders/GroundPlaneBuilder';
import {
  createTowerMaterial,
  createPierMaterial,
  createGlassMaterial,
  nightTowerMaterial,
} from './materials';
import { applyVertexColors } from './vertexColors';
import { SCENE_SCALE } from '../constants';

export interface TowerBuildResult {
  group: THREE.Group;
  material: THREE.MeshStandardMaterial;
  pierMaterial: THREE.MeshStandardMaterial;
  glassMaterial: THREE.MeshPhysicalMaterial;
  nightMaterial: THREE.MeshStandardMaterial;
}

export function buildTower(): TowerBuildResult {
  const material = createTowerMaterial();
  const pierMaterial = createPierMaterial();
  const glassMaterial = createGlassMaterial();

  const group = new THREE.Group();
  const fallbackMode = false;

  group.add(buildEsplanade(pierMaterial));
  group.add(buildLegTrusses(material, fallbackMode));
  group.add(buildElevatorShafts(material, fallbackMode));
  group.add(buildInterLegLattice(material, fallbackMode));
  group.add(buildPlatforms(material, fallbackMode));
  group.add(buildPavilion1st(material, fallbackMode, glassMaterial));
  group.add(buildPavilion2nd(material, fallbackMode, glassMaterial));
  group.add(buildSpiralStaircase(material, fallbackMode));
  group.add(buildCabin(material, fallbackMode));
  group.add(buildAntenna());

  applyVertexColors(group);

  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });

  group.scale.setScalar(SCENE_SCALE);

  return { group, material, pierMaterial, glassMaterial, nightMaterial: nightTowerMaterial };
}

export function buildSceneGround(): THREE.Group {
  return buildGroundPlane();
}
