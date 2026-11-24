// Browser save actions: no native folder picker, so download a blob with the
// agent's canonical filename and offer clipboard copy.
export function downloadMarkdown(filename: string, markdown: string): void {
	const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = filename;
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(url);
}

// Selects the text in a temporary textarea and copies it with the legacy command.
// Needed where the Clipboard API is unavailable, e.g. a self-hosted instance served
// over plain HTTP, which browsers do not treat as a secure context.
function copyWithTextarea(text: string): boolean {
	const previouslyFocused = document.activeElement as HTMLElement | null;
	const textarea = document.createElement('textarea');
	textarea.value = text;
	textarea.setAttribute('readonly', '');
	textarea.setAttribute('aria-hidden', 'true');
	textarea.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
	document.body.appendChild(textarea);
	try {
		textarea.focus();
		textarea.select();
		return document.execCommand('copy');
	} catch {
		return false;
	} finally {
		textarea.remove();
		previouslyFocused?.focus?.();
	}
}

// Rejects only when no strategy worked, so callers can show an error.
export async function copyMarkdown(markdown: string): Promise<void> {
	if (navigator.clipboard?.writeText) {
		try {
			await navigator.clipboard.writeText(markdown);
			return;
		} catch {
			// Permission denied or document not focused: try the fallback below.
		}
	}
	if (!copyWithTextarea(markdown)) throw new Error('Copying to the clipboard is not available');
}
