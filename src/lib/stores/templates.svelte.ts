import type { SectionContent, SectionTemplate, TemplateSectionKey } from '../core/models/types';
import { templatesEnabled } from '../core/env';
import { parseTemplates } from '../core/models/schema';
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
// Set while local edits have not reached the server yet. It survives reloads, so an
// edit that failed to upload is never replaced by an older server copy.
const DIRTY_KEY = 'cyberfox_web.templates.dirty.v1';
// Wait times between upload retries while the server keeps failing; the last one repeats.
const RETRY_DELAYS_MS = [2000, 5000, 15000, 30000];
const canStore = typeof localStorage !== 'undefined';
const isBrowser = typeof window !== 'undefined';

function loadPersisted(): SectionTemplate[] {
	if (!canStore) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as unknown;
		return parseTemplates(parsed) ?? [];
	} catch {
		return [];
	}
}

function loadDirty(): boolean {
	if (!canStore) return false;
	try {
		return localStorage.getItem(DIRTY_KEY) === '1';
	} catch {
		return false;
	}
}

function saveDirty(dirty: boolean): void {
	if (!canStore) return;
	try {
		if (dirty) localStorage.setItem(DIRTY_KEY, '1');
		else localStorage.removeItem(DIRTY_KEY);
	} catch {
		// Storage unavailable: the in-memory flag still protects this session.
	}
}

// Local edits win over the server copy, but templates that only exist on the server
// are kept. Without per-item deletes a template removed locally while offline can
// come back; that is preferred over silently dropping someone else's templates.
function mergeTemplates(local: SectionTemplate[], remote: SectionTemplate[]): SectionTemplate[] {
	const localById = new Map(local.map((t) => [t.id, t]));
	const remoteIds = new Set(remote.map((t) => t.id));
	return [
		...remote.map((t) => localById.get(t.id) ?? t),
		...local.filter((t) => !remoteIds.has(t.id))
	];
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

function newId(): string {
	if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
	return `t_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export class TemplatesStore {
	items = $state<SectionTemplate[]>([]);
	// Reflects the last upload attempt so the UI can warn when edits are only local.
	syncStatus = $state<SyncStatus>('idle');
	// Resolves when the initial reconcile with the server has finished.
	readonly ready: Promise<void>;

	// True once a request against the API succeeded; gates uploads so we never fire
	// useless requests when self-hosting is not in play. Later failures do not reset it.
	private serverReachable = false;
	// Local edits not yet confirmed by the server. Persisted across reloads.
	private dirty = loadDirty();
	// Incremented on every local write; tells an upload whether newer edits arrived.
	private writeSeq = 0;
	// At most one upload loop runs at a time, so requests cannot arrive out of order.
	private uploading: Promise<void> | null = null;
	private uploadLoopActive = false;
	private retryTimer: ReturnType<typeof setTimeout> | undefined;
	private retryAttempt = 0;
	private readonly onOnline = () => void this.flush();

	constructor() {
		// Paint immediately from the local cache, then reconcile with the server.
		this.items = loadPersisted();
		if (isBrowser && templatesEnabled) {
			window.addEventListener('online', this.onOnline);
			this.ready = this.syncFromServer();
		} else {
			this.ready = Promise.resolve();
		}
	}

	// Reconcile the in-memory list with the backend. The server is the source of
	// truth unless there are local edits it has not seen: those win (merged with
	// server-only templates) and are uploaded. When the server is empty but the
	// local cache is not (e.g. the first run after upgrading from browser-only
	// storage), the cache is pushed up so nothing is lost.
	async syncFromServer() {
		const remote = await fetchTemplates();
		if (remote === null) return; // no backend reachable: stay on the cache
		this.serverReachable = true;
		if (this.dirty) {
			this.items = mergeTemplates(this.items, remote);
			this.cache();
			await this.flush();
		} else if (remote.length === 0 && this.items.length > 0) {
			this.markDirty();
			await this.flush();
		} else {
			this.items = remote;
			this.cache();
		}
	}

	// Stops listening and cancels pending retries. The app keeps one store for its whole
	// life; this exists for tests and for any future short-lived instance.
	dispose() {
		if (isBrowser) window.removeEventListener('online', this.onOnline);
		clearTimeout(this.retryTimer);
	}

	// Resolves when no upload is running (it may have ended in an error).
	async whenSynced(): Promise<void> {
		await this.uploading;
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

	// Write the current list to the local cache and queue an upload to the server.
	persist() {
		this.writeSeq++;
		this.markDirty();
		this.cache();
		void this.flush();
	}

	private cache() {
		if (!canStore) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
		} catch {
			// Quota or private mode: the in-memory list and the server copy still work.
		}
	}

	private markDirty() {
		if (!isBrowser || !templatesEnabled) return;
		this.dirty = true;
		saveDirty(true);
	}

	// Starts (or joins) the upload loop. A no-op until the server is known reachable.
	private flush(): Promise<void> {
		if (!isBrowser || !templatesEnabled || !this.serverReachable || !this.dirty) {
			return this.uploading ?? Promise.resolve();
		}
		if (this.uploadLoopActive) return this.uploading!;
		clearTimeout(this.retryTimer);
		this.uploadLoopActive = true;
		this.uploading = this.uploadLoop();
		return this.uploading;
	}

	// Uploads until the server has seen the latest local state. Edits made while a
	// request is in flight are picked up by the next iteration.
	private async uploadLoop(): Promise<void> {
		try {
			this.syncStatus = 'syncing';
			while (this.dirty) {
				const seqAtStart = this.writeSeq;
				const ok = await saveTemplates($state.snapshot(this.items) as SectionTemplate[]);
				if (!ok) {
					this.syncStatus = 'error';
					this.scheduleRetry();
					return;
				}
				this.retryAttempt = 0;
				if (this.writeSeq === seqAtStart) {
					this.dirty = false;
					saveDirty(false);
				}
			}
			this.syncStatus = 'synced';
		} finally {
			this.uploadLoopActive = false;
		}
	}

	private scheduleRetry() {
		const delay = RETRY_DELAYS_MS[Math.min(this.retryAttempt, RETRY_DELAYS_MS.length - 1)];
		this.retryAttempt++;
		this.retryTimer = setTimeout(() => void this.flush(), delay);
	}
}

export const templates = new TemplatesStore();
