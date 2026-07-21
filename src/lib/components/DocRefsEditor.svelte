<script lang="ts">
	import type { DocumentationReference } from '$lib/core/models/types';
	import type { AppStrings } from '$lib/core/i18n/strings';

	interface Props {
		items: DocumentationReference[];
		strings: AppStrings;
	}

	let { items = $bindable(), strings }: Props = $props();

	function add() {
		items = [...items, { title: '', url: '', description: '' }];
	}

	function remove(index: number) {
		items = items.filter((_, i) => i !== index);
	}
</script>

<fieldset>
	<legend>{strings.sectionDocRefs}</legend>
	{#each items as _, i (i)}
		<div class="entry">
			<div class="row">
				<input
					bind:value={items[i].title}
					placeholder={strings.fieldDocTitle}
					aria-label={strings.fieldDocTitle}
				/>
				<button type="button" class="remove" onclick={() => remove(i)} aria-label="Remove">✕</button
				>
			</div>
			<input
				bind:value={items[i].url}
				placeholder={strings.fieldDocUrl}
				aria-label={strings.fieldDocUrl}
			/>
			<input
				bind:value={items[i].description}
				placeholder={strings.fieldDocDescriptionOptional}
				aria-label={strings.fieldDocDescriptionOptional}
			/>
		</div>
	{/each}
	<button type="button" class="add" onclick={add}>+ {strings.add}</button>
</fieldset>

<style>
	fieldset {
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 0.75rem 1rem 1rem;
		margin: 0;
	}
	legend {
		font-weight: 600;
		padding: 0 0.4rem;
	}
	.entry {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding-bottom: 0.6rem;
		margin-bottom: 0.6rem;
		border-bottom: 1px dashed var(--border);
	}
	.row {
		display: flex;
		gap: 0.5rem;
	}
	.row input {
		flex: 1;
		min-width: 0;
	}
	.remove {
		flex: 0 0 auto;
	}
	.add {
		margin-top: 0.25rem;
	}
</style>
