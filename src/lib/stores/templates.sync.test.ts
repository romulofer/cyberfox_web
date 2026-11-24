import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SectionTemplate } from '../core/models/types';

vi.mock('./templatesApi', () => ({
	fetchTemplates: vi.fn(async () => null),
	saveTemplates: vi.fn(async () => true)
}));

import { fetchTemplates, saveTemplates } from './templatesApi';
import { TemplatesStore as RealTemplatesStore } from './templates.svelte';

// Every store registers a window listener, so tests create them through this wrapper
// and dispose of them afterwards.
const created: RealTemplatesStore[] = [];
class TemplatesStore extends RealTemplatesStore {
	constructor() {
		super();
		created.push(this);
	}
}

const fetchMock = vi.mocked(fetchTemplates);
const saveMock = vi.mocked(saveTemplates);

const CACHE_KEY = 'cyberfox_web.templates.v1';
const DIRTY_KEY = 'cyberfox_web.templates.dirty.v1';

function template(id: string, name = id): SectionTemplate {
	return { id, section: 'coreFeatures', name, content: ['x'] };
}

function deferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((r) => (resolve = r));
	return { promise, resolve };
}

function lastSaved(): SectionTemplate[] {
	return saveMock.mock.calls.at(-1)![0];
}

beforeEach(() => {
	localStorage.clear();
	vi.useFakeTimers();
	fetchMock.mockReset();
	saveMock.mockReset();
});

afterEach(() => {
	for (const store of created.splice(0)) store.dispose();
	vi.useRealTimers();
});

describe('TemplatesStore sync: initial reconcile', () => {
	it('adopts the server list when nothing is pending locally', async () => {
		fetchMock.mockResolvedValue([template('srv')]);
		const store = new TemplatesStore();
		await store.ready;

		expect(store.items).toEqual([template('srv')]);
		expect(saveMock).not.toHaveBeenCalled();
		expect(JSON.parse(localStorage.getItem(CACHE_KEY)!)).toEqual([template('srv')]);
	});

	it('pushes the local cache up when the server is empty', async () => {
		localStorage.setItem(CACHE_KEY, JSON.stringify([template('local')]));
		fetchMock.mockResolvedValue([]);
		saveMock.mockResolvedValue(true);

		const store = new TemplatesStore();
		await store.ready;

		expect(lastSaved()).toEqual([template('local')]);
		expect(store.syncStatus).toBe('synced');
	});

	it('keeps edits made while the first request is still in flight, merged with the server list', async () => {
		const first = deferred<SectionTemplate[] | null>();
		fetchMock.mockReturnValue(first.promise);
		saveMock.mockResolvedValue(true);

		const store = new TemplatesStore();
		store.save('coreFeatures', 'Mine', ['x']);
		first.resolve([template('srv')]);
		await store.ready;
		await store.whenSynced();

		const names = store.items.map((t) => t.name);
		expect(names).toEqual(['srv', 'Mine']);
		expect(lastSaved().map((t) => t.name)).toEqual(['srv', 'Mine']);
	});

	it('does not push anything when no backend is reachable, but remembers the edit as pending', async () => {
		fetchMock.mockResolvedValue(null);
		const store = new TemplatesStore();
		await store.ready;

		store.save('coreFeatures', 'Offline', ['x']);

		expect(saveMock).not.toHaveBeenCalled();
		expect(localStorage.getItem(DIRTY_KEY)).toBe('1');
		expect(store.items).toHaveLength(1);
	});
});

