import { tick } from 'svelte';

// After a row is removed, keyboard users would lose their place because the focused
// button disappears. Move focus to the row that took the removed row's position (or
// the previous one when the last row was removed), or to the fallback control when
// the list is now empty.
export async function focusAfterRemove(
	scope: Element | null,
	rowSelector: string,
	removedIndex: number,
	fallbackSelector: string
): Promise<void> {
	await tick();
	if (!scope) return;
	const rows = scope.querySelectorAll<HTMLElement>(rowSelector);
	const row = rows[Math.min(removedIndex, rows.length - 1)];
	const target =
		row?.querySelector<HTMLElement>('input, textarea, select') ??
		scope.querySelector<HTMLElement>(fallbackSelector);
	target?.focus();
}
