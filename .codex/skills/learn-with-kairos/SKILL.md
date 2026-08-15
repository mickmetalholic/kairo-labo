---
name: learn-with-kairos
description: Use inside kairo-labo when the user asks a technical learning question, wants to learn web/frontend/Node concepts, asks Codex to explain with existing demos, find or create kairos, consult docs, or turn a concept into a small runnable learning experiment.
---

# Learn With Kairos

Use kairo-labo as a learning lab. A good answer should move from an abstract
question to a concrete, inspectable kairo whenever that helps the user learn.

## Repository Model

- `kairos/*` contains standalone learning demos.
- `apps/kairo-cli` owns `pnpm kairo`, scaffolding, and templates.
- `apps/kairo-core` discovers kairo metadata.
- `apps/kairo-gallery` displays kairos and local run controls.
- Prefer the repo's existing CLI and templates over hand-made folders.

## Default Workflow

1. Classify the user's question: concept, API behavior, comparison, debugging,
   demo request, review request, or recap request.
2. Search local kairos first with `rg` and `pnpm kairo list`.
3. If a relevant kairo exists, read the smallest useful source files and teach
   through that demo before giving broad theory.
4. If no useful kairo exists, propose a tiny new kairo. Ask before creating
   files unless the user explicitly asked for implementation.
5. If the answer depends on current or exact API behavior, use
   `kairo-research` style documentation lookup before finalizing the teaching.
6. If creating or changing a demo, use `kairo-demo` style constraints.
7. End with observation tasks or self-check questions when the user is learning,
   not just requesting a factual answer.

## Local Search

Start with fast local discovery:

```bash
pnpm kairo list
rg "concept|api|keyword" kairos apps
rg --files kairos
```

Search likely synonyms. For example, for cancellation search `abort`, `cancel`,
`signal`, `fetch`, and `controller`.

Ignore generated caches such as `node_modules`, `.pnpm-store`, `dist`, and
`.turbo` unless the user is explicitly asking about tooling output.

## Teaching Shape

Prefer this structure when it fits:

1. One-sentence answer.
2. Relevant local kairo, or state that none exists.
3. Mental model.
4. Demo walkthrough with file references and run command.
5. What to observe while running it.
6. Common mistakes or edge cases.
7. Three to five self-check questions.
8. Next small experiment, if useful.

Keep the teaching grounded. If a demo shows only part of a concept, say what it
does and does not prove.

## When To Research

Research before answering when the question involves:

- Current or version-specific behavior.
- Browser API timing, lifecycle, compatibility, or edge cases.
- Framework or tool recommendations.
- Standards, security, performance, or package behavior.
- Any request for latest, official, current, recommended, or best practice.

Use official docs first, cite sources, and clearly separate documented facts,
demo observations, and your teaching interpretation.

## When To Create A Kairo

Create or modify a kairo when:

- The user explicitly asks for a demo or experiment.
- No existing kairo can make the concept concrete.
- A tiny runnable example would teach better than another explanation.

Before creation, propose:

- Kairo name.
- Core question.
- What the user will observe.
- Files likely to change.
- Run command.

Keep one core concept per kairo. If the topic is broad, split it into a first
small experiment and optional follow-up kairos.

## Learning Posture

When the user is trying to learn, do not erase the learning by doing everything
silently. Offer skeletons, fill-in blanks, review, questions, and short
explanations.

When reviewing user-written code, explain what the code demonstrates, ask at
least one understanding question, and only rewrite core logic when the user asks
or the code is blocked.
