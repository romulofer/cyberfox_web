import { beforeEach, describe, expect, it } from 'vitest';
import { TemplatesStore } from './templates.svelte';
import type { TechStackEntry } from '../core/models/types';

describe('TemplatesStore', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it('saves a template and lists it by section', () => {
		const store = new TemplatesStore();
		store.save('coreFeatures', 'Basics', ['Auth', 'Logging']);
		expect(store.forSection('coreFeatures')).toHaveLength(1);
		expect(store.forSection('coreFeatures')[0].name).toBe('Basics');
		expect(store.forSection('techStack')).toHaveLength(0);
	});

	it('snapshots content so later source edits do not leak in', () => {
		const store = new TemplatesStore();
		const source: TechStackEntry[] = [
			{ category: 'Frontend', technology: 'Svelte', versionOrNotes: '5' }
		];
		const saved = store.save('techStack', 'Web', source);
		source[0].technology = 'Mutated';
		expect((saved.content as TechStackEntry[])[0].technology).toBe('Svelte');
	});

	it('removes a template by id', () => {
		const store = new TemplatesStore();
		const saved = store.save('whatNotToDo', 'Rules', ['No secrets']);
		store.remove(saved.id);
		expect(store.get(saved.id)).toBeUndefined();
		expect(store.forSection('whatNotToDo')).toHaveLength(0);
	});

	it('persists across store instances via localStorage', () => {
		new TemplatesStore().save('phases', 'Roadmap', [
			{ name: 'MVP', description: 'Start', tasks: ['Repo'] }
		]);
		const reloaded = new TemplatesStore();
		expect(reloaded.forSection('phases')).toHaveLength(1);
		expect(reloaded.forSection('phases')[0].name).toBe('Roadmap');
	});
});
