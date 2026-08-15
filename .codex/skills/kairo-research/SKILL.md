---
name: kairo-research
description: Use inside kairo-labo when a learning question needs official documentation, current API behavior, version-specific guidance, browser/framework/tool docs, network search, source citations, or comparison between documented behavior and local kairo demos.
---

# Kairo Research

Use research to make learning answers accurate, current, and source-grounded.
Do not research as ceremony; research when it changes confidence or correctness.

## Source Priority

1. Local kairos and app code.
2. Official docs.
3. Official specifications, repositories, changelogs, or release notes.
4. High-signal issue discussions or articles.
5. General search results.

Prefer official sources for facts. Use community sources mainly for pitfalls,
examples, or unresolved behavior.

## Official Source Map

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

## Research Triggers

Research before teaching when the user asks about:

- latest, current, recommended, best practice, or modern usage.
- exact API timing, lifecycle, errors, compatibility, or limits.
- framework behavior that may have changed by version.
- security, performance, accessibility, or standards.
- contradictions between a local demo and expected behavior.

Skip external research when the user asks only to explain local source code and
the local code is enough.

## Workflow

1. Write the narrow research question in your own words.
2. Search local code first if the question may map to an existing kairo.
3. Find official docs with precise queries.
4. Fetch or open only the pages needed for the answer.
5. Cross-check version-sensitive claims when possible.
6. Answer with links and concise attribution.
7. Mark anything inferred from docs or observed in a demo as an inference.

## Output Rules

- Include source links when external docs inform the answer.
- Keep direct quotes short; prefer paraphrase.
- Distinguish:
  - documented fact,
  - local demo behavior,
  - implementation advice,
  - assumption or inference.
- If sources disagree, state the conflict and avoid pretending certainty.
- If network or docs tooling is unavailable, say so and continue with local
  evidence only.

## Returning To Learning

Research should feed a kairo. After documenting the fact, suggest how the user
can observe it locally:

- Point to an existing kairo and run command.
- Propose a tiny demo if none exists.
- Suggest one focused code change that would reveal the behavior.
