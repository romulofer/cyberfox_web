# Implementation Plan — cyberfox_web

Derived from `SPEC.md`. Reference app: `~/development/x_platform_apps/cyberfox` (Flutter).

Strategy: **vertical slices**. Each task delivers one complete working path (data →
generator → UI → test), not a horizontal layer. Foundation phases (0–2) are the unavoidable
base the vertical slices stand on. Checkpoints (🚩) are human-review gates between phases.

---

## Dependency graph

```
Phase 0  scaffold + tooling
   │
Phase 1  core logic (models → generator → i18n)      ← pure, unit-tested, no UI
   │        depends on: 0
Phase 2  stores + localStorage persistence
   │        depends on: 1 (models, i18n types)
   ├────────────────────────────┐
Phase 3  home: form + live preview   Phase 5 settings: language + custom agents
   │  depends on: 1,2                    depends on: 1,2  (can start after 3 lands shell)
Phase 4  toolbar: download + copy
   │  depends on: 1,3
Phase 6  web extras: dark mode, URL state
   │  depends on: 2,3
Phase 7  deploy: GitHub Pages CI + Docker
          depends on: 0 (build works); validated after 3–6 green
```

Critical path: 0 → 1 → 2 → 3 → 4 → 7. Phase 5 and 6 branch off and rejoin before 7.

---

## Phase 0 — Scaffold & tooling

Stand up a buildable, lintable, testable SvelteKit + Bun + TS project targeting static export.

- Init SvelteKit app with Bun, TypeScript strict, `@sveltejs/adapter-static`.
- Configure `svelte.config.js` with a **configurable base path** for GitHub Pages subpath.
- Wire Vitest (unit) and Playwright (e2e) with the `bun run` scripts from SPEC §2.
- ESLint + Prettier (+ `prettier-plugin-svelte`).
- Detect installed Svelte version → record runes-vs-stores decision in `tasks/todo.md`.

**Acceptance:** `bun run build`, `bun run check`, `bun run lint`, `bun run test:unit`,
`bun run test:e2e` all execute (empty suites pass). Static build output exists.
**Verify:** run each script; confirm `build/` produced by adapter-static.

🚩 **Checkpoint 0:** confirm Svelte version / runes decision + base-path config before UI work.

---

## Phase 1 — Core logic (models, generator, i18n)

The heart. Pure TypeScript, zero Svelte/DOM. This is the byte-parity gate.

- Port models: `ProjectConfig`, `TechStackEntry`, `SetupCommand`, `DocumentationReference`,
  `AiTarget` as explicit TS types.
- Port `builtInAgents` list (7 agents, canonical filenames) — see SPEC table.
- Port `markdownGenerator(config, strings): string` mirroring `base_template.dart` exactly.
- Port i18n string tables EN + PT-BR (the `AppStrings` keys used by the template + UI).

**Acceptance:** generator output is **byte-identical** to Flutter `buildProjectTemplate`
for the golden cases (empty optionals; all sections; code commands; doc refs ±description;
double blank line before Core Features; final `trimRight()`).
**Verify:** `bun run test:unit` — golden-file parity tests green. Generate the same fixtures
from the Flutter app if needed to produce ground-truth strings.

🚩 **Checkpoint 1:** byte-parity confirmed. Nothing downstream may alter output format.

---

## Phase 2 — Stores & persistence

- `settingsStore`: language, custom agents, theme — synced to `localStorage`, SSR/no-window
  guarded, single wrapper module.
- `projectConfigStore`: the editable form state.
- `allAgents` derived = builtInAgents + custom agents.

**Acceptance:** language/customAgents/theme persist across reload; no `window` access at
module top level; add/remove custom agent updates `allAgents`.
**Verify:** unit tests for read/write/guards; manual reload check in dev.

---

## Phase 3 — Home: form + live preview  (first vertical user path)

Split-pane: editable form left, rendered markdown right, live via `$derived`.

- Layout shell (`+layout.svelte`), home route (`+page.svelte`).
- Form sections bound to `projectConfigStore`: project name, description, agent selector,
  and editable tables/lists for all six sections.
- Preview pane: render `markdownGenerator` output (markdown → HTML renderer).

**Acceptance:** typing anywhere updates preview with no button; all six sections editable
(add/remove rows); agent selector lists all agents.
**Verify E2E (Playwright):** load → default agent Claude Code → type name → preview `# name`
updates live → add/remove a Tech Stack row reflects in preview.

🚩 **Checkpoint 3:** core UX (form ⇄ live preview) approved before layering save/settings.

---

## Phase 4 — Toolbar: download + copy

- Download button: blob with the selected agent's **canonical filename**.
- Copy button: raw markdown to clipboard.

**Acceptance:** filename changes with agent; download contains generator output; copy works.
**Verify E2E:** switch agent → assert download filename per canonical map; click copy →
assert clipboard contents.

---

## Phase 5 — Settings: language + custom agents

- `settings/+page.svelte`: language switch EN ⇄ PT-BR; add/remove custom agent (name+filename).

**Acceptance:** language flips UI + preview headings live and persists; custom agent appears
in home selector and persists across reload.
**Verify E2E:** toggle language → PT-BR headings + reload persists; add custom agent →
appears in selector → reload persists → remove works.

---

## Phase 6 — Web extras

- Dark-mode toggle (persisted).
- Shareable URL state: serialize `projectConfig` into URL, hydrate on load.
- PWA/offline — **deferred**; attempt only if it does not risk base-path/parity.

**Acceptance:** theme persists; URL round-trips a config (open link → same form).
**Verify E2E:** toggle dark mode → reload persists; build a config → copy URL → open in
fresh context → form matches.

---

## Phase 7 — Deploy

- `Dockerfile` + `docker-compose.yml` serving the static build (nginx or Bun static — decide here).
- GitHub Actions: `install → check → lint → test:unit → test:e2e → build → publish Pages`.
- Verify base-path correctness on the Pages subpath.

**Acceptance:** `docker compose up` serves the app; CI pipeline green; Pages build loads
assets under the subpath.
**Verify:** run `docker compose up` locally; dry-run/inspect the Actions workflow; confirm
no broken asset paths in the static build.

🚩 **Checkpoint 7:** full `bun run test` green + build + Docker + CI reviewed → done.

---

## Boundaries carried from SPEC

- **Never author commits. Never push upstream unless the user asks.** (CLAUDE.md)
- No backend/database/telemetry. Fully client-side static.
- Do not deviate from reference markdown output without asking.
