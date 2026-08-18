import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './renderMarkdown';

describe('renderMarkdown', () => {
	it('renders a heading to HTML', () => {
		expect(renderMarkdown('# Hello')).toContain('<h1>Hello</h1>');
	});

	it('renders a table', () => {
		const html = renderMarkdown('| A | B |\n|---|---|\n| 1 | 2 |');
		expect(html).toContain('<table>');
		expect(html).toContain('<td>1</td>');
	});

	it('strips script tags injected via markdown/HTML', () => {
		const html = renderMarkdown('<script>alert(1)</script>\n\n# Title');
		expect(html).not.toContain('<script>');
		expect(html).toContain('<h1>Title</h1>');
	});

	it('strips inline event handler attributes', () => {
		const html = renderMarkdown('<img src="x" onerror="alert(1)">');
		expect(html).not.toContain('onerror');
	});

	it('returns empty string for empty input', () => {
		expect(renderMarkdown('')).toBe('');
	});
});
