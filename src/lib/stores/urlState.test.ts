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
