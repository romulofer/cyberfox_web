# AGENTS.md

Guidance for AI agents working in this repository.

## Writing style

- Do not use em dashes. Use commas, parentheses, or separate sentences instead.

## Conventions

- Runtime and package manager: Bun.
- Framework: SvelteKit with Svelte 5 runes and TypeScript (strict).
- Generated markdown must be valid GFM: table cells are escaped, blank entries are skipped, and blocks are separated by one blank line. `markdownGenerator.test.ts` is the reference for the exact output.
- Run `bun run check`, `bun run lint`, `bun run test:unit`, and `bun run test:e2e`
  before considering a change complete.
