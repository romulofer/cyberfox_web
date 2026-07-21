<script lang="ts">
	import { renderMarkdown } from '$lib/preview/renderMarkdown';

	interface Props {
		markdown: string;
		placeholder: string;
	}

	let { markdown, placeholder }: Props = $props();

	const html = $derived(renderMarkdown(markdown));
	const isEmpty = $derived(markdown.trim().length === 0);
</script>

<section class="preview" aria-label="Preview">
	{#if isEmpty}
		<p class="placeholder">{placeholder}</p>
	{:else}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized in renderMarkdown -->
		<div class="rendered" data-testid="preview">{@html html}</div>
	{/if}
</section>

<style>
	.preview {
		height: 100%;
		overflow: auto;
		padding: 1.5rem;
		background: var(--preview-bg);
	}
	.placeholder {
		color: var(--muted);
		font-style: italic;
	}
</style>
