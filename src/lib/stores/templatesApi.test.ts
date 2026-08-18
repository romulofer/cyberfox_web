import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchTemplates, saveTemplates } from './templatesApi';
import type { SectionTemplate } from '../core/models/types';

const sample: SectionTemplate[] = [
	{ id: '1', section: 'coreFeatures', name: 'Basics', content: ['Auth'] }
];

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('fetchTemplates', () => {
	it('returns the parsed array on a successful response', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(sample) })
		);
		expect(await fetchTemplates()).toEqual(sample);
	});

	it('returns null when the response is not ok', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
		expect(await fetchTemplates()).toBeNull();
	});

	it('returns null when the payload is not an array', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ not: 'an array' }) })
		);
		expect(await fetchTemplates()).toBeNull();
	});

	it('returns null when fetch rejects (no backend reachable)', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
		expect(await fetchTemplates()).toBeNull();
	});
});

describe('saveTemplates', () => {
	it('returns true on a successful PUT', async () => {
		const fetchMock = vi.fn().mockResolvedValue({ ok: true });
		vi.stubGlobal('fetch', fetchMock);

		expect(await saveTemplates(sample)).toBe(true);
		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toBe('/api/templates');
		expect(init.method).toBe('PUT');
		expect(JSON.parse(init.body)).toEqual(sample);
	});

	it('returns false when the response is not ok', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
		expect(await saveTemplates(sample)).toBe(false);
	});

	it('returns false when fetch rejects', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
		expect(await saveTemplates(sample)).toBe(false);
	});
});
