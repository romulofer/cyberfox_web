import { beforeEach, describe, expect, it } from 'vitest';
import { SettingsStore } from './settings.svelte';
import { builtInAgents } from '../core/agents/builtInAgents';

const customAgent = { name: 'My Agent', filename: 'MYAGENT.md' };

beforeEach(() => localStorage.clear());

describe('SettingsStore', () => {
	it('defaults to ptBR + light + no custom agents', () => {
		const s = new SettingsStore();
		expect(s.language).toBe('ptBR');
		expect(s.theme).toBe('light');
		expect(s.customAgents).toEqual([]);
	});

	it('allAgents = built-in + custom', () => {
		const s = new SettingsStore();
		s.addCustomAgent(customAgent);
		expect(s.allAgents).toHaveLength(builtInAgents.length + 1);
		expect(s.allAgents.at(-1)).toEqual(customAgent);
	});

	it('removeCustomAgent removes by name + filename', () => {
		const s = new SettingsStore();
		s.addCustomAgent(customAgent);
		s.removeCustomAgent(customAgent);
		expect(s.customAgents).toEqual([]);
	});

	it('toggleTheme flips light/dark', () => {
		const s = new SettingsStore();
		s.toggleTheme();
		expect(s.theme).toBe('dark');
		s.toggleTheme();
		expect(s.theme).toBe('light');
	});

	it('persists language, theme and custom agents across instances', () => {
		const a = new SettingsStore();
		a.setLanguage('en');
		a.setTheme('dark');
		a.addCustomAgent(customAgent);

		const b = new SettingsStore();
		expect(b.language).toBe('en');
		expect(b.theme).toBe('dark');
		expect(b.customAgents).toEqual([customAgent]);
	});

	it('survives corrupt localStorage payload', () => {
		localStorage.setItem('cyberfox_web.settings.v1', '{not json');
		const s = new SettingsStore();
		expect(s.language).toBe('ptBR');
	});
});
