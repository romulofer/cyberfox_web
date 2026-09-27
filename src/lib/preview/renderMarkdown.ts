import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Render markdown to HTML. On the client the output is sanitized to guard against
// markup injected via shareable URL state. During SSR/prerender (no window)
// DOMPurify is unavailable; this is safe ONLY because all routes use
// `export const prerender = true` in +layout.ts, so the server-side render
// always uses the empty default config. If SSR is ever enabled with user-supplied
// content, replace dompurify with isomorphic-dompurify to sanitize on the server too.
export function renderMarkdown(markdown: string): string {
	const html = marked.parse(markdown, { async: false }) as string;
	if (typeof window === 'undefined') return html;
	return DOMPurify.sanitize(html);
}
