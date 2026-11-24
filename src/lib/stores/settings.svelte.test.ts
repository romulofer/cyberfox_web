import { beforeEach, describe, expect, it, vi } from 'vitest';
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

	it('toggleLanguage flips en/ptBR', () => {
		const s = new SettingsStore();
		s.setLanguage('en');
		s.toggleLanguage();
		expect(s.language).toBe('ptBR');
		s.toggleLanguage();
		expect(s.language).toBe('en');
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

	it('falls back to defaults for unknown language and theme values', () => {
		localStorage.setItem(
			'cyberfox_web.settings.v1',
			JSON.stringify({ language: 'fr', theme: 'neon', customAgents: [] })
		);
		const s = new SettingsStore();
		expect(s.language).toBe('ptBR');
		expect(s.theme).toBe('light');
	});

	it('ignores stored payloads that are not objects', () => {
		for (const raw of ['null', '5', '"text"', '[]']) {
			localStorage.setItem('cyberfox_web.settings.v1', raw);
			const s = new SettingsStore();
			expect(s.language).toBe('ptBR');
			expect(s.customAgents).toEqual([]);
		}
	});

	it('drops invalid, duplicate and built-in-clashing custom agents on load', () => {
		localStorage.setItem(
			'cyberfox_web.settings.v1',
			JSON.stringify({
				language: 'en',
				customAgents: [
					customAgent,
					{ name: 'Same file', filename: 'myagent.md' },
					{ name: 'Clash', filename: builtInAgents[0].filename },
					{ name: 'No file' },
					null,
					'text'
				]
			})
		);
		const s = new SettingsStore();
		expect(s.language).toBe('en');
		expect(s.customAgents).toEqual([customAgent]);
	});

	it('addCustomAgent reports empty and duplicate input without changing the list', () => {
		const s = new SettingsStore();
		expect(s.addCustomAgent({ name: '  ', filename: 'A.md' })).toBe('empty');
		expect(s.addCustomAgent({ name: 'A', filename: '' })).toBe('empty');
		expect(s.addCustomAgent({ name: 'Mine', filename: builtInAgents[0].filename })).toBe(
			'duplicate'
		);
		expect(
			s.addCustomAgent({ name: 'Mine', filename: builtInAgents[0].filename.toLowerCase() })
		).toBe('duplicate');
		expect(s.addCustomAgent(customAgent)).toBe('added');
		expect(s.addCustomAgent({ name: 'Other', filename: ' MYAGENT.md ' })).toBe('duplicate');
		expect(s.customAgents).toEqual([customAgent]);
	});

	it('addCustomAgent trims name and filename', () => {
		const s = new SettingsStore();
		s.addCustomAgent({ name: '  Spaced  ', filename: '  SPACED.md ' });
		expect(s.customAgents).toEqual([{ name: 'Spaced', filename: 'SPACED.md' }]);
	});

	it('keeps working in memory when localStorage rejects the write', () => {
		const s = new SettingsStore();
		const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new DOMException('full', 'QuotaExceededError');
		});
		expect(() => s.setTheme('dark')).not.toThrow();
		expect(s.theme).toBe('dark');
		expect(s.persistFailed).toBe(true);
		spy.mockRestore();
		s.setTheme('light');
		expect(s.persistFailed).toBe(false);
	});
});
