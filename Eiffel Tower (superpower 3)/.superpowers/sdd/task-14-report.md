# Task 14: Viewer — Scene, Renderer, Animation Loop

**Status:** Complete  
**Commit:** `08575f5`  
**Branch:** `feat/eiffel-tower-v3`

## Summary

Created `src/viewer/Viewer.ts` — the main Viewer class wiring together:
- Three.js scene, WebGLRenderer with antialiasing and shadow maps
- Camera via `CameraRig`, orbit controls with auto-rotation from `OrbitControlsSetup`
- Lighting: directional sun, hemisphere, ambient, and a night-time beacon point light
- Ground plane using `ShadowMaterial`
- Tower built via `buildTower()` and added to the scene
- Day theme applied on construction via `applyTheme()`
- Drag detection on pointer events for auto-rotation suppression
- WebGL context loss handler with user-visible message overlay
- Responsive resize listener
- `start()` animation loop with delta clamping, light direction sync, and sparkle updates
- `setTheme()`, `resetCamera()`, `isFallback` getter, and `dispose()` lifecycle methods
