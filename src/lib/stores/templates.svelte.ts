import type { SectionContent, SectionTemplate, TemplateSectionKey } from '../core/models/types';
import { templatesEnabled } from '../core/env';
import { fetchTemplates, saveTemplates } from './templatesApi';

// Persisted, per-section content templates. A template captures the current
// content of one section so it can be reused later. Applying a template appends
// its content to the section, so the user can keep adding after applying.
//
// In the self-hosted deployment templates live on the server (see server/index.ts),
// reached through the /api proxy; localStorage is only a fast, offline cache. On
// GitHub Pages (feature disabled) or dev without the API, the store transparently
// falls back to the cache.
const STORAGE_KEY = 'cyberfox_web.templates.v1';
const canStore = typeof localStorage !== 'undefined';
const isBrowser = typeof window !== 'undefined';

function loadPersisted(): SectionTemplate[] {
	if (!canStore) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as unknown;
		return Array.isArray(parsed) ? (parsed as SectionTemplate[]) : [];
	} catch {
		return [];
	}
}

function newId(): string {
	if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
	return `t_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export class TemplatesStore {
	items = $state<SectionTemplate[]>([]);
	// True once a GET against the API succeeds; gates server writes so we never
	// fire useless requests when self-hosting is not in play.
	private serverAvailable = false;

	constructor() {
		// Paint immediately from the local cache, then reconcile with the server.
		this.items = loadPersisted();
		if (isBrowser && templatesEnabled) void this.syncFromServer();
	}

	// Reconcile the in-memory list with the backend. The server is the source of
	// truth when it has data; when it is empty but the local cache is not (e.g. the
	// first run after upgrading from browser-only storage), push the cache up so
	// nothing is lost.
	async syncFromServer() {
		const remote = await fetchTemplates();
		if (remote === null) return; // no backend reachable — stay on the cache
		this.serverAvailable = true;
		if (remote.length === 0 && this.items.length > 0) {
			void this.pushToServer();
		} else {
			this.items = remote;
			this.cache();
		}
	}

	forSection(section: TemplateSectionKey): SectionTemplate[] {
		return this.items.filter((t) => t.section === section);
	}

	get(id: string): SectionTemplate | undefined {
		return this.items.find((t) => t.id === id);
	}

	save(section: TemplateSectionKey, name: string, content: SectionContent): SectionTemplate {
		// Snapshot to strip any reactive proxy before persisting.
		const snapshot = structuredClone($state.snapshot(content)) as SectionContent;
		const template: SectionTemplate = { id: newId(), section, name, content: snapshot };
		this.items = [...this.items, template];
		this.persist();
		return template;
	}

	// Edit an existing template's name and/or content in place. The section is
	// intentionally fixed once created, since the content shape depends on it.
	update(id: string, patch: { name?: string; content?: SectionContent }) {
		this.items = this.items.map((t) => {
			if (t.id !== id) return t;
			const next: SectionTemplate = { ...t };
			if (patch.name !== undefined) next.name = patch.name;
			if (patch.content !== undefined) {
				next.content = structuredClone($state.snapshot(patch.content)) as SectionContent;
			}
			return next;
		});
		this.persist();
	}

	remove(id: string) {
		this.items = this.items.filter((t) => t.id !== id);
		this.persist();
	}

	// Write the current list to both the local cache and, when reachable, the server.
	persist() {
		this.cache();
		if (this.serverAvailable) void this.pushToServer();
	}

	private cache() {
		if (!canStore) return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
	}

	private async pushToServer() {
		await saveTemplates($state.snapshot(this.items) as SectionTemplate[]);
	}
}

export const templates = new TemplatesStore();
