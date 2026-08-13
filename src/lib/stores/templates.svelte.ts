import type { SectionContent, SectionTemplate, TemplateSectionKey } from '../core/models/types';

// Persisted, per-section content templates. A template captures the current
// content of one section so it can be reused later. Applying a template appends
// its content to the section, so the user can keep adding after applying.
const STORAGE_KEY = 'cyberfox_web.templates.v1';
const canStore = typeof localStorage !== 'undefined';

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

	constructor() {
		this.items = loadPersisted();
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

	remove(id: string) {
		this.items = this.items.filter((t) => t.id !== id);
		this.persist();
	}

	persist() {
		if (!canStore) return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
	}
}

export const templates = new TemplatesStore();
