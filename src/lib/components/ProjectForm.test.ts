import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import ProjectForm from './ProjectForm.svelte';
import { projectConfig } from '$lib/stores/projectConfig.svelte';
import { builtInAgents } from '$lib/core/agents/builtInAgents';
import { strings } from '$lib/core/i18n/strings';

const en = strings.en;

function fieldsetFor(legendText: string): HTMLElement {
	const legend = screen.getByText(legendText, { selector: 'legend' });
	return legend.closest('fieldset') as HTMLElement;
}

beforeEach(() => {
	projectConfig.reset();
});

afterEach(() => {
	projectConfig.reset();
});

describe('ProjectForm', () => {
	it('typing the project name updates the store', async () => {
		render(ProjectForm, { props: { strings: en, agents: builtInAgents } });

		await fireEvent.input(screen.getByTestId('project-name'), { target: { value: 'My App' } });

		expect(projectConfig.projectName).toBe('My App');
	});

	it('renders a What To Do section wired to projectConfig.whatToDo', async () => {
		render(ProjectForm, { props: { strings: en, agents: builtInAgents } });

		const section = fieldsetFor('What To Do');
		const addButton = Array.from(section.querySelectorAll('button')).find((b) =>
			/Add/.test(b.textContent ?? '')
		)!;
		await fireEvent.click(addButton);

		const input = section.querySelector('[aria-label="What To Do 1"]') as HTMLInputElement;
		await fireEvent.input(input, { target: { value: 'Validate input' } });

		expect(projectConfig.whatToDo).toEqual(['Validate input']);
	});

	it('What To Do is rendered before What Not To Do, after Acceptance Criteria', () => {
		render(ProjectForm, { props: { strings: en, agents: builtInAgents } });

		const legends = Array.from(document.querySelectorAll('legend')).map((l) => l.textContent);

		expect(legends.indexOf('What To Do')).toBeLessThan(legends.indexOf('What Not To Do'));
		expect(legends.indexOf('Acceptance Criteria')).toBeLessThan(legends.indexOf('What To Do'));
	});

	it('selecting a different agent updates the store target', async () => {
		render(ProjectForm, { props: { strings: en, agents: builtInAgents } });

		await fireEvent.change(screen.getByTestId('agent-select'), {
			target: { value: 'AGENTS.md' }
		});

		expect(projectConfig.targetAi.filename).toBe('AGENTS.md');
	});
});
