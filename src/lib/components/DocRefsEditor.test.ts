import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import DocRefsEditor from './DocRefsEditor.svelte';
import { strings } from '$lib/core/i18n/strings';

const en = strings.en;

describe('DocRefsEditor', () => {
	it('renders title, url and optional description fields per entry', () => {
		render(DocRefsEditor, {
			props: {
				strings: en,
				items: [{ title: 'Svelte', url: 'https://svelte.dev', description: 'Docs' }]
			}
		});
		expect(screen.getByLabelText('Title')).toHaveValue('Svelte');
		expect(screen.getByLabelText('URL')).toHaveValue('https://svelte.dev');
		expect(screen.getByLabelText('Description (optional)')).toHaveValue('Docs');
	});

	it('adding a row appends an empty entry and focuses its title input', async () => {
		render(DocRefsEditor, { props: { strings: en, items: [] } });

		await fireEvent.click(screen.getByRole('button', { name: /Add/ }));

		expect(screen.getByLabelText('Title')).toHaveValue('');
		expect(screen.getByLabelText('Title')).toHaveFocus();
	});

	it('removing a row deletes that entry only', async () => {
		render(DocRefsEditor, {
			props: {
				strings: en,
				items: [
					{ title: 'Svelte', url: 'https://svelte.dev', description: '' },
					{ title: 'Bun', url: 'https://bun.sh', description: '' }
				]
			}
		});

		await fireEvent.click(screen.getAllByRole('button', { name: 'Remove' })[0]);

		expect(screen.getByLabelText('Title')).toHaveValue('Bun');
		expect(screen.queryByDisplayValue('Svelte')).not.toBeInTheDocument();
	});
});
