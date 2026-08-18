import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import PhasesEditor from './PhasesEditor.svelte';
import { strings } from '$lib/core/i18n/strings';

const en = strings.en;

describe('PhasesEditor', () => {
	it('renders a phase name, description and its tasks', () => {
		render(PhasesEditor, {
			props: {
				strings: en,
				items: [{ name: 'MVP', description: 'Initial setup.', tasks: ['Set up repo'] }]
			}
		});
		expect(screen.getByLabelText('Phase name')).toHaveValue('MVP');
		expect(screen.getByLabelText('Phase description')).toHaveValue('Initial setup.');
		expect(screen.getByLabelText('Task 1')).toHaveValue('Set up repo');
	});

	it('adding a phase appends an empty one and focuses its name input', async () => {
		render(PhasesEditor, { props: { strings: en, items: [] } });

		await fireEvent.click(screen.getByRole('button', { name: /Add phase/ }));

		expect(screen.getByLabelText('Phase name')).toHaveValue('');
		expect(screen.getByLabelText('Phase name')).toHaveFocus();
	});

	it('removing a phase deletes it entirely', async () => {
		render(PhasesEditor, {
			props: {
				strings: en,
				items: [
					{ name: 'MVP', description: '', tasks: [] },
					{ name: 'Beta', description: '', tasks: [] }
				]
			}
		});

		await fireEvent.click(screen.getByLabelText('Project Phases 1'));

		expect(screen.getByLabelText('Phase name')).toHaveValue('Beta');
		expect(screen.getAllByTestId('phase')).toHaveLength(1);
	});
});
