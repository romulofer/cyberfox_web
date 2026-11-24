import type { AiTarget } from '../core/models/types';
import type { Language } from '../core/i18n/strings';
import { builtInAgents } from '../core/agents/builtInAgents';
import { agentFilenameKey, parseSettings } from '../core/models/schema';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'cyberfox_web.settings.v1';
const canStore = typeof localStorage !== 'undefined';

interface Persisted {
	language: Language;
	theme: Theme;
	customAgents: AiTarget[];
}

function loadPersisted(): Partial<Persisted> {
	if (!canStore) return {};
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? parseSettings(JSON.parse(raw)) : {};
	} catch {
		return {};
	}
}

export class SettingsStore {
	language = $state<Language>('ptBR');
	theme = $state<Theme>('light');
	customAgents = $state<AiTarget[]>([]);
	// True when the last write to localStorage failed (quota, private mode). Settings
	// keep working in memory for the current session.
	persistFailed = $state(false);

	constructor() {
		const p = loadPersisted();
		if (p.language) this.language = p.language;
		if (p.theme) this.theme = p.theme;
		if (p.customAgents) this.customAgents = p.customAgents;
	}

	get allAgents(): AiTarget[] {
		return [...builtInAgents, ...this.customAgents];
	}

	setLanguage(language: Language) {
		this.language = language;
		this.persist();
	}

	toggleLanguage() {
		this.setLanguage(this.language === 'en' ? 'ptBR' : 'en');
	}

	setTheme(theme: Theme) {
		this.theme = theme;
		this.persist();
	}

	toggleTheme() {
		this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
	}

	// Returns why an agent was not added, so the caller can tell the user.
	addCustomAgent(agent: AiTarget): 'added' | 'empty' | 'duplicate' {
		const name = agent.name.trim();
		const filename = agent.filename.trim();
		if (!name || !filename) return 'empty';
		const key = agentFilenameKey(filename);
		if (this.allAgents.some((existing) => agentFilenameKey(existing.filename) === key)) {
			return 'duplicate';
		}
		this.customAgents = [...this.customAgents, { name, filename }];
		this.persist();
		return 'added';
	}

	removeCustomAgent(agent: AiTarget) {
		this.customAgents = this.customAgents.filter(
			(a) => !(a.name === agent.name && a.filename === agent.filename)
		);
		this.persist();
	}

	persist() {
		if (!canStore) return;
		const data: Persisted = {
			language: this.language,
			theme: this.theme,
			customAgents: this.customAgents
		};
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
			this.persistFailed = false;
		} catch {
			this.persistFailed = true;
		}
	}
}

export const settings = new SettingsStore();
