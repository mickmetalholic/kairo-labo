<p align="center">
  <img src="./assets/logo.png" alt="Kairo Labo logo" width="180" />
</p>

<h1 align="center">Kairo Labo</h1>

<p align="center">
  A small technology lab for polished coding experiments, tiny prototypes, and
  notes that actually stay findable.
</p>

<p align="center">
  <strong>kairo</strong> = circuit, pathway, and little experimental loop.
</p>

---

## ✨ What Is This?

`kairo-labo` is a personal monorepo for small, standalone experiments.

Each kairo lives in its own folder, stays easy to inspect, and can be launched
from a root CLI or browsed through the gallery. Think of it as a neat shelf for
little ideas before they turn into bigger systems.

## 🚀 Quick Start

Requirements:

- Node.js 24+
- pnpm 10+
- Go 1.22+ for Go kairos

Open the interactive CLI:

```bash
pnpm kairo
```

Open the web gallery:

```bash
pnpm dev
```

Inspect templates and existing kairos:

```bash
pnpm kairo list
pnpm kairo --help
```

## 🧪 Create And Run

Open the guided create wizard:

```bash
pnpm kairo new
```

Create a kairo directly:

```bash
pnpm kairo new raf-basic
pnpm kairo raf-basic
pnpm kairo new go-basics --template go
```

Run an existing kairo:

```bash
pnpm kairo run raf-basic
pnpm kairo run go-basics
```

Go kairos are standalone Go modules. The CLI runs them with `go run .`, and
their tests can be checked directly with `go test ./...`.

## 🖼️ Gallery Mode

`pnpm gallery` runs the same local pipeline as `pnpm dev`.

The Gallery lists frontend kairos with browser previews. Command kairos remain
available through their own toolchains and the root CLI.

Locally, Turbo starts the standalone kairo server and the Vite gallery together.
The server can:

- start frontend kairos
- stream process output into a stable terminal panel
- open source files in Cursor or VS Code

On GitHub Pages, the gallery becomes a static index with Logseq links and
copyable run commands.

The gallery data is generated during dev/build into:

```text
apps/kairo-gallery/public/kairo-data.json
```

That file is a build artifact and is not committed. Each kairo is identified by
its `kairos/<id>` folder name, and the gallery derives its Logseq page as
`kairo-<id>`.

## 🧰 Workflow

Quality commands:

```bash
pnpm check
pnpm gallery:sync
pnpm lint
pnpm lint:fix
pnpm apps:build
pnpm apps:test
pnpm kairo list
```

Git automation:

- `pre-commit`: runs `lint-staged` and auto-fixes staged code with Biome
- `commit-msg`: runs `commitlint` with the conventional commit preset

CI runs the same quality path: repository lint, app builds, and app tests.
Generated kairos stay standalone and are not workspace apps.

## 🗂️ Project Map

```text
apps/
  kairo-cli       root CLI and scaffolding templates
  kairo-core      shared kairo metadata scanner
  kairo-gallery   React gallery and Logseq links
  kairo-server    local controller for running kairos

kairos/
  *               generated standalone kairo folders

assets/
  logo.png        project logo
```

Workspace apps resolve Vite through the pnpm catalog in `pnpm-workspace.yaml`.
The kairo scaffold reads that same catalog value, so new frontend kairos start
with the repo's current Vite version.

## 📦 Publishing

GitHub Pages publishes the kairo gallery automatically from `main`.
