import { describe, expect, it } from 'vitest';
import { strings } from './strings';

describe('strings', () => {
	it('saveFileLabel formats the filename per language', () => {
		expect(strings.en.saveFileLabel('CLAUDE.md')).toBe('Save CLAUDE.md');
		expect(strings.ptBR.saveFileLabel('CLAUDE.md')).toBe('Salvar CLAUDE.md');
	});

	it('ptBR and en expose the exact same set of keys', () => {
		expect(Object.keys(strings.ptBR).sort()).toEqual(Object.keys(strings.en).sort());
	});

	it('has no empty string values in either locale (excluding functions)', () => {
		for (const locale of [strings.ptBR, strings.en]) {
			for (const [key, value] of Object.entries(locale)) {
				if (typeof value === 'function') continue;
				expect(value, `${key} should not be empty`).not.toBe('');
			}
		}
	});
});
