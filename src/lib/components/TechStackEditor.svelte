<script lang="ts">
	import type { TechStackEntry } from '$lib/core/models/types';
	import type { AppStrings } from '$lib/core/i18n/strings';

	interface Props {
		items: TechStackEntry[];
		strings: AppStrings;
	}

	let { items = $bindable(), strings }: Props = $props();

	function add() {
		items = [...items, { category: '', technology: '', versionOrNotes: '' }];
	}

	function remove(index: number) {
		items = items.filter((_, i) => i !== index);
	}
</script>

<fieldset>
	<legend>{strings.sectionTechStack}</legend>
	{#each items as _, i (i)}
		<div class="row">
			<input
				bind:value={items[i].category}
				placeholder={strings.hintCategory}
				aria-label={strings.fieldCategory}
			/>
			<input
				bind:value={items[i].technology}
				placeholder={strings.hintTechnology}
				aria-label={strings.fieldTechnology}
			/>
			<input
				bind:value={items[i].versionOrNotes}
				placeholder={strings.hintVersionNotes}
				aria-label={strings.fieldVersionNotes}
			/>
			<button type="button" class="remove" onclick={() => remove(i)} aria-label="Remove">✕</button>
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
	.row {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}
	input {
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
