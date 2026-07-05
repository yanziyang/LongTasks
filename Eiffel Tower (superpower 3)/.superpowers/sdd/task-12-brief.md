### Task 12: CameraRig with Speed-Priority Auto-Rotation

- [ ] **Step 1: Create src/viewer/CameraRig.ts**

```typescript
import * as THREE from 'three';
import { CAMERA_INITIAL_POSITION, AUTO_ROTATION_SPEED, AUTO_ROTATION_RECOVERY_S } from '../constants';

const FOV = 45;

export function createCamera(aspect: number): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(FOV, aspect, 0.5, 50);
  camera.position.copy(CAMERA_INITIAL_POSITION).multiplyScalar(0.01);
  return camera;
}

export function resetCamera(camera: THREE.PerspectiveCamera): void {
  camera.position.copy(CAMERA_INITIAL_POSITION).multiplyScalar(0.01);
}

export interface AutoRotationState {
  nominalSpeed: number;
  currentSpeed: number;
  recoveryRate: number;
}

export function createAutoRotation(): AutoRotationState {
  return {
    nominalSpeed: AUTO_ROTATION_SPEED,
    currentSpeed: AUTO_ROTATION_SPEED,
    recoveryRate: 1.0 / AUTO_ROTATION_RECOVERY_S,
  };
}

export function updateAutoRotation(state: AutoRotationState, deltaSec: number, userDragging: boolean): number {
  if (userDragging) {
    state.currentSpeed = Math.max(0, state.currentSpeed - state.nominalSpeed * deltaSec * 2);
  } else {
    state.currentSpeed += (state.nominalSpeed - state.currentSpeed) * state.recoveryRate * deltaSec;
  }
  return state.currentSpeed;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/viewer/CameraRig.ts
git commit -m "feat: add CameraRig with speed-priority auto-rotation blending"
```
