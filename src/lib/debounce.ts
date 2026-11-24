// Collapses a burst of values into one write of the latest value. `flush` forces the
// pending write (for example when the page is being hidden), `cancel` drops it.
export function createDebouncedWriter<T>(write: (value: T) => void, delayMs: number) {
	let timer: ReturnType<typeof setTimeout> | undefined;
	let pending: { value: T } | null = null;

	function flush() {
		clearTimeout(timer);
		timer = undefined;
		if (!pending) return;
		const { value } = pending;
		pending = null;
		write(value);
	}

	return {
		schedule(value: T) {
			pending = { value };
			clearTimeout(timer);
			timer = setTimeout(flush, delayMs);
		},
		flush,
		cancel() {
			clearTimeout(timer);
			timer = undefined;
			pending = null;
		}
	};
}
