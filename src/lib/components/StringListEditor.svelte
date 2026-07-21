<script lang="ts">
	interface Props {
		label: string;
		items: string[];
		placeholder: string;
		addLabel: string;
	}

	let { label, items = $bindable(), placeholder, addLabel }: Props = $props();

	function add() {
		items = [...items, ''];
	}

	function remove(index: number) {
		items = items.filter((_, i) => i !== index);
	}
</script>

<fieldset>
	<legend>{label}</legend>
	{#each items as _, i (i)}
		<div class="row">
			<input type="text" {placeholder} bind:value={items[i]} aria-label={`${label} ${i + 1}`} />
			<button type="button" class="remove" onclick={() => remove(i)} aria-label="Remove">✕</button>
		</div>
	{/each}
	<button type="button" class="add" onclick={add}>+ {addLabel}</button>
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
	}
	.remove {
		flex: 0 0 auto;
	}
	.add {
		margin-top: 0.25rem;
	}
</style>
