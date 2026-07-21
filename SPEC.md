# SPEC — cyberfox_web

A web port of **Cyberfox**, the desktop Flutter app for generating markdown context
files for AI coding agents. Built with SvelteKit + Svelte + TypeScript, running on Bun.
Deployable as a static site to GitHub Pages, and self-hostable via Docker.

Reference implementation: `~/development/x_platform_apps/cyberfox` (Flutter/Dart).

---

## 1. Objective

### What it is

A single-page web application that lets a user fill in a structured project form and
see a **live markdown preview** of the AI-agent context file it produces. The user then
downloads the file with the exact canonical filename the selected agent expects, or copies
the markdown to the clipboard.

### Target users

Developers who maintain per-agent context files (`CLAUDE.md`, `.cursorrules`, `AGENTS.md`,
etc.) and want a fast, structured way to author them instead of writing markdown by hand.

### Core value

- No "generate" button — preview updates in real time as the form changes.
- One data model produces the correct canonical filename per agent.
- Runs entirely client-side; no account, no backend, no data leaves the browser.

### Feature parity (must match the Flutter app)

- **Live split-pane preview** — left: form, right: rendered markdown, updates on every keystroke.
- **7 built-in AI agents**, each with its canonical output filename (table below).
- **Custom agents** — user adds their own `{ name, filename }` via Settings; persisted.
- **Tech Stack** table — `category`, `technology`, `versionOrNotes`.
- **Setup Commands** table — `command` (code-formatted), `description`.
- **Core Features** — bullet list.
- **Acceptance Criteria** — bullet list.
- **What Not To Do** — bullet list.
- **Documentation References** — `title`, `url`, optional `description`.
- **Bilingual UI** — English and Português (Brasil), switchable at runtime; persisted.
- **Markdown output byte-format** must match `buildProjectTemplate` (see §6 boundary note).

### Built-in agents

| Agent | Output filename |
|---|---|
| Claude Code | `CLAUDE.md` |
| Cursor | `.cursorrules` |
| Windsurf | `.windsurfrules` |
| Cline | `.clinerules` |
| GitHub Copilot | `copilot-instructions.md` |
| Aider | `CONVENTIONS.md` |
| Devin | `AGENTS.md` |

### Web-native extras (beyond parity)

- **Save = blob download + copy-to-clipboard.** Download uses the agent's canonical
  filename. A "Copy" button copies the raw markdown.
- **Persistence via `localStorage`** — language choice and custom agents survive reload.
- **Shareable URL state** — current form serialized into the URL (query/hash) so a config
  can be linked/bookmarked.
- **Dark mode** — light/dark toggle, persisted.
- **PWA / installable** — offline-capable static app (nice-to-have; deferred if it risks
  parity or GitHub Pages base-path correctness).

### Deployment

- **Primary:** static export to **GitHub Pages** via `@sveltejs/adapter-static`.
  Base path must be configurable for the Pages subpath.
- **Self-hosted:** `Dockerfile` + `docker-compose.yml` serving the static build (e.g. nginx
  or a Bun static server).

### Explicit non-goals

