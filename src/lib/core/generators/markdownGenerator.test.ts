import { describe, expect, it } from 'vitest';
import { generateMarkdown } from './markdownGenerator';
import { strings } from '../i18n/strings';
import type { ProjectConfig } from '../models/types';
import { builtInAgents } from '../agents/builtInAgents';
import { renderMarkdown } from '../../preview/renderMarkdown';

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
		phases: [],
		acceptanceCriteria: [],
		whatToDo: [],
		whatNotToDo: [],
		documentationReferences: [],
		...overrides
	};
}

describe('generateMarkdown', () => {
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

	it('renders every section with a single blank line between blocks', () => {
		const config = baseConfig({
			projectName: 'Demo',
			description: 'A demo project.',
			techStack: [{ category: 'Frontend', technology: 'Svelte', versionOrNotes: '5' }],
			setupCommands: [{ command: 'bun install', description: 'Install deps' }],
			coreFeatures: ['Fast', 'Simple'],
			acceptanceCriteria: ['Tests pass'],
			whatToDo: ['Validate input'],
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
			'## Core Features',
			'',
			'- Fast',
			'- Simple',
			'',
			'## Acceptance Criteria',
			'',
			'- Tests pass',
			'',
			'## What To Do',
			'',
			'- Validate input',
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
		// No description → a single blank line separates the overview from the next section.
		expect(md).toBe(
			'# X\n\n## Project Overview\n\n## Documentation References\n\n### Ref\n\n[https://ex.com](https://ex.com)'
		);
	});

	it('renders numbered phases with description and tasks', () => {
		const md = generateMarkdown(
			baseConfig({
				projectName: 'X',
				phases: [
					{ name: 'MVP', description: 'Initial setup.', tasks: ['Set up repo', 'Auth'] },
					{ name: 'Beta', description: '', tasks: ['Deploy CI'] }
				]
			}),
			en
		);
		expect(md).toBe(
			[
				'# X',
				'',
				'## Project Overview',
				'',
				'## Project Phases',
				'',
				'### Phase 1: MVP',
				'',
				'Initial setup.',
				'',
				'- Set up repo',
				'- Auth',
				'',
				'### Phase 2: Beta',
				'',
				'- Deploy CI'
			].join('\n')
		);
	});

	it('numbers a phase without a name', () => {
		const md = generateMarkdown(
			baseConfig({ projectName: 'X', phases: [{ name: '', description: '', tasks: ['Do it'] }] }),
			en
		);
		expect(md).toContain('### Phase 1');
		expect(md).not.toContain('Phase 1:');
	});

	it('uses PT-BR headings when given PT-BR strings', () => {
		const md = generateMarkdown(baseConfig({ projectName: 'Proj' }), strings.ptBR);
		expect(md).toBe('# Proj\n\n## Visão Geral do Projeto');
	});
});

describe('generateMarkdown: table cell escaping', () => {
	it('escapes pipes inside setup command code spans', () => {
		const md = generateMarkdown(
			baseConfig({
				projectName: 'X',
				setupCommands: [{ command: 'cat a | grep b', description: 'Filter' }]
			}),
			en
		);
		expect(md).toContain('| `cat a \\| grep b` | Filter |');
	});

	it('keeps a piped command in a single table cell when rendered', () => {
		const md = generateMarkdown(
			baseConfig({
				projectName: 'X',
				setupCommands: [{ command: 'cat a | grep b', description: 'Filter' }]
			}),
			en
		);
		const container = document.createElement('div');
		container.innerHTML = renderMarkdown(md);
		const cells = container.querySelectorAll('tbody td');
		expect(cells).toHaveLength(2);
		expect(cells[0].textContent).toBe('cat a | grep b');
	});

	it('escapes pipes and flattens newlines in tech stack cells', () => {
		const md = generateMarkdown(
			baseConfig({
				projectName: 'X',
				techStack: [{ category: 'a|b', technology: 'line1\nline2', versionOrNotes: '5' }]
			}),
			en
		);
		expect(md).toContain('| a\\|b | line1 line2 | 5 |');
	});

	it('escapes pipes in setup command descriptions', () => {
		const md = generateMarkdown(
			baseConfig({
				projectName: 'X',
				setupCommands: [{ command: 'ls', description: 'a | b' }]
			}),
			en
		);
		expect(md).toContain('| `ls` | a \\| b |');
	});
});

describe('generateMarkdown: blank entries', () => {
	const blankHeavy = baseConfig({
		projectName: 'X',
		description: 'Desc',
		techStack: [
			{ category: '', technology: '', versionOrNotes: '' },
			{ category: 'Frontend', technology: 'Svelte', versionOrNotes: '' }
		],
		setupCommands: [
			{ command: '', description: '' },
			{ command: '   ', description: 'orphan description' },
			{ command: 'bun install', description: '' }
		],
		coreFeatures: ['', '  ', 'Fast'],
		acceptanceCriteria: ['', 'Tests pass'],
		whatToDo: [''],
		whatNotToDo: ['No secrets', ''],
		phases: [
			{ name: '', description: '', tasks: [] },
			{ name: 'MVP', description: '', tasks: ['', 'Ship'] }
		],
		documentationReferences: [
			{ title: '', url: '', description: '' },
			{ title: 'Svelte', url: 'https://svelte.dev', description: '' }
		]
	});

	const withoutBlanks = baseConfig({
		projectName: 'X',
		description: 'Desc',
		techStack: [{ category: 'Frontend', technology: 'Svelte', versionOrNotes: '' }],
		setupCommands: [{ command: 'bun install', description: '' }],
		coreFeatures: ['Fast'],
		acceptanceCriteria: ['Tests pass'],
		whatToDo: [],
		whatNotToDo: ['No secrets'],
		phases: [{ name: 'MVP', description: '', tasks: ['Ship'] }],
		documentationReferences: [{ title: 'Svelte', url: 'https://svelte.dev', description: '' }]
	});

	it('produces the same output as the config without blank entries', () => {
		expect(generateMarkdown(blankHeavy, en)).toBe(generateMarkdown(withoutBlanks, en));
	});

	it('numbers phases after dropping blank ones', () => {
		expect(generateMarkdown(blankHeavy, en)).toContain('### Phase 1: MVP');
	});

	it('emits no section when every entry is blank', () => {
		const md = generateMarkdown(
			baseConfig({
				projectName: 'X',
				techStack: [{ category: '', technology: '', versionOrNotes: '' }],
				setupCommands: [{ command: '', description: '' }],
				coreFeatures: [''],
				phases: [{ name: '', description: '', tasks: [''] }],
				documentationReferences: [{ title: '', url: '', description: '' }]
			}),
			en
		);
		expect(md).toBe('# X\n\n## Project Overview');
	});

	it('uses the URL as heading when a documentation reference has no title', () => {
		const md = generateMarkdown(
			baseConfig({
				projectName: 'X',
				documentationReferences: [{ title: '', url: 'https://ex.com', description: '' }]
			}),
			en
		);
		expect(md).toContain('### https://ex.com');
	});

	it('omits the link line when a documentation reference has no URL', () => {
		const md = generateMarkdown(
			baseConfig({
				projectName: 'X',
				documentationReferences: [{ title: 'Notes', url: '', description: 'Internal' }]
			}),
			en
		);
		expect(md).toBe(
			'# X\n\n## Project Overview\n\n## Documentation References\n\n### Notes\n\nInternal'
		);
	});

	it('never emits two consecutive blank lines outside user text', () => {
		expect(generateMarkdown(blankHeavy, en)).not.toMatch(/\n\n\n/);
		expect(generateMarkdown(baseConfig({ projectName: 'X', coreFeatures: ['A'] }), en)).not.toMatch(
			/\n\n\n/
		);
	});

	it('leaves blank lines inside the description untouched', () => {
		const description = 'Line one\n\n\n```\ncode\n\n\nmore\n```';
		const md = generateMarkdown(baseConfig({ projectName: 'X', description }), en);
		expect(md).toContain(description);
	});
});

function md_of(config: ProjectConfig): string {
	return generateMarkdown(config, en);
}
