import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import StringListEditor from './StringListEditor.svelte';

const baseProps = {
	label: 'Core Features',
	items: [] as string[],
	placeholder: 'JWT Authentication',
	addLabel: 'Add'
};

describe('StringListEditor', () => {
	it('renders one input per item, seeded with its value', () => {
		render(StringListEditor, { props: { ...baseProps, items: ['Auth', 'Logging'] } });
		expect(screen.getByLabelText('Core Features 1')).toHaveValue('Auth');
		expect(screen.getByLabelText('Core Features 2')).toHaveValue('Logging');
	});

	it('adding a row appends an empty, focused input', async () => {
		render(StringListEditor, { props: { ...baseProps, items: ['Auth'] } });

		await fireEvent.click(screen.getByRole('button', { name: /Add/ }));

		const second = screen.getByLabelText('Core Features 2');
		expect(second).toHaveValue('');
		expect(second).toHaveFocus();
	});

	it('removing a row deletes only that input', async () => {
		render(StringListEditor, { props: { ...baseProps, items: ['Auth', 'Logging'] } });

		await fireEvent.click(screen.getAllByRole('button', { name: 'Remove' })[0]);

		expect(screen.getByLabelText('Core Features 1')).toHaveValue('Logging');
		expect(screen.queryByDisplayValue('Auth')).not.toBeInTheDocument();
	});

	it('pressing Enter in the last row adds a new one', async () => {
		render(StringListEditor, { props: { ...baseProps, items: ['Auth'] } });

		await fireEvent.keyDown(screen.getByLabelText('Core Features 1'), { key: 'Enter' });

		expect(screen.getByLabelText('Core Features 2')).toBeInTheDocument();
	});
});
