import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Render markdown to HTML. On the client the output is sanitized to guard against
// markup injected via shareable URL state; during prerender (no window) only the
// default empty config is ever rendered, so the raw marked output is safe.
export function renderMarkdown(markdown: string): string {
	const html = marked.parse(markdown, { async: false }) as string;
	if (typeof window === 'undefined') return html;
	return DOMPurify.sanitize(html);
}
