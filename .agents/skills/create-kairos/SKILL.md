---
name: create-kairos
description: Use inside kairo-labo when Codex needs to design, scaffold, create, run, inspect, modify, or polish a small standalone kairo under kairos/* using the repo CLI, templates, and gallery workflow.
---

# Create Kairos

Create small, polished, inspectable learning demos. A kairo should answer one
question well enough that the user can study it later.

## Demo Constraints

- Keep one core concept per kairo.
- Default to a 1-2 hour learning scope.
- Prefer `frontend-typescript` for web/browser topics.
- Prefer the TypeScript template for CLI, algorithm, or Node topics.
- Use the repo CLI rather than hand-making demo folders.
- Keep generated kairos standalone; do not add them to `pnpm-workspace.yaml`.
- Avoid new dependencies unless the learning goal specifically requires them.
- Keep core logic short enough to inspect in one sitting.

## Commands

Use these from the repo root:

```bash
pnpm kairo list
pnpm kairo new <name>
pnpm kairo run <name>
pnpm gallery
pnpm gallery:sync
```

Run `pnpm check` before handoff when feasible after code changes. For docs-only
or skill-only changes, validation specific to those files is enough.

## Design Before Creation

Before creating files, present a compact demo proposal unless the user already
gave a concrete implementation request:

- Name: lowercase hyphen-case.
- Core question: one sentence.
- Observation: what the user should see or measure.
- Template: `frontend-typescript` or `typescript`.
- Files likely to change.
- Run command.

Ask for confirmation before creating the kairo when the user is still exploring.

## Creation Workflow

1. Validate the name against existing kairos.
2. Run `pnpm kairo new <name>` with the appropriate template options if
   available.
3. Edit only the new kairo files unless the request requires shared tooling.
4. Add UI only as needed to reveal the concept.
5. Keep explanatory text minimal in the running app; put learning notes in the
   response or a README when requested.
6. Run the demo or the smallest relevant verification.
7. Explain how to observe the behavior.

## Existing Kairo Workflow

When using an existing kairo:

1. Read `package.json`, entry files, and any README first.
2. Identify the core concept the demo currently proves.
3. Run it when behavior matters.
4. Explain through source references and concrete observations.
5. Suggest a small follow-up experiment if the user wants to go deeper.

## Teaching-Oriented Edits

When the user wants to learn by writing code:

- Offer a skeleton or fill-in blanks instead of filling in every core line.
- Review user code before replacing it.
- Prefer small named functions that reveal the concept.
- Add comments only where they clarify non-obvious mechanics.
- Avoid decorative complexity that distracts from the lesson.