- No server-side rendering of user data, no database, no auth, no telemetry.
- No native desktop packaging (that is the Flutter app's job).

---

## 2. Commands

Bun is the runtime and package manager.

| Command | Description |
|---|---|
| `bun install` | Install dependencies |
| `bun run dev` | Start SvelteKit dev server with HMR |
| `bun run build` | Produce static production build |
| `bun run preview` | Serve the production build locally |
| `bun run check` | `svelte-check` + TypeScript type checking |
| `bun run lint` | ESLint + Prettier check |
| `bun run format` | Prettier write |
| `bun run test:unit` | Unit tests (Vitest) — generator + stores |
| `bun run test:e2e` | End-to-end tests (Playwright) |
| `bun run test` | Run unit + e2e |
| `docker compose up` | Build and serve the static site self-hosted |

---

## 3. Project Structure

```
cyberfox_web/
├── src/
│   ├── lib/
│   │   ├── core/
│   │   │   ├── generators/       # markdownGenerator.ts — pure fn, mirrors base_template.dart
│   │   │   ├── i18n/             # app strings EN / PT-BR + language type
│   │   │   ├── models/           # ProjectConfig, TechStackEntry, SetupCommand,
│   │   │   │                     #   DocumentationReference, AiTarget types
│   │   │   └── agents/           # builtInAgents list (canonical filenames)
│   │   ├── stores/               # Svelte stores: projectConfig, settings (lang, custom
│   │   │                         #   agents, theme) with localStorage sync
│   │   └── components/           # form sections, preview pane, editable tables, toolbar
│   ├── routes/
│   │   ├── +layout.svelte        # shell, theme, settings scope
│   │   ├── +page.svelte          # home: split-pane form + live preview
│   │   └── settings/+page.svelte # language + custom agents management
│   ├── app.html
│   └── app.css
├── static/                       # favicon, manifest, icons
├── tests/
│   ├── unit/                     # generator + store unit tests (Vitest)
│   └── e2e/                      # Playwright specs
├── svelte.config.js              # adapter-static + configurable base path
├── vite.config.ts
├── playwright.config.ts
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md                     # bilingual, mirrors reference README
```

Naming: descriptive artifact names (per acceptance criteria). Component files
`PascalCase.svelte`; modules/stores `camelCase.ts`; type names `PascalCase`.

---

## 4. Code Style

- **TypeScript strict mode.** No implicit `any`; model every data shape as an explicit type.
- **Svelte idioms.** Prefer Svelte 5 runes (`$state`, `$derived`, `$effect`) if using
  Svelte 5; otherwise idiomatic stores. Live preview is `$derived` from config, never a
  manual event handler.
- **Pure generator.** `markdownGenerator.ts` is a side-effect-free function
  `(config, strings) => string`. It is the single source of markdown output and the primary
  unit-test target.
- **Separation.** Models and generator hold zero DOM/Svelte imports; components hold zero
  business logic beyond binding.
- **Formatting.** Prettier + `prettier-plugin-svelte`; ESLint with the SvelteKit preset.
- **i18n.** No hardcoded UI strings in components — all through the i18n string tables.
- **Persistence.** localStorage access wrapped in one store module, guarded for SSR/no-window.

---

## 5. Testing Strategy

Acceptance criterion (from CLAUDE.md): **must have end-to-end tests.**

### Unit (Vitest)

- **Generator parity** — golden-file tests asserting `markdownGenerator` output matches the
  Flutter `buildProjectTemplate` byte-for-byte across: empty optional sections, all sections
  populated, code-formatted commands, doc references with/without description, and the
  trailing-whitespace trim.
- **Stores** — language switch, add/remove custom agent, localStorage read/write, theme.

### End-to-end (Playwright)

- App loads; default agent is Claude Code; preview shows `# ` heading live.
- Typing in the form updates the preview without a button press.
- Switching agent changes the download filename to its canonical value.
- Add a custom agent in Settings → it appears in the agent selector → reload persists it.
- Switch language EN ⇄ PT-BR → UI + preview headings change → reload persists.
- Add/remove rows in Tech Stack, Setup Commands, Core Features, Acceptance Criteria,
  What Not To Do, Documentation References → preview reflects changes.
- Download button triggers a download with the correct filename (assert `download` event).
- Copy button writes markdown to clipboard.
- Dark-mode toggle persists across reload.

### CI

- GitHub Actions: `install → check → lint → test:unit → test:e2e → build`. The same build
  step publishes to GitHub Pages on the default branch.

---

## 6. Boundaries

### Always

- Keep markdown output **byte-identical** to the Flutter reference
  (`lib/core/templates/base_template.dart`): section order, table header separators,
  blank-line spacing (note the double blank line before **Core Features**), backticked
  commands, and final `trimRight()`. This is a hard acceptance gate.
- Use descriptive artifact names.
- Keep the app fully client-side and static-deployable to GitHub Pages.
- Provide a working self-hosted Docker path.
- Provide end-to-end tests.
- Follow good development practices (typed, linted, tested, small modules).

### Ask first

- Adding any runtime backend, server, database, or external network call.
- Deviating from the reference markdown output format.
- Adding analytics/telemetry or third-party trackers.
- Pushing to a remote / opening a PR.

### Never

- **Author commits** (per CLAUDE.md).
- **Push upstream** unless the user explicitly asks (per CLAUDE.md).
- Introduce secrets, keys, or data collection.
- Break the GitHub Pages base-path build.

---

## Open items (deferred, non-blocking)

- Svelte 4 stores vs Svelte 5 runes — decide at scaffold time from the installed version.
- PWA/offline — implement only after parity + core extras are green.
- Static server choice for Docker (nginx vs Bun) — decide at Docker task.
