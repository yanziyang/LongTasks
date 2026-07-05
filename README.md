# LongTasks

> **One-shot 3D engineering from vague prompts** — three fully procedural, AI-generated Eiffel Tower renderers built with Three.js and TypeScript, each produced by a different LLM pipeline from a single brainstorming prompt.

---

## Overview

LongTasks is an experiment in AI-assisted code generation. Starting from a single vague prompt — *"Design in code a realistic Eiffel Tower"* — three independent implementations were built in **one pass** (no iterative refinement), each by a different combination of planning and coding LLMs. The output is a side-by-side comparison of how different models interpret the same ambiguous specification.

All three renderers produce a fully interactive 3D Eiffel Tower **entirely from procedural geometry** — no external 3D models, no textures. Every beam, girder, platform, and arch is generated from mathematical curves and structural rules.

---

## The Three Implementations

| | Superpower 1 | Superpower 2 | Superpower 3 |
|---|---|---|---|
| **Approach** | Simplified tube-extruded legs with X-braced lattice | Intermediate lattice using `InstancedMesh` for efficiency | Engineering model: four independent curved truss legs with dense cross-bracing |
| **Geometry** | `CatmullRom` tube legs, basic X-bracing, box platforms | Pier legs, inter-leg lattice, decorative arches, platforms, antenna | 4 chord tubes per leg + struts + diagonal braces, density-tiered body lattice, double-ring decorative arches |
| **Materials** | `MeshStandardMaterial` (single color) | PBR iron material | Custom GLSL `ShaderMaterial` with 3-tone graduated paint, GGX specular, hemisphere ambient, sparkle emissive |
| **Planning LLM** | GLM-5.2 Max | Kimi K2.7 Code | DeepSeek V4 Pro Max / GLM-5.2 Max |
| **Coding LLM** | Mimo-2.5 | Mimo-2.5-pro | DeepSeek V4 Flash Max / DeepSeek V4 Pro |

---

## Features

- **Realistic silhouette** — follows the tower's actual exponential profile curve (125 m base → 300 m summit, 330 m with antenna)
- **Four independent curved legs** — each a full truss structure with chords, struts, and diagonal bracing
- **Three platforms** at real-world heights: 57 m, 115 m, 276 m
- **Decorative double-ring arches** under the first platform (Superpower 3)
- **Graduated paint** — three shades of "Eiffel Tower brown," darker at the base (Superpower 3 via custom shader)
- **Day/Night toggle** — dynamic lighting with golden illumination and twinkling sparkle effect
- **Orbit controls** — drag to rotate, scroll to zoom, with damped auto-rotation when idle
- **Responsive UI** — info overlays, loading screens, keyboard shortcuts (R=reset, T=theme, I=info)

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [TypeScript](https://www.typescriptlang.org/) 5.x | Language (strict mode, ES2022) |
| [Three.js](https://threejs.org/) 0.169 | 3D rendering engine |
| [Vite](https://vitejs.dev/) 5.x | Dev server & production bundler |
| [Vitest](https://vitest.dev/) 2.x | Test runner |
| [jsdom](https://github.com/jsdom/jsdom) / happy-dom | DOM mocking for tests |
| Raw DOM (no UI framework) | UI construction via factory functions |

---

## Project Structure

```
LongTasks/
├── README.md
├── Prompt.md                           # Original prompts & LLM model details
├── "Eiffel Tower (superpower 1)/"      # Simpler tube-based implementation
│   ├── src/
│   │   ├── main.ts                     # Entry point
│   │   ├── constants.ts                # Dimensions & colors
│   │   ├── scene/                      # Controls, Lighting
│   │   ├── tower/                      # Profile, Geometry, Materials
│   │   └── ui/                         # Overlay, DayNightToggle
│   └── tests/
├── "Eiffel Tower (superpower 2)/"      # Intermediate InstancedMesh implementation
│   ├── src/
│   │   ├── main.ts
│   │   ├── App.ts
│   │   ├── viewer/                     # Viewer, CameraRig, EnvironmentTheme
│   │   ├── tower/                      # Tower, builders/, materials/
│   │   ├── math/                       # TowerProfile, LatticePattern
│   │   ├── ui/                         # ThemeToggle, InfoOverlay
│   │   └── controls/                   # OrbitControlsSetup
│   └── tests/
└── "Eiffel Tower (superpower 3)/"      # Engineering-grade truss model
    ├── src/
    │   ├── main.ts
    │   ├── App.ts
    │   ├── constants.ts                # Extensive config & shader params
    │   ├── viewer/                     # Viewer, EnvironmentTheme, CameraRig
    │   ├── tower/                      # Tower, Profile, Materials (GLSL), builders/
    │   └── ui/                         # ThemeToggle, InfoOverlay, LoadingOverlay
    └── tests/
```

---

## Getting Started

Each implementation is a standalone project. Navigate into the desired directory before running commands.

### Development

```sh
cd "Eiffel Tower (superpower 3)"
npm install
npm run dev
```

Opens `http://localhost:5173` with live reload.

### Production Build

```sh
npm run build
npm run preview
```

### Tests

```sh
npm test
```

Each project includes smoke tests, constant validation, geometry/profile tests, and material/lighting tests. Some projects also include builder-level unit tests for individual structural components.

---

## Methodology

All three towers were built using the **[superpowers](https://github.com/obra/superpowers)** methodology:

1. **Brainstorming** — An LLM receives the prompt and produces a high-level design specification
2. **Coding** — A (potentially different) LLM implements the spec in one shot via TypeScript + Three.js
3. **Testing** — Unit tests verify geometric properties, constant validity, and component construction

Each implementation used a different pairing of planning and coding models, producing markedly different architectural decisions and levels of detail from the same seed prompt.

Detailed prompt history and model assignments are documented in [`Prompt.md`](Prompt.md).
