import { describe, expect, it } from 'vitest';
import { configHash, decodeConfig, encodeConfig, readConfigFromHash } from './urlState';
import { emptyConfig } from './projectConfig.svelte';
import type { ProjectConfig } from '../core/models/types';

function sample(): ProjectConfig {
	return {
		...emptyConfig(),
		projectName: 'Round Trip',
		description: 'Acentuação e emoji 🚀',
		coreFeatures: ['a', 'b'],
		techStack: [{ category: 'c', technology: 't', versionOrNotes: 'v' }]
	};
}

describe('urlState', () => {
	it('encode/decode round-trips a config including unicode', () => {
		const config = sample();
		expect(decodeConfig(encodeConfig(config))).toEqual(config);
	});

	it('reads a config back from a hash string', () => {
		const config = sample();
		expect(readConfigFromHash(configHash(config))).toEqual(config);
	});

	it('returns null for a hash without the c param', () => {
		expect(readConfigFromHash('#nope=1')).toBeNull();
	});

	it('returns null for a corrupt payload', () => {
		expect(decodeConfig('!!!not-base64!!!')).toBeNull();
	});
});

// Encodes arbitrary JSON text the way a (possibly hostile) share link would.
function rawLink(json: string): string {
	const bytes = new TextEncoder().encode(json);
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

describe('urlState: hostile payloads', () => {
	it.each([
		['prototype key', '{"__proto__":{"polluted":true},"projectName":"X"}'],
		['config key', '{"config":5,"projectName":"X"}'],
		['null list item', '{"techStack":[null],"projectName":"X"}'],
		['phase without tasks', '{"phases":[{"name":"a","description":""}],"projectName":"X"}'],
		['unknown keys', '{"evil":"payload","projectName":"X"}'],
		[
			'non-string tasks',
			'{"phases":[{"name":"a","description":"","tasks":[5,null]}],"projectName":"X"}'
		]
	])('decodes %s into a safe, complete config', (_label, json) => {
		const config = decodeConfig(rawLink(json));
		expect(config).not.toBeNull();
		expect(config?.projectName).toBe('X');
		for (const phase of config?.phases ?? []) expect(Array.isArray(phase.tasks)).toBe(true);
		expect(config).not.toHaveProperty('evil');
		expect(config).not.toHaveProperty('config');
		expect(Object.getPrototypeOf(config)).toBe(Object.prototype);
	});

	it.each([
		['an array', '[]'],
		['a string', '"text"'],
		['null', 'null'],
		['wrong scalar type', '{"projectName":5}'],
		['wrong list type', '{"techStack":"nope"}'],
		['invalid agent', '{"targetAi":{"name":"x"}}']
	])('rejects %s', (_label, json) => {
		expect(decodeConfig(rawLink(json))).toBeNull();
	});

	it('fills defaults for a partial config', () => {
		const config = decodeConfig(rawLink('{"projectName":"Only name"}'));
		expect(config).toEqual({ ...emptyConfig(), projectName: 'Only name' });
	});
});
