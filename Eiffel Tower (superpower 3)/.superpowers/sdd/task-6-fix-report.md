# Task 6 Fix Report: Diagonal X-Brace Height Ratio

## Issue

`heightRatio` was computed incorrectly for diagonal X-brace beams. The old code used `getWorldPosition` + `localY`, which assumes local Y aligns with world Y. For diagonal beams, `beamBetween` rotates the mesh via `quaternion.setFromUnitVectors`, so local Y does not equal world Y, producing a wrong color gradient.

## Fix

**File:** `src/tower/builders/LatticeBuilder.ts` (traverse loop)

Replaced:
```ts
const worldPos = new THREE.Vector3();
child.getWorldPosition(worldPos);
for (let i = 0; i < positions.count; i++) {
  const localY = positions.getY(i);
  heightRatios[i] = (worldPos.y + localY) / HEIGHT_TOP;
}
```

With:
```ts
const vertex = new THREE.Vector3();
const matrix = child.matrixWorld;
for (let i = 0; i < positions.count; i++) {
  vertex.set(positions.getX(i), positions.getY(i), positions.getZ(i));
  vertex.applyMatrix4(matrix);
  heightRatios[i] = vertex.y / HEIGHT_TOP;
}
```

This applies the mesh's full world matrix to each vertex, yielding correct world-space Y even for rotated diagonal beams.

## Verification

- `npm test` — all 39 tests pass across 5 test files.
- Commit: `eb7e202` "fix: compute per-vertex world Y for diagonal beam height ratios"
