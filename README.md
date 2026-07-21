[English](#english) · [Português (Brasil)](#português-brasil)

---

# English

## Cyberfox Web

A web version of [Cyberfox](https://github.com/romulofer/cyberfox) — a tool for
generating markdown context files for AI coding agents. Built with SvelteKit,
Svelte and TypeScript on Bun.

Instead of writing project context files by hand for each AI tool, Cyberfox Web
lets you fill in a structured form and preview the generated markdown in real
time. Download the file with the exact name each agent expects, or copy it to
the clipboard. Everything runs client-side — no account, no backend, no data
leaves your browser.

### Features

- **Live split-pane preview** — markdown updates as you type, no generate button
- **7 built-in AI agents** — each with its canonical output filename
- **Custom agents** — add your own (name + filename) in Settings; persisted
- **Tech Stack**, **Setup Commands**, **Core Features**, **Acceptance Criteria**,
  **What Not To Do** and **Documentation References** sections
- **Save** — download with the canonical filename, or copy to clipboard
- **Shareable URL** — the current form is encoded into the URL to link or bookmark
- **Bilingual UI** — English and Português (Brasil), switchable at runtime
- **Dark mode** — light/dark toggle, persisted
- **Self-hostable** — static site, deploy to GitHub Pages or run via Docker

### Supported AI agents

| Agent          | Output filename           |
| -------------- | ------------------------- |
| Claude Code    | `CLAUDE.md`               |
| Cursor         | `.cursorrules`            |
| Windsurf       | `.windsurfrules`          |
| Cline          | `.clinerules`             |
| GitHub Copilot | `copilot-instructions.md` |
| Aider          | `CONVENTIONS.md`          |
| Devin          | `AGENTS.md`               |

### Getting started

Requires [Bun](https://bun.sh).

```bash
bun install
bun run dev
```

### Scripts

| Command             | Description                                    |
| ------------------- | ---------------------------------------------- |
| `bun run dev`       | Start the dev server with HMR                  |
| `bun run build`     | Produce the static production build (`build/`) |
| `bun run preview`   | Serve the production build locally             |
| `bun run check`     | Type-check with `svelte-check`                 |
| `bun run lint`      | Prettier + ESLint                              |
| `bun run test:unit` | Unit tests (Vitest)                            |
| `bun run test:e2e`  | End-to-end tests (Playwright)                  |
| `bun run test`      | Unit + end-to-end                              |

### Self-hosting with Docker

```bash
docker compose up --build
```

The app is served at <http://localhost:8080>.

### Deploying to GitHub Pages

Pushing to `main` runs the CI workflow (`.github/workflows/ci.yml`): it verifies,
tests, builds with the repository name as the base path, and publishes to Pages.
Enable Pages with the **GitHub Actions** source in the repository settings.

### License

[MIT](LICENSE)

---

# Português (Brasil)

## Cyberfox Web

Versão web do [Cyberfox](https://github.com/romulofer/cyberfox) — ferramenta para
gerar arquivos markdown de contexto para agentes de IA. Feita com SvelteKit,
Svelte e TypeScript sobre o Bun.

Em vez de escrever manualmente os arquivos de contexto para cada ferramenta de
IA, o Cyberfox Web permite preencher um formulário estruturado e visualizar o
markdown gerado em tempo real. Baixe o arquivo com o nome exato que cada agente
espera, ou copie para a área de transferência. Tudo roda no cliente — sem conta,
sem backend, nenhum dado sai do seu navegador.

### Funcionalidades

- **Preview em tempo real** — o markdown atualiza enquanto você digita
- **7 agentes de IA integrados** — cada um com seu nome de arquivo canônico
- **Agentes personalizados** — adicione os seus (nome + arquivo) em Configurações
- Seções de **Tech Stack**, **Comandos de Setup**, **Funcionalidades Principais**,
  **Critérios de Aceite**, **O Que Não Fazer** e **Documentações de Referência**
- **Salvar** — baixe com o nome canônico ou copie para a área de transferência
- **URL compartilhável** — o formulário é codificado na URL para link ou favorito
- **Interface bilíngue** — Português (Brasil) e English, alternável em tempo real
- **Modo escuro** — alternância claro/escuro, persistida
- **Self-hosted** — site estático, deploy no GitHub Pages ou via Docker

### Agentes de IA suportados

| Agente         | Nome do arquivo           |
| -------------- | ------------------------- |
| Claude Code    | `CLAUDE.md`               |
| Cursor         | `.cursorrules`            |
| Windsurf       | `.windsurfrules`          |
| Cline          | `.clinerules`             |
| GitHub Copilot | `copilot-instructions.md` |
| Aider          | `CONVENTIONS.md`          |
| Devin          | `AGENTS.md`               |

### Como começar

Requer [Bun](https://bun.sh).

```bash
bun install
bun run dev
```

### Scripts

| Comando             | Descrição                                    |
| ------------------- | -------------------------------------------- |
| `bun run dev`       | Inicia o servidor de desenvolvimento com HMR |
| `bun run build`     | Gera o build estático de produção (`build/`) |
| `bun run preview`   | Serve o build de produção localmente         |
| `bun run check`     | Verificação de tipos com `svelte-check`      |
| `bun run lint`      | Prettier + ESLint                            |
| `bun run test:unit` | Testes unitários (Vitest)                    |
| `bun run test:e2e`  | Testes end-to-end (Playwright)               |
| `bun run test`      | Unitários + end-to-end                       |

### Self-hosting com Docker

```bash
docker compose up --build
```

O app fica disponível em <http://localhost:8080>.

### Deploy no GitHub Pages

Fazer push para `main` executa o workflow de CI (`.github/workflows/ci.yml`): ele
verifica, testa, faz o build usando o nome do repositório como base path e publica
no Pages. Ative o Pages com a fonte **GitHub Actions** nas configurações do repositório.

### Licença

[MIT](LICENSE)
