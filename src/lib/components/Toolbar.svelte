<script lang="ts">
	import type { AppStrings } from '$lib/core/i18n/strings';
	import { copyMarkdown, downloadMarkdown } from '$lib/fileActions';

	interface Props {
		filename: string;
		markdown: string;
		strings: AppStrings;
	}

	let { filename, markdown, strings }: Props = $props();

	let copyState = $state<'idle' | 'copied' | 'failed'>('idle');
	let resetTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => () => clearTimeout(resetTimer));

	function save() {
		downloadMarkdown(filename, markdown);
	}

	async function copy() {
		clearTimeout(resetTimer);
		try {
			await copyMarkdown(markdown);
			copyState = 'copied';
		} catch {
			copyState = 'failed';
		}
		resetTimer = setTimeout(() => (copyState = 'idle'), copyState === 'failed' ? 6000 : 1500);
	}
</script>

<div class="toolbar">
	<button type="button" class="primary" data-testid="download" onclick={save}>
		💾 {strings.saveFileLabel(filename)}
	</button>
	<button type="button" data-testid="copy" onclick={copy}>
		{copyState === 'copied' ? `✅ ${strings.copied}` : `📋 ${strings.copy}`}
	</button>
	<span class="sr-only" role="status">{copyState === 'copied' ? strings.copied : ''}</span>
	{#if copyState === 'failed'}
		<span class="copy-error" role="alert" data-testid="copy-error">{strings.copyFailed}</span>
	{/if}
</div>

<style>
	.toolbar {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.copy-error {
		color: var(--danger);
		font-size: 0.9rem;
	}
	.primary {
		font-weight: 600;
	}
</style>
