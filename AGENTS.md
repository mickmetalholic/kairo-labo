# AGENTS.md

Repository instructions for Codex and other coding agents.

## Project Shape

This repo is a personal kairo lab. The goal is to keep each kairo small, polished,
and easy to study.

- `apps/*` is the only pnpm workspace area.
- `apps/kairo-cli` owns the root kairo CLI and scaffolding templates.
- `apps/kairo-core` owns shared kairo metadata discovery.
- `apps/kairo-gallery` owns the React kairo index and Logseq note links.
- The gallery has a static GitHub Pages mode and a local controller mode.
- `kairos/*` contains generated standalone kairos and must not become workspace
  apps.
- New shared tooling belongs under `apps/*`, not inside `kairos/*`.

## Runtime And Package Manager

- Use Node.js 24 and pnpm 10.
- Respect the Volta pin in `package.json`.
- Use `pnpm` for all package operations.
- Do not introduce Bun-specific APIs or `@types/bun` unless the repo actually
  starts using Bun at runtime.

## Commands

- `pnpm kairo` opens the interactive CLI.
- `pnpm gallery` starts the React kairo gallery.
- Local gallery mode also starts a Node controller for kairo process management,
  SSE logs, and Cursor/VS Code open links.
- `pnpm gallery:sync` regenerates gallery data from `kairos/*`.
- Gallery data is generated into
  `apps/kairo-gallery/public/kairo-data.json` during dev/build and is not
  committed.
- `pnpm kairo new [name]` creates a standalone kairo.
- `pnpm kairo list` lists templates and kairos.
- `pnpm kairo run [name]` starts a kairo through the root CLI.
- `pnpm lint` checks formatting and lint rules.
- `pnpm lint:fix` applies Biome fixes.
- `pnpm apps:build` type-checks apps through Turbo.
- `pnpm apps:test` runs app smoke tests through Turbo.
- `pnpm check` is the main handoff command.

## Code Style

- Follow Biome as the source of truth.
- Use 2 spaces for indentation.
- Use semicolons.
- Use single quotes in TypeScript and JavaScript.
- Use double quotes for JSX/TSX element attributes.
- Use trailing commas for multiline JavaScript and TypeScript structures.

## Kairo Rules

- Keep generated kairos minimal and self-contained.
- Do not add kairos to `pnpm-workspace.yaml`.
- Do not add root-level build or test expectations for kairos.
- Use `frontend-typescript` as the default frontend template until a genuinely
  different stack is needed.
- Prefer DOM and TypeScript basics for learning-focused kairos unless the kairo
  specifically needs another rendering layer.

## CLI Rules

- Keep root scripts necessary and user-facing.
- Prefer routing workflows through the CLI package instead of adding many root
  aliases.
- Keep CLI code split by responsibility; avoid growing `src/cli.ts` into a
  large orchestration file.
- Use existing CLI libraries and UI helpers instead of hand-rolled terminal
  output when possible.

## Verification

- Run `pnpm check` before handing off changes when feasible.
- If dependency installation was touched, also run
  `pnpm install --frozen-lockfile`.
- If only docs or comments changed, `pnpm lint` is usually enough.

## Git Safety

- Do not revert unrelated user changes.
- Do not run destructive Git commands unless explicitly asked.
- Keep generated cache directories out of commits.