describe('TemplatesStore sync: failures never lose edits', () => {
	it('keeps pending edits, retries with backoff, and finally sends everything', async () => {
		fetchMock.mockResolvedValue([]);
		saveMock.mockResolvedValueOnce(false).mockResolvedValueOnce(false).mockResolvedValue(true);
		const store = new TemplatesStore();
		await store.ready;

		store.save('coreFeatures', 'A', ['x']);
		await store.whenSynced();
		expect(store.syncStatus).toBe('error');

		// A second edit during the outage must not be dropped.
		store.save('coreFeatures', 'B', ['x']);
		await store.whenSynced();
		expect(store.syncStatus).toBe('error');
		expect(localStorage.getItem(DIRTY_KEY)).toBe('1');

		await vi.advanceTimersByTimeAsync(5000);
		await store.whenSynced();

		expect(store.syncStatus).toBe('synced');
		expect(lastSaved().map((t) => t.name)).toEqual(['A', 'B']);
		expect(localStorage.getItem(DIRTY_KEY)).toBeNull();
	});

	it('retries when the browser comes back online', async () => {
		fetchMock.mockResolvedValue([]);
		saveMock.mockResolvedValueOnce(false).mockResolvedValue(true);
		const store = new TemplatesStore();
		await store.ready;

		store.save('coreFeatures', 'A', ['x']);
		await store.whenSynced();
		expect(store.syncStatus).toBe('error');

		window.dispatchEvent(new Event('online'));
		await store.whenSynced();

		expect(store.syncStatus).toBe('synced');
		expect(saveMock).toHaveBeenCalledTimes(2);
	});

	it('a reload after a failed push keeps the local edit instead of overwriting it', async () => {
		fetchMock.mockResolvedValue([template('old')]);
		saveMock.mockResolvedValueOnce(false);
		const first = new TemplatesStore();
		await first.ready;
		first.save('coreFeatures', 'Unsaved', ['x']);
		await first.whenSynced();
		expect(first.syncStatus).toBe('error');

		saveMock.mockResolvedValue(true);
		const reloaded = new TemplatesStore();
		await reloaded.ready;
		await reloaded.whenSynced();

		expect(reloaded.items.map((t) => t.name)).toEqual(['old', 'Unsaved']);
		expect(lastSaved().map((t) => t.name)).toEqual(['old', 'Unsaved']);
		expect(localStorage.getItem(DIRTY_KEY)).toBeNull();
	});

	it('after a successful push, a reload adopts the server again', async () => {
		fetchMock.mockResolvedValue([]);
		saveMock.mockResolvedValue(true);
		const first = new TemplatesStore();
		await first.ready;
		first.save('coreFeatures', 'Saved', ['x']);
		await first.whenSynced();
		expect(localStorage.getItem(DIRTY_KEY)).toBeNull();

		fetchMock.mockResolvedValue([template('other')]);
		const reloaded = new TemplatesStore();
		await reloaded.ready;

		expect(reloaded.items).toEqual([template('other')]);
	});
});

describe('TemplatesStore sync: ordering', () => {
	it('never has two requests in flight and the latest state always wins', async () => {
		fetchMock.mockResolvedValue([]);
		let inFlight = 0;
		let maxInFlight = 0;
		const gates: ReturnType<typeof deferred<boolean>>[] = [];
		saveMock.mockImplementation(() => {
			inFlight++;
			maxInFlight = Math.max(maxInFlight, inFlight);
			const gate = deferred<boolean>();
			gates.push(gate);
			return gate.promise.finally(() => inFlight--);
		});
		const store = new TemplatesStore();
		await store.ready;

		store.save('coreFeatures', 'A', ['x']);
		store.save('coreFeatures', 'B', ['x']);
		store.save('coreFeatures', 'C', ['x']);
		expect(saveMock).toHaveBeenCalledTimes(1);

		gates[0].resolve(true);
		await vi.advanceTimersByTimeAsync(0);
		expect(saveMock).toHaveBeenCalledTimes(2);
		expect(lastSaved().map((t) => t.name)).toEqual(['A', 'B', 'C']);

		gates[1].resolve(true);
		await store.whenSynced();

		expect(maxInFlight).toBe(1);
		expect(saveMock).toHaveBeenCalledTimes(2);
		expect(store.syncStatus).toBe('synced');
		expect(localStorage.getItem(DIRTY_KEY)).toBeNull();
	});
});
