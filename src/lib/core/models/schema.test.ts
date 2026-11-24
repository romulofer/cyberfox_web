import { describe, expect, it } from 'vitest';
import { parseProjectConfig, parseSectionContent, parseTemplate, parseTemplates } from './schema';
import { builtInAgents } from '../agents/builtInAgents';

describe('parseProjectConfig', () => {
	it('fills every missing field with a default', () => {
		const config = parseProjectConfig({});
		expect(config).toEqual({
			projectName: '',
			description: '',
			targetAi: builtInAgents[0],
			techStack: [],
			setupCommands: [],
			coreFeatures: [],
			phases: [],
			acceptanceCriteria: [],
			whatToDo: [],
			whatNotToDo: [],
			documentationReferences: []
		});
	});

	it('does not share default arrays between parses', () => {
		const first = parseProjectConfig({});
		const second = parseProjectConfig({});
		first?.coreFeatures.push('mutated');
		expect(second?.coreFeatures).toEqual([]);
	});

	it('keeps valid data untouched', () => {
		const input = {
			projectName: 'Demo',
			description: 'Desc',
			targetAi: { name: 'Cursor', filename: '.cursorrules' },
			techStack: [{ category: 'a', technology: 'b', versionOrNotes: 'c' }],
			setupCommands: [{ command: 'bun i', description: 'install' }],
			coreFeatures: ['x'],
			phases: [{ name: 'MVP', description: 'd', tasks: ['t'] }],
			acceptanceCriteria: ['y'],
			whatToDo: ['z'],
			whatNotToDo: ['w'],
			documentationReferences: [{ title: 't', url: 'https://e.com', description: 'd' }]
		};
		expect(parseProjectConfig(input)).toEqual(input);
	});

	it('drops unknown keys', () => {
		const config = parseProjectConfig({ projectName: 'X', evil: 1, config: 5 });
		expect(config).not.toBeNull();
		expect(config).not.toHaveProperty('evil');
		expect(config).not.toHaveProperty('config');
	});

	it('ignores a __proto__ key from JSON without touching prototypes', () => {
		const parsed = JSON.parse('{"__proto__":{"polluted":true},"projectName":"X"}');
		const config = parseProjectConfig(parsed);
		expect(config?.projectName).toBe('X');
		expect(Object.getPrototypeOf(config)).toBe(Object.prototype);
		expect(({} as Record<string, unknown>).polluted).toBeUndefined();
	});

	it('drops null and non-object items from item lists', () => {
		const config = parseProjectConfig({
			techStack: [null, 'str', 5, { category: 'a', technology: 'b', versionOrNotes: 'c' }],
			setupCommands: [null],
			documentationReferences: [[]],
			phases: [undefined]
		});
		expect(config?.techStack).toEqual([{ category: 'a', technology: 'b', versionOrNotes: 'c' }]);
		expect(config?.setupCommands).toEqual([]);
		expect(config?.documentationReferences).toEqual([]);
		expect(config?.phases).toEqual([]);
	});

	it('fills missing item fields with empty strings', () => {
		const config = parseProjectConfig({
			techStack: [{ category: 'only-category' }],
			documentationReferences: [{ title: 't', url: 5 }]
		});
		expect(config?.techStack).toEqual([
			{ category: 'only-category', technology: '', versionOrNotes: '' }
		]);
		expect(config?.documentationReferences).toEqual([{ title: 't', url: '', description: '' }]);
	});

	it('gives a phase without tasks an empty task list', () => {
		const config = parseProjectConfig({ phases: [{ name: 'a', description: '' }] });
		expect(config?.phases).toEqual([{ name: 'a', description: '', tasks: [] }]);
	});

	it('drops non-string tasks and non-string list entries', () => {
		const config = parseProjectConfig({
			phases: [{ name: 'a', description: '', tasks: ['ok', 5, null, { x: 1 }] }],
			coreFeatures: ['ok', 5, null]
		});
		expect(config?.phases[0].tasks).toEqual(['ok']);
		expect(config?.coreFeatures).toEqual(['ok']);
	});

	it('returns null when the input is not a plain object', () => {
		expect(parseProjectConfig(null)).toBeNull();
		expect(parseProjectConfig('text')).toBeNull();
		expect(parseProjectConfig(5)).toBeNull();
		expect(parseProjectConfig([])).toBeNull();
	});

	it('returns null when a top-level field has the wrong type', () => {
		expect(parseProjectConfig({ projectName: 5 })).toBeNull();
		expect(parseProjectConfig({ description: {} })).toBeNull();
		expect(parseProjectConfig({ techStack: 'nope' })).toBeNull();
		expect(parseProjectConfig({ phases: {} })).toBeNull();
	});

	it('returns null for an invalid target agent', () => {
		expect(parseProjectConfig({ targetAi: null })).toBeNull();
		expect(parseProjectConfig({ targetAi: { name: 'x' } })).toBeNull();
		expect(parseProjectConfig({ targetAi: { name: 'x', filename: '' } })).toBeNull();
		expect(parseProjectConfig({ targetAi: { name: 5, filename: 'a' } })).toBeNull();
	});
});

