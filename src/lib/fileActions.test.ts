import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { copyMarkdown, downloadMarkdown } from './fileActions';

describe('downloadMarkdown', () => {
	let createObjectURL: ReturnType<typeof vi.fn<(obj: Blob | MediaSource) => string>>;
	let revokeObjectURL: ReturnType<typeof vi.fn<(url: string) => void>>;
	let clickSpy: ReturnType<typeof vi.fn<() => void>>;

	beforeEach(() => {
		createObjectURL = vi.fn(() => 'blob:mock-url');
		revokeObjectURL = vi.fn();
		URL.createObjectURL = createObjectURL;
		URL.revokeObjectURL = revokeObjectURL;
		clickSpy = vi.fn();
		HTMLAnchorElement.prototype.click = clickSpy;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('creates a blob URL, clicks a download anchor with the given filename, then revokes it', () => {
		downloadMarkdown('CLAUDE.md', '# Hello');

		expect(createObjectURL).toHaveBeenCalledTimes(1);
		const [blob] = createObjectURL.mock.calls[0];
		expect((blob as Blob).type).toBe('text/markdown;charset=utf-8');
		expect(clickSpy).toHaveBeenCalledTimes(1);
		expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
	});

	it('does not leave the temporary anchor in the DOM', () => {
		downloadMarkdown('CLAUDE.md', '# Hello');
		expect(document.querySelector('a[download="CLAUDE.md"]')).toBeNull();
	});
});

describe('copyMarkdown', () => {
	it('writes the markdown to the clipboard', async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });

		await copyMarkdown('# Hello');

		expect(writeText).toHaveBeenCalledWith('# Hello');
	});
});

describe('copyMarkdown fallback', () => {
	function setClipboard(value: unknown) {
		Object.defineProperty(navigator, 'clipboard', { value, configurable: true });
	}
	function setExecCommand(impl: (command: string) => boolean) {
		Object.defineProperty(document, 'execCommand', {
			value: vi.fn(impl),
			configurable: true,
			writable: true
		});
		return document.execCommand as unknown as ReturnType<typeof vi.fn>;
	}

	afterEach(() => {
		setClipboard(undefined);
	});

	it('uses execCommand when the Clipboard API is unavailable (insecure context)', async () => {
		setClipboard(undefined);
		let copied = '';
		const exec = setExecCommand(() => {
			copied = (document.activeElement as HTMLTextAreaElement).value;
			return true;
		});

		await copyMarkdown('# Fallback');

		expect(exec).toHaveBeenCalledWith('copy');
		expect(copied).toBe('# Fallback');
	});

	it('uses execCommand when writeText rejects', async () => {
		setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('denied')) });
		const exec = setExecCommand(() => true);

		await expect(copyMarkdown('# Denied')).resolves.toBeUndefined();
		expect(exec).toHaveBeenCalledWith('copy');
	});

	it('rejects when both strategies fail', async () => {
		setClipboard(undefined);
		setExecCommand(() => false);
		await expect(copyMarkdown('# Nope')).rejects.toThrow();
	});

	it('rejects when execCommand throws', async () => {
		setClipboard(undefined);
		setExecCommand(() => {
			throw new Error('unsupported');
		});
		await expect(copyMarkdown('# Nope')).rejects.toThrow();
	});

	it('removes the temporary textarea and restores focus', async () => {
		setClipboard(undefined);
		setExecCommand(() => true);
		const button = document.createElement('button');
		document.body.appendChild(button);
		button.focus();

		await copyMarkdown('# Clean');

		expect(document.querySelector('textarea')).toBeNull();
		expect(document.activeElement).toBe(button);
		button.remove();
	});
});
