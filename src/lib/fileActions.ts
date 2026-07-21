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

export async function copyMarkdown(markdown: string): Promise<void> {
	await navigator.clipboard.writeText(markdown);
}
