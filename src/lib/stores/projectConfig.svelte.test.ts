import { describe, expect, it } from 'vitest';
import { ProjectConfigStore, emptyConfig } from './projectConfig.svelte';
import { builtInAgents } from '../core/agents/builtInAgents';

describe('ProjectConfigStore', () => {
	it('defaults targetAi to the first built-in agent', () => {
		const s = new ProjectConfigStore();
		expect(s.targetAi).toEqual(builtInAgents[0]);
	});

	it('config getter reflects mutated fields', () => {
		const s = new ProjectConfigStore();
		s.projectName = 'Demo';
		s.coreFeatures = ['Fast'];
		expect(s.config.projectName).toBe('Demo');
		expect(s.config.coreFeatures).toEqual(['Fast']);
	});

	it('load replaces all fields', () => {
		const s = new ProjectConfigStore();
		s.load({ ...emptyConfig(), projectName: 'Loaded', description: 'desc' });
		expect(s.projectName).toBe('Loaded');
		expect(s.description).toBe('desc');
	});

	it('reset clears back to empty', () => {
		const s = new ProjectConfigStore();
		s.projectName = 'X';
		s.techStack = [{ category: 'a', technology: 'b', versionOrNotes: 'c' }];
		s.reset();
		expect(s.projectName).toBe('');
		expect(s.techStack).toEqual([]);
	});
});
