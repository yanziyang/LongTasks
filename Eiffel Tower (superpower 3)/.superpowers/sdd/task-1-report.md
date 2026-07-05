# Task 1: Project Scaffolding — Report

## What I Implemented

Created all 6 project scaffolding files exactly as specified in the brief:

1. **package.json** — project name `eiffel-tower`, private, version `0.0.0`, type `module`. Scripts for dev/build/preview/test. Dependencies: `three@^0.169.0`. DevDependencies: `@types/three@^0.169.0`, `jsdom@^29.1.1`, `typescript@^5.5.0`, `vite@^5.4.0`, `vitest@^2.1.0`.
2. **tsconfig.json** — strict mode, ES2022 target, ESNext module, bundler resolution, noUnusedLocals/Parameters, include src and tests.
3. **vite.config.ts** — base `'./'`.
4. **vitest.config.ts** — resolve extensions `.ts` and `.js`.
5. **index.html** — basic HTML5 template with fullscreen black background, `#app` container div, and `/src/main.ts` script entry point.
6. **.gitignore** — ignores `node_modules/` and `dist/`.

## What I Tested

- **npm install** — installed 91 packages successfully.
- **npm test** — Vitest 2.1.9 ran and exited with "No test files found" as expected (exit code 1, which is the expected Vitest behavior when no test files match).

## Files Changed

7 files committed:
- `.gitignore` (new)
- `index.html` (new)
- `package-lock.json` (new)
- `package.json` (new)
- `tsconfig.json` (new)
- `vite.config.ts` (new)
- `vitest.config.ts` (new)

## Self-review Findings

- All file contents match the brief exactly.
- `noUnusedLocals` and `noUnusedParameters` are enabled in tsconfig — this is correct for strict TypeScript but may cause build errors if unused variables are present later. This is intentional per the brief.
- The brief does not mention creating `src/main.ts` yet — that's expected in a later task.
- `npm test` exits with code 1 due to "No test files found". This is expected per the brief.

## Issues or Concerns

- None. All steps completed successfully.
