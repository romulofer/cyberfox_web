import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import PreviewPane from './PreviewPane.svelte';

describe('PreviewPane', () => {
	it('shows the placeholder when the markdown is blank', () => {
		render(PreviewPane, { props: { markdown: '   ', placeholder: 'Nothing yet' } });
		expect(screen.getByText('Nothing yet')).toBeInTheDocument();
		expect(screen.queryByTestId('preview')).not.toBeInTheDocument();
	});

	it('renders sanitized HTML from the markdown', () => {
		render(PreviewPane, { props: { markdown: '# Title', placeholder: 'Nothing yet' } });
		const preview = screen.getByTestId('preview');
		expect(preview.querySelector('h1')).toHaveTextContent('Title');
	});

	it('strips injected script tags from the rendered output', () => {
		render(PreviewPane, {
			props: { markdown: '<script>alert(1)</script>', placeholder: 'Nothing yet' }
		});
		expect(screen.getByTestId('preview').innerHTML).not.toContain('<script>');
	});
});
