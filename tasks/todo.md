# TODO — cyberfox_web

Checkboxes track execution of `tasks/plan.md`. 🚩 = human-review checkpoint.

## Phase 0 — Scaffold & tooling
- [x] Init SvelteKit + Bun + TS strict + adapter-static
- [x] Configurable base path via `BASE_PATH` env (vite.config.ts, unified kit config)
- [x] Vitest wired (jsdom) + `test:unit` script
- [x] Playwright wired + `test:e2e` script (builds + previews on :4173)
- [x] ESLint + Prettier + prettier-plugin-svelte + `lint`/`format` scripts
- [x] `dev`/`build`/`preview`/`check` scripts
- [x] Svelte 5.56 installed → **runes mode** (forced in vite.config compilerOptions)
- [ ] 🚩 Checkpoint 0: version/runes + base-path approved

## Phase 1 — Core logic (byte-parity gate)
- [x] Types: ProjectConfig, TechStackEntry, SetupCommand, DocumentationReference, AiTarget
- [x] builtInAgents (7 canonical filenames)
- [x] `generateMarkdown(config, strings)` mirrors base_template.dart
- [x] i18n string tables EN + PT-BR
- [x] Golden parity unit tests — 7 pass (empty/full/commands/docrefs/spacing/PT-BR)
- [x] 🚩 Checkpoint 1: byte-parity confirmed

## Phase 2 — Stores & persistence
- [x] settingsStore (language, custom agents, theme) + localStorage, guarded
- [x] projectConfigStore (form state) + config getter/load/reset
- [x] allAgents derived = builtIn + custom
- [x] Unit tests: persistence read/write/guards/corrupt-payload (17 total pass)
- [x] ESLint parser for *.svelte.ts runes modules

## Phase 3 — Home: form + live preview
- [x] +layout.svelte shell (theme + lang effect, header nav via resolve())
- [x] +page.svelte split-pane
- [x] Form: name, description, agent selector
- [x] Editable tables/lists: Tech Stack, Setup Commands, Core Features, Acceptance Criteria, What Not To Do, Documentation References
- [x] Preview pane (marked + DOMPurify) from generator, $derived live
- [x] E2E: load, live update, add row (2 specs, 8 tests pass)
- [x] 🚩 Checkpoint 3: form ⇄ live preview approved

## Phase 4 — Toolbar: download + copy (folded into Phase 3)
- [x] Download blob with canonical filename
- [x] Copy markdown to clipboard
- [x] E2E: filename per agent (CLAUDE.md / AGENTS.md), copy contents

## Phase 5 — Settings: language + custom agents (folded into Phase 3)
- [x] settings/+page.svelte: language switch + theme radios
- [x] Add/remove custom agent (name + filename)
- [x] E2E: language persist, custom agent persist+remove

## Phase 6 — Web extras
- [x] Dark-mode toggle (persisted) — done in Phase 2/3
- [ ] Shareable URL state (serialize + hydrate)
- [ ] PWA/offline (deferred — only if safe)
- [ ] E2E: URL round-trip

## Phase 7 — Deploy
- [ ] Dockerfile + docker-compose.yml (nginx vs Bun — decide)
- [ ] GitHub Actions: install→check→lint→test:unit→test:e2e→build→Pages
- [ ] Verify base-path on Pages subpath
- [ ] 🚩 Checkpoint 7: full test + build + Docker + CI reviewed

## Open items (from SPEC)
- [ ] Svelte 4 stores vs Svelte 5 runes (decide Phase 0)
- [ ] Docker static server: nginx vs Bun (decide Phase 7)
- [ ] PWA scope (decide Phase 6)
