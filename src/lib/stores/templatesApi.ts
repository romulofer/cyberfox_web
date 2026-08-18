import type { SectionTemplate } from '$lib/core/models/types';

// Client for the self-hosted templates API (see server/index.ts), reached through
// the nginx /api proxy. Every call is best-effort: when the backend is absent
// (GitHub Pages, or dev without the API running) the functions resolve to a
// falsy value and the caller falls back to the localStorage cache.
const BASE = '/api';

export async function fetchTemplates(): Promise<SectionTemplate[] | null> {
	try {
		const res = await fetch(`${BASE}/templates`, { headers: { accept: 'application/json' } });
		if (!res.ok) return null;
		const data: unknown = await res.json();
		return Array.isArray(data) ? (data as SectionTemplate[]) : null;
	} catch {
		return null;
	}
}

export async function saveTemplates(items: SectionTemplate[]): Promise<boolean> {
	try {
		const res = await fetch(`${BASE}/templates`, {
			method: 'PUT',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(items)
		});
		return res.ok;
	} catch {
		return false;
	}
}
