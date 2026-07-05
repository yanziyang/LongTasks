# AGENTS.md

## Project Structure

Three independent Three.js Eiffel Tower projects, not a true monorepo — no root `package.json`, no shared workspace config, no shared dependencies.

| Directory | Packages |
|---|---|
| `Eiffel Tower (superpower 1)/` | three 0.169, vite 5.4, vitest 2.1, jsdom |
| `Eiffel Tower (superpower 2)/` | three 0.165, vite 5.2, vitest 1.6, happy-dom |
| `Eiffel Tower (superpower 3)/` | three 0.169, vite 5.4, vitest 2.1, jsdom |

Superpower 2 has its own `AGENTS.md` with detailed architecture and patterns — read it if working in that project.

## Critical: Directory Names Have Spaces

All project directory names contain spaces. In PowerShell, always quote them:

```pwsh
# Correct
cd "Eiffel Tower (superpower 1)"
npm test

# Wrong — will fail
cd Eiffel Tower (superpower 1)
```

When chaining commands, use workdir parameter instead:
```pwsh
bash --workdir "Eiffel Tower (superpower 1)" --command "npm test"
```

## Commands (identical across all three projects)

Always run from within the project directory:

```pwsh
npm run dev           # vite dev server
npm run build         # tsc (typecheck) + vite build
npm run preview       # serve production build
npm test              # vitest run (single pass)
```

No lint, formatter, or pre-commit hooks exist in any project.

## Testing

- Superpowers 1 & 3: test files in `tests/` directory. No DOM environment in vitest config (defaults to node) — test files configure `jsdom` per-file or via docblock.
- Superpower 2: tests co-located at `src/**/*.test.ts`, global `happy-dom` environment via vitest config. `globals: false` — import `describe`/`it`/`expect` from `vitest`. Run single test file: `npm test -- src/viewer/Viewer.test.ts`.

## Key References

- `Prompt.md` — original user prompts and model assignments for each superpower
- `Eiffel Tower (superpower 2)/AGENTS.md` — detailed architecture, key patterns, and testing notes for that project
- `skills-lock.json` in each project is identical — 14 superpower skills from `obra/superpowers`
