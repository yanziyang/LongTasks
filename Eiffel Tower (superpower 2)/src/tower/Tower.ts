import * as THREE from 'three';
import { buildPier } from './builders/PierBuilder';
import { buildArches } from './builders/ArchBuilder';
import { buildPlatforms } from './builders/PlatformBuilder';
import { buildAntenna } from './builders/AntennaBuilder';

export function buildTower(): THREE.Group {
  const tower = new THREE.Group();
  tower.add(buildPier());
  tower.add(buildArches());
  tower.add(buildPlatforms());

  const antenna = buildAntenna();
  antenna.position.y = 276;
  tower.add(antenna);

  return tower;
}
