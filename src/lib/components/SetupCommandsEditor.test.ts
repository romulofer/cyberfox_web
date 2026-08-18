import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import SetupCommandsEditor from './SetupCommandsEditor.svelte';
import { strings } from '$lib/core/i18n/strings';

const en = strings.en;

describe('SetupCommandsEditor', () => {
	it('renders command and description fields per entry', () => {
		render(SetupCommandsEditor, {
			props: { strings: en, items: [{ command: 'bun install', description: 'Install deps' }] }
		});
		expect(screen.getByLabelText('Command')).toHaveValue('bun install');
		expect(screen.getByLabelText('Description')).toHaveValue('Install deps');
	});

	it('adding a row appends an empty entry and focuses its command input', async () => {
		render(SetupCommandsEditor, { props: { strings: en, items: [] } });

		await fireEvent.click(screen.getByRole('button', { name: /Add/ }));

		expect(screen.getByLabelText('Command')).toHaveValue('');
		expect(screen.getByLabelText('Command')).toHaveFocus();
	});

	it('removing a row deletes that entry only', async () => {
		render(SetupCommandsEditor, {
			props: {
				strings: en,
				items: [
					{ command: 'bun install', description: 'Install deps' },
					{ command: 'bun run build', description: 'Build' }
				]
			}
		});

		await fireEvent.click(screen.getAllByRole('button', { name: 'Remove' })[0]);

		expect(screen.getByLabelText('Command')).toHaveValue('bun run build');
		expect(screen.queryByDisplayValue('bun install')).not.toBeInTheDocument();
	});
});
