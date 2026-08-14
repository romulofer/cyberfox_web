[Português (Brasil)](#português-brasil) · [English](#english)

**Demo online:** <https://romulofer.github.io/cyberfox_web/>

---

# Português (Brasil)

## Cyberfox Web

**[▶ Abrir o app](https://romulofer.github.io/cyberfox_web/)**

Versão web do [Cyberfox](https://github.com/romulofer/cyberfox), ferramenta para
gerar arquivos markdown de contexto para agentes de IA. Feita com SvelteKit,
Svelte e TypeScript sobre o Bun.

Em vez de escrever manualmente os arquivos de contexto para cada ferramenta de
IA, o Cyberfox Web permite preencher um formulário estruturado e visualizar o
markdown gerado em tempo real. Baixe o arquivo com o nome exato que cada agente
espera, ou copie para a área de transferência. Tudo roda no cliente, sem conta,
sem backend, nenhum dado sai do seu navegador.

### Funcionalidades

- **Preview em tempo real**: o markdown atualiza enquanto você digita
- **7 agentes de IA integrados**: cada um com seu nome de arquivo canônico
- **Agentes personalizados**: adicione os seus (nome + arquivo) em Configurações
- Seções de **Tech Stack**, **Comandos de Setup**, **Funcionalidades Principais**,
  **Fases do Projeto**, **Critérios de Aceite**, **O Que Não Fazer** e
  **Documentações de Referência**
- **Fases do Projeto**: adicione quantas fases quiser, cada uma com nome,
  descrição e lista de tarefas
- **Templates de seção** _(apenas self-hosted / dev)_: salve o conteúdo de
  qualquer seção como template reutilizável e aplique depois; aplicar anexa, então
  você pode continuar adicionando
- **Salvar**: baixe com o nome canônico ou copie para a área de transferência
- **URL compartilhável**: o formulário é codificado na URL para link ou favorito
- **Interface bilíngue**: Português (Brasil) e English, alternável em tempo real
- **Modo escuro**: alternância claro/escuro, persistida
- **Self-hosted**: site estático, deploy no GitHub Pages ou via Docker

### Versão live vs. self-hosted

As funcionalidades são idênticas, **exceto** o CRUD de **templates de seção**, que
fica disponível apenas ao rodar o projeto por conta própria (servidor de
desenvolvimento ou build self-hosted com Docker) e fica oculto na demo pública do
GitHub Pages.

O controle é a flag de build `VITE_TEMPLATES_ENABLED`: os templates ficam ativos
por padrão, e o build do GitHub Pages define `VITE_TEMPLATES_ENABLED=false`. Para
desativar os templates no seu próprio build, defina como `false` também:

```bash
VITE_TEMPLATES_ENABLED=false bun run build
```

| Ambiente                   | CRUD de templates |
| -------------------------- | ----------------- |
| Versão live (GitHub Pages) | Oculto            |
| Dev (`bun run dev`)        | Disponível        |
| Self-hosted (Docker)       | Disponível        |

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

O app fica disponível em <http://localhost:8666>.

### Deploy no GitHub Pages

Fazer push para `main` executa o workflow de CI (`.github/workflows/ci.yml`): ele
verifica, testa, faz o build usando o nome do repositório como base path e publica
no Pages. Ative o Pages com a fonte **GitHub Actions** nas configurações do repositório.

### Licença

[MIT](LICENSE)

---

# English

## Cyberfox Web

**[▶ Open the live app](https://romulofer.github.io/cyberfox_web/)**

A web version of [Cyberfox](https://github.com/romulofer/cyberfox), a tool for
generating markdown context files for AI coding agents. Built with SvelteKit,
Svelte and TypeScript on Bun.

Instead of writing project context files by hand for each AI tool, Cyberfox Web
lets you fill in a structured form and preview the generated markdown in real
time. Download the file with the exact name each agent expects, or copy it to
the clipboard. Everything runs client-side, no account, no backend, no data
leaves your browser.

### Features

- **Live split-pane preview**: markdown updates as you type, no generate button
- **7 built-in AI agents**: each with its canonical output filename
- **Custom agents**: add your own (name + filename) in Settings; persisted
- **Tech Stack**, **Setup Commands**, **Core Features**, **Project Phases**,
  **Acceptance Criteria**, **What Not To Do** and **Documentation References** sections
- **Project phases**: add as many phases as you want, each with a name,
  description and task list
- **Section templates** _(self-hosted / dev only)_: save any section's content as
  a reusable template and apply it later; applying appends, so you can keep adding
- **Save**: download with the canonical filename, or copy to clipboard
- **Shareable URL**: the current form is encoded into the URL to link or bookmark
- **Bilingual UI**: English and Português (Brasil), switchable at runtime
- **Dark mode**: light/dark toggle, persisted
- **Self-hostable**: static site, deploy to GitHub Pages or run via Docker

### Live site vs. self-hosted

The features are identical **except** the **section templates** CRUD, which is
available only when you run the project yourself (dev server or self-hosted
Docker build) and is hidden on the public GitHub Pages demo.

The gate is the build-time flag `VITE_TEMPLATES_ENABLED`: templates are enabled
by default, and the GitHub Pages build sets `VITE_TEMPLATES_ENABLED=false`. To
disable templates in your own build, set it to `false` too:

```bash
VITE_TEMPLATES_ENABLED=false bun run build
```

| Environment              | Templates CRUD |
| ------------------------ | -------------- |
| Live site (GitHub Pages) | Hidden         |
| Dev (`bun run dev`)      | Available      |
| Self-hosted (Docker)     | Available      |

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

The app is served at <http://localhost:8666>.

### Deploying to GitHub Pages

Pushing to `main` runs the CI workflow (`.github/workflows/ci.yml`): it verifies,
tests, builds with the repository name as the base path, and publishes to Pages.
Enable Pages with the **GitHub Actions** source in the repository settings.

### License

[MIT](LICENSE)
