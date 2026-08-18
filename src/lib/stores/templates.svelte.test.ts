import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TemplatesStore } from './templates.svelte';
import type { SectionTemplate, TechStackEntry } from '../core/models/types';

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

	it('updates an existing template name and content', () => {
		const store = new TemplatesStore();
		const saved = store.save('coreFeatures', 'Basics', ['Auth']);
		store.update(saved.id, { name: 'Essentials', content: ['Auth', 'Logging'] });
		const updated = store.get(saved.id);
		expect(updated?.name).toBe('Essentials');
		expect(updated?.content).toEqual(['Auth', 'Logging']);
		// The section stays fixed and no duplicate is created.
		expect(store.forSection('coreFeatures')).toHaveLength(1);
	});

	it('snapshots content on update so later source edits do not leak in', () => {
		const store = new TemplatesStore();
		const saved = store.save('techStack', 'Web', []);
		const source: TechStackEntry[] = [
			{ category: 'Frontend', technology: 'Svelte', versionOrNotes: '5' }
		];
		store.update(saved.id, { content: source });
		source[0].technology = 'Mutated';
		expect((store.get(saved.id)?.content as TechStackEntry[])[0].technology).toBe('Svelte');
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

describe('TemplatesStore server sync', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('adopts the server list when the server has data', async () => {
		const remote: SectionTemplate[] = [
			{ id: 'srv-1', section: 'coreFeatures', name: 'From server', content: ['Auth'] }
		];
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(remote) })
		);

		const store = new TemplatesStore();
		await store.syncFromServer();

		expect(store.items).toEqual(remote);
		expect(JSON.parse(localStorage.getItem('cyberfox_web.templates.v1')!)).toEqual(remote);
	});

	it('pushes the local cache up when the server is empty but the cache is not', async () => {
		localStorage.setItem(
			'cyberfox_web.templates.v1',
			JSON.stringify([{ id: 'local-1', section: 'coreFeatures', name: 'Local', content: ['A'] }])
		);
		const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
		vi.stubGlobal('fetch', fetchMock);

		const store = new TemplatesStore();
		await store.syncFromServer();

		expect(store.items).toHaveLength(1);
		expect(fetchMock).toHaveBeenCalledWith(
			'/api/templates',
			expect.objectContaining({ method: 'PUT' })
		);
	});

	it('leaves the local cache untouched when no backend is reachable', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no backend')));

		const store = new TemplatesStore();
		store.save('coreFeatures', 'Offline', ['A']);
		await store.syncFromServer();

		expect(store.forSection('coreFeatures')).toHaveLength(1);
	});

	it('pushes to the server on save once the server is known reachable', async () => {
		const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
		vi.stubGlobal('fetch', fetchMock);

		const store = new TemplatesStore();
		await store.syncFromServer();
		fetchMock.mockClear();

		store.save('coreFeatures', 'New', ['A']);
		await Promise.resolve();

		expect(fetchMock).toHaveBeenCalledWith(
			'/api/templates',
			expect.objectContaining({ method: 'PUT' })
		);
	});
});
