<script lang="ts">
	import type { AppStrings } from '$lib/core/i18n/strings';
	import { copyMarkdown, downloadMarkdown } from '$lib/fileActions';

	interface Props {
		filename: string;
		markdown: string;
		strings: AppStrings;
	}

	let { filename, markdown, strings }: Props = $props();

	let copied = $state(false);

	function save() {
		downloadMarkdown(filename, markdown);
	}

	async function copy() {
		await copyMarkdown(markdown);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<div class="toolbar">
	<button type="button" class="primary" data-testid="download" onclick={save}>
		{strings.saveFileLabel(filename)}
	</button>
	<button type="button" data-testid="copy" onclick={copy}>
		{copied ? strings.copied : strings.copy}
	</button>
</div>

<style>
	.toolbar {
		display: flex;
		gap: 0.5rem;
	}
	.primary {
		font-weight: 600;
	}
</style>
