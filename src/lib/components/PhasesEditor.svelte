<script lang="ts">
	import { tick } from 'svelte';
	import type { ProjectPhase } from '$lib/core/models/types';
	import type { AppStrings } from '$lib/core/i18n/strings';

	interface Props {
		items: ProjectPhase[];
		strings: AppStrings;
	}

	let { items = $bindable(), strings }: Props = $props();

	let nameInputs = $state<HTMLInputElement[]>([]);

	async function add() {
		items = [...items, { name: '', description: '', tasks: [] }];
		await tick();
		nameInputs[items.length - 1]?.focus();
	}

	function remove(index: number) {
		items = items.filter((_, i) => i !== index);
	}

	function addTask(phaseIndex: number) {
		items[phaseIndex].tasks = [...items[phaseIndex].tasks, ''];
	}

	function removeTask(phaseIndex: number, taskIndex: number) {
		items[phaseIndex].tasks = items[phaseIndex].tasks.filter((_, i) => i !== taskIndex);
	}
</script>

<fieldset>
	<legend>{strings.sectionPhases}</legend>
	{#each items as _, i (i)}
		<div class="phase" data-testid="phase">
			<div class="row">
				<input
					bind:value={items[i].name}
					placeholder={strings.hintPhaseName}
					aria-label={strings.fieldPhaseName}
					bind:this={nameInputs[i]}
				/>
				<button
					type="button"
					class="remove"
					onclick={() => remove(i)}
					aria-label={`${strings.sectionPhases} ${i + 1}`}>🗑️</button
				>
			</div>
			<textarea
				bind:value={items[i].description}
				placeholder={strings.hintPhaseDescription}
				aria-label={strings.fieldPhaseDescription}
				rows="2"></textarea>
			<div class="tasks">
				{#each items[i].tasks as _task, j (j)}
					<div class="row">
						<input
							bind:value={items[i].tasks[j]}
							placeholder={strings.hintPhaseTask}
							aria-label={`${strings.fieldPhaseTask} ${j + 1}`}
						/>
						<button
							type="button"
							class="remove"
							onclick={() => removeTask(i, j)}
							aria-label="Remove">🗑️</button
						>
					</div>
				{/each}
				<button type="button" class="add-task" onclick={() => addTask(i)}
					>➕ {strings.fieldPhaseTask}</button
				>
			</div>
		</div>
	{/each}
	<button type="button" class="add" onclick={add}>➕ {strings.addPhase}</button>
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
	.phase {
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
	textarea {
		font: inherit;
		width: 100%;
		box-sizing: border-box;
	}
	.tasks {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding-left: 0.75rem;
		border-left: 2px solid var(--border);
	}
	.remove {
		flex: 0 0 auto;
	}
	.add {
		margin-top: 0.25rem;
	}
	.add-task {
		align-self: flex-start;
	}
</style>
