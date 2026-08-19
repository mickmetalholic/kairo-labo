---
name: learn-with-kairos
description: "Use inside kairo-labo as the single entry point for technical learning: find and use an existing local kairo when one fits, research official docs when needed, and design, create, run, inspect, modify, or polish the smallest standalone kairo when none exists."
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
4. If the answer depends on current or exact API behavior, use the research
   workflow below before finalizing the teaching.
5. If no suitable kairo exists, read `references/kairo-creation.md` and use it
   to make the smallest useful one. For a concrete request to learn a topic,
   announce the compact proposal and create it without waiting for a second
   skill invocation.
6. If creating or changing a demo, apply the constraints and workflow in that
   reference; do not load it for ordinary learning or research questions.
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

## Research When Needed

Research when the question involves:

- current, latest, recommended, or best-practice guidance;
- exact API timing, lifecycle, errors, compatibility, or limits;
- framework or tool behavior that may have changed by version;
- security, performance, accessibility, or standards;
- contradictions between a local demo and expected behavior.

Skip external research when the user asks only to explain local source code and
the local code is enough. Do not research as ceremony; research when it changes
confidence or correctness.

### Source Priority

1. Local kairos and app code.
2. Official documentation.
3. Official specifications, repositories, changelogs, or release notes.
4. High-signal issue discussions or articles.
5. General search results.

Prefer official sources for facts. Use community sources mainly for pitfalls,
examples, or unresolved behavior.

### Official Source Map

- Browser APIs: MDN first; WHATWG, W3C, or TC39 specs when details matter.
- React: `react.dev`.
- Vite: `vite.dev`.
- TypeScript: `typescriptlang.org`.
- Node.js: `nodejs.org`.
- pnpm: `pnpm.io`.
- Turbo: `turbo.build`.
- OpenAI APIs, Codex, Agents SDK, or model guidance: use the `openai-docs`
  skill if available; otherwise restrict fallback browsing to official OpenAI
  domains.
- npm packages: package README, official docs site, official GitHub releases,
  and changelog.

### Research Workflow

1. State the narrow research question in your own words.
2. Search local code first if the question may map to an existing kairo.
3. Find official docs with precise queries.
4. Fetch or open only the pages needed for the answer.
5. Cross-check version-sensitive claims when possible.
6. Answer with links and concise attribution.
7. Mark anything inferred from docs or observed in a demo as an inference.

### Output Rules

- Include source links when external docs inform the answer.
- Keep direct quotes short; prefer paraphrase.
- Distinguish documented fact, local demo behavior, implementation advice, and
  assumption or inference.
- If sources disagree, state the conflict and avoid pretending certainty.
- If network or docs tooling is unavailable, say so and continue with local
  evidence only.

### Return Research To Learning

After documenting the fact, return it to a local observation:

- point to an existing kairo and run command;
- propose a tiny demo if none exists;
- suggest one focused code change that would reveal the behavior.

## Kairo Selection And Creation

### Select An Existing Kairo First

Treat a kairo as a match only when it makes the user's core question directly
observable. Use an existing kairo when:

- its main concept is the same question the user wants to learn;
- its current behavior can demonstrate the requested point; and
- its source is small enough to inspect without unrelated complexity.

If a kairo is related but only partially useful, use it for the covered part,
state the gap, and avoid creating a duplicate. Extend it only when the change
keeps one core concept; otherwise create a separate kairo.

### When Creation Is Needed

Create or modify a kairo when the user explicitly asks for a demo or experiment,
no existing kairo can make the concept concrete, or a tiny runnable example
would teach better than another explanation. Read
[`references/kairo-creation.md`](references/kairo-creation.md) only at that
point.

For a concrete learning request such as “学一下 X”, “带我理解 X”, or “做个
实验看 X”, treat the request as authorization to create when no suitable kairo
exists. Announce the compact proposal from the reference before changing files;
this is a preview, not a second approval gate. If the user is only asking for a
factual answer or an explanation of existing source, do not create a kairo
unless they ask for an experiment or demo.

## Learning Posture

When the user is trying to learn, do not erase the learning by doing everything
silently. Offer skeletons, fill-in blanks, review, questions, and short
explanations.

When reviewing user-written code, explain what the code demonstrates, ask at
least one understanding question, and only rewrite core logic when the user asks
or the code is blocked.