describe('parseSectionContent', () => {
	it('accepts a string for description only', () => {
		expect(parseSectionContent('description', 'text')).toBe('text');
		expect(parseSectionContent('description', ['a'])).toBeNull();
	});

	it('normalizes list sections and drops bad entries', () => {
		expect(parseSectionContent('whatToDo', ['a', 5, 'b'])).toEqual(['a', 'b']);
		expect(parseSectionContent('whatToDo', 5)).toBeNull();
	});

	it('rejects a content shape that does not match the section', () => {
		expect(parseSectionContent('techStack', 5)).toBeNull();
		expect(parseSectionContent('phases', 'text')).toBeNull();
		expect(parseSectionContent('documentationReferences', {})).toBeNull();
	});

	it('normalizes object sections', () => {
		expect(parseSectionContent('phases', [{ name: 'a' }, null])).toEqual([
			{ name: 'a', description: '', tasks: [] }
		]);
	});
});

describe('parseTemplate', () => {
	const valid = { id: 't1', section: 'coreFeatures', name: 'Basics', content: ['Auth'] };

	it('accepts a valid template', () => {
		expect(parseTemplate(valid)).toEqual(valid);
	});

	it('rejects unknown sections, empty ids and empty names', () => {
		expect(parseTemplate({ ...valid, section: 'nope' })).toBeNull();
		expect(parseTemplate({ ...valid, id: '' })).toBeNull();
		expect(parseTemplate({ ...valid, name: '' })).toBeNull();
		expect(parseTemplate({ ...valid, id: 5 })).toBeNull();
	});

	it('rejects content that does not match its section', () => {
		expect(parseTemplate({ ...valid, section: 'techStack', content: 5 })).toBeNull();
		expect(parseTemplate({ ...valid, section: 'description', content: ['a'] })).toBeNull();
	});

	it('drops unknown keys', () => {
		const template = parseTemplate({ ...valid, extra: true });
		expect(template).not.toHaveProperty('extra');
	});
});

describe('parseTemplates', () => {
	it('keeps valid templates and drops invalid ones', () => {
		const good = { id: 'a', section: 'whatToDo', name: 'N', content: ['x'] };
		expect(parseTemplates([good, null, { id: 'b' }, 5])).toEqual([good]);
	});

	it('returns null when the input is not an array', () => {
		expect(parseTemplates({})).toBeNull();
		expect(parseTemplates('x')).toBeNull();
	});

	it('drops templates with a duplicate id, keeping the first', () => {
		const a = { id: 'a', section: 'whatToDo', name: 'First', content: ['x'] };
		const b = { id: 'a', section: 'whatToDo', name: 'Second', content: ['y'] };
		expect(parseTemplates([a, b])).toEqual([a]);
	});
});
