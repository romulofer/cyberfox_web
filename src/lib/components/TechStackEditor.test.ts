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

describe('TechStackEditor: focus after removing a row', () => {
	const entries = [
		{ category: 'a', technology: 'a', versionOrNotes: 'a' },
		{ category: 'b', technology: 'b', versionOrNotes: 'b' }
	];

	it('focuses the first field of the row that took its place', async () => {
		render(TechStackEditor, { props: { strings: en, items: structuredClone(entries) } });

		await fireEvent.click(screen.getAllByRole('button', { name: 'Remove' })[0]);

		expect(screen.getByLabelText('Category')).toHaveValue('b');
		expect(screen.getByLabelText('Category')).toHaveFocus();
	});

	it('focuses the add button when the last row is removed', async () => {
		render(TechStackEditor, { props: { strings: en, items: [entries[0]] } });

		await fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

		expect(screen.getByRole('button', { name: /Add/ })).toHaveFocus();
	});
});
