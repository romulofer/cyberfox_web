import { describe, expect, it } from 'vitest';
import { generateMarkdown } from './markdownGenerator';
import { strings } from '../i18n/strings';
import type { ProjectConfig } from '../models/types';
import { builtInAgents } from '../agents/builtInAgents';

const en = strings.en;
const claude = builtInAgents[0];

function baseConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
	return {
		projectName: '',
		description: '',
		targetAi: claude,
		techStack: [],
		setupCommands: [],
		coreFeatures: [],
		acceptanceCriteria: [],
		whatNotToDo: [],
		documentationReferences: [],
		...overrides
	};
}

describe('generateMarkdown — parity with base_template.dart', () => {
	it('renders name + overview only, no description, no sections', () => {
		const md = generateMarkdown(baseConfig({ projectName: 'Empty' }), en);
		expect(md).toBe('# Empty\n\n## Project Overview');
	});

	it('renders description under overview', () => {
		const md = generateMarkdown(
			baseConfig({ projectName: 'Demo', description: 'A demo project.' }),
			en
		);
		expect(md).toBe('# Demo\n\n## Project Overview\n\nA demo project.');
	});

	it('renders every section with the exact reference spacing', () => {
		const config = baseConfig({
			projectName: 'Demo',
			description: 'A demo project.',
			techStack: [{ category: 'Frontend', technology: 'Svelte', versionOrNotes: '5' }],
			setupCommands: [{ command: 'bun install', description: 'Install deps' }],
			coreFeatures: ['Fast', 'Simple'],
			acceptanceCriteria: ['Tests pass'],
			whatNotToDo: ['No secrets'],
			documentationReferences: [{ title: 'Svelte', url: 'https://svelte.dev', description: 'Docs' }]
		});

		const expected = [
			'# Demo',
			'',
			'## Project Overview',
			'',
			'A demo project.',
			'',
			'## Tech Stack',
			'',
			'| Category | Technology | Version / Notes |',
			'|----------|------------|-----------------|',
			'| Frontend | Svelte | 5 |',
			'',
			'## Setup Commands',
			'',
			'| Command | Description |',
			'|---------|-------------|',
			'| `bun install` | Install deps |',
			'',
			'',
			'## Core Features',
			'',
			'- Fast',
			'- Simple',
			'',
			'## Acceptance Criteria',
			'',
			'- Tests pass',
			'',
			'## What Not To Do',
			'',
			'- No secrets',
			'',
			'## Documentation References',
			'',
			'### Svelte',
			'',
			'Docs',
			'',
			'[https://svelte.dev](https://svelte.dev)'
		].join('\n');

		expect(md_of(config)).toBe(expected);
	});

	it('wraps setup commands in backticks', () => {
		const md = generateMarkdown(
			baseConfig({
				projectName: 'X',
				setupCommands: [{ command: 'bun run build', description: 'Build' }]
			}),
			en
		);
		expect(md).toContain('| `bun run build` | Build |');
	});

	it('omits the description block of a doc reference when empty', () => {
		const md = generateMarkdown(
			baseConfig({
				projectName: 'X',
				documentationReferences: [{ title: 'Ref', url: 'https://ex.com', description: '' }]
			}),
			en
		);
		// No description → overview's trailing blank + section's leading blank = double blank.
		expect(md).toBe(
			'# X\n\n## Project Overview\n\n\n## Documentation References\n\n### Ref\n\n[https://ex.com](https://ex.com)'
		);
	});

	it('uses PT-BR headings when given PT-BR strings', () => {
		const md = generateMarkdown(baseConfig({ projectName: 'Proj' }), strings.ptBR);
		expect(md).toBe('# Proj\n\n## Visão Geral do Projeto');
	});
});

function md_of(config: ProjectConfig): string {
	return generateMarkdown(config, en);
}
