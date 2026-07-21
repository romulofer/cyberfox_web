import type { AiTarget } from '../core/models/types';
import type { Language } from '../core/i18n/strings';
import { builtInAgents } from '../core/agents/builtInAgents';

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
		return raw ? (JSON.parse(raw) as Partial<Persisted>) : {};
	} catch {
		return {};
	}
}

export class SettingsStore {
	language = $state<Language>('ptBR');
	theme = $state<Theme>('light');
	customAgents = $state<AiTarget[]>([]);

	constructor() {
		const p = loadPersisted();
		if (p.language) this.language = p.language;
		if (p.theme) this.theme = p.theme;
		if (Array.isArray(p.customAgents)) this.customAgents = p.customAgents;
	}

	get allAgents(): AiTarget[] {
		return [...builtInAgents, ...this.customAgents];
	}

	setLanguage(language: Language) {
		this.language = language;
		this.persist();
	}

	setTheme(theme: Theme) {
		this.theme = theme;
		this.persist();
	}

	toggleTheme() {
		this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
	}

	addCustomAgent(agent: AiTarget) {
		this.customAgents = [...this.customAgents, agent];
		this.persist();
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
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	}
}

export const settings = new SettingsStore();
