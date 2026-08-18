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
