import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import Toolbar from './Toolbar.svelte';
import { strings } from '$lib/core/i18n/strings';

const props = { filename: 'CLAUDE.md', markdown: '# Hello', strings: strings.en };

function setClipboard(value: unknown) {
	Object.defineProperty(navigator, 'clipboard', { value, configurable: true });
}

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	cleanup();
	vi.useRealTimers();
	setClipboard(undefined);
});

describe('Toolbar copy button', () => {
	it('shows a confirmation, announces it, then resets', async () => {
		setClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });
		render(Toolbar, props);

		await fireEvent.click(screen.getByTestId('copy'));

		expect(screen.getByTestId('copy')).toHaveTextContent(strings.en.copied);
		expect(screen.getByRole('status')).toHaveTextContent(strings.en.copied);

		await vi.advanceTimersByTimeAsync(2000);
		expect(screen.getByTestId('copy')).not.toHaveTextContent(strings.en.copied);
		expect(screen.getByRole('status').textContent).toBe('');
	});

	it('shows an error and keeps Download usable when copying is impossible', async () => {
		setClipboard(undefined);
		Object.defineProperty(document, 'execCommand', {
			value: () => false,
			configurable: true,
			writable: true
		});
		render(Toolbar, props);

		await fireEvent.click(screen.getByTestId('copy'));

		expect(screen.getByRole('alert')).toHaveTextContent(strings.en.copyFailed);
		expect(screen.getByTestId('copy')).not.toHaveTextContent(strings.en.copied);
		expect(screen.getByTestId('download')).toBeEnabled();
	});

	it('does not leave a timer running after unmount', async () => {
		setClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });
		const { unmount } = render(Toolbar, props);

		await fireEvent.click(screen.getByTestId('copy'));
		unmount();

		expect(vi.getTimerCount()).toBe(0);
	});
});
