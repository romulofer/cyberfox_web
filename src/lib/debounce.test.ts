import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDebouncedWriter } from './debounce';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('createDebouncedWriter', () => {
	it('writes only the latest value once the delay has passed', () => {
		const write = vi.fn();
		const writer = createDebouncedWriter(write, 300);

		writer.schedule('a');
		vi.advanceTimersByTime(200);
		writer.schedule('ab');
		vi.advanceTimersByTime(200);
		writer.schedule('abc');
		expect(write).not.toHaveBeenCalled();

		vi.advanceTimersByTime(300);
		expect(write).toHaveBeenCalledTimes(1);
		expect(write).toHaveBeenCalledWith('abc');
	});

	it('flush writes the pending value immediately and only once', () => {
		const write = vi.fn();
		const writer = createDebouncedWriter(write, 300);

		writer.schedule('x');
		writer.flush();
		writer.flush();
		vi.advanceTimersByTime(1000);

		expect(write).toHaveBeenCalledTimes(1);
		expect(write).toHaveBeenCalledWith('x');
	});

	it('flush does nothing when nothing is pending', () => {
		const write = vi.fn();
		createDebouncedWriter(write, 300).flush();
		expect(write).not.toHaveBeenCalled();
	});

	it('cancel drops the pending value', () => {
		const write = vi.fn();
		const writer = createDebouncedWriter(write, 300);

		writer.schedule('x');
		writer.cancel();
		vi.advanceTimersByTime(1000);

		expect(write).not.toHaveBeenCalled();
	});

	it('writes again after a previous write completed', () => {
		const write = vi.fn();
		const writer = createDebouncedWriter(write, 100);

		writer.schedule(1);
		vi.advanceTimersByTime(100);
		writer.schedule(2);
		vi.advanceTimersByTime(100);

		expect(write.mock.calls).toEqual([[1], [2]]);
	});
});
