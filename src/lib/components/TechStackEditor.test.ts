import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import TechStackEditor from './TechStackEditor.svelte';
import { strings } from '$lib/core/i18n/strings';

const en = strings.en;

describe('TechStackEditor', () => {
	it('renders one row of three labeled fields per entry', () => {
		render(TechStackEditor, {
			props: {
				strings: en,
				items: [{ category: 'Frontend', technology: 'Svelte', versionOrNotes: '5' }]
			}
		});
		expect(screen.getByLabelText('Category')).toHaveValue('Frontend');
		expect(screen.getByLabelText('Technology')).toHaveValue('Svelte');
		expect(screen.getByLabelText('Version / Notes')).toHaveValue('5');
	});

	it('adding a row appends an empty entry and focuses its category input', async () => {
		render(TechStackEditor, { props: { strings: en, items: [] } });

		await fireEvent.click(screen.getByRole('button', { name: /Add/ }));

		expect(screen.getByLabelText('Category')).toHaveValue('');
		expect(screen.getByLabelText('Category')).toHaveFocus();
	});

	it('removing a row deletes that entry only', async () => {
		render(TechStackEditor, {
			props: {
				strings: en,
				items: [
					{ category: 'Frontend', technology: 'Svelte', versionOrNotes: '5' },
					{ category: 'Backend', technology: 'Bun', versionOrNotes: 'latest' }
				]
			}
		});

		await fireEvent.click(screen.getAllByRole('button', { name: 'Remove' })[0]);

		expect(screen.getByLabelText('Category')).toHaveValue('Backend');
		expect(screen.queryByDisplayValue('Frontend')).not.toBeInTheDocument();
	});
});
