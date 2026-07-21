<script lang="ts">
	import type { SetupCommand } from '$lib/core/models/types';
	import type { AppStrings } from '$lib/core/i18n/strings';

	interface Props {
		items: SetupCommand[];
		strings: AppStrings;
	}

	let { items = $bindable(), strings }: Props = $props();

	function add() {
		items = [...items, { command: '', description: '' }];
	}

	function remove(index: number) {
		items = items.filter((_, i) => i !== index);
	}
</script>

<fieldset>
	<legend>{strings.sectionSetupCommands}</legend>
	{#each items as _, i (i)}
		<div class="row">
			<input
				bind:value={items[i].command}
				placeholder={strings.hintCommand}
				aria-label={strings.fieldCommand}
			/>
			<input
				bind:value={items[i].description}
				placeholder={strings.hintCommandDescription}
				aria-label={strings.fieldCommandDescription}
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
