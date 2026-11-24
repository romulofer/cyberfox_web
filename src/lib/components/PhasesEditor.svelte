<script lang="ts">
	import { tick } from 'svelte';
	import { focusAfterRemove } from './focusAfterRemove';
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

	function remove(index: number, event: MouseEvent) {
		const scope = (event.currentTarget as HTMLElement).closest('fieldset');
		items = items.filter((_, i) => i !== index);
		void focusAfterRemove(scope, '.phase', index, '.add');
	}

	function addTask(phaseIndex: number) {
		items = items.map((phase, i) =>
			i === phaseIndex ? { ...phase, tasks: [...phase.tasks, ''] } : phase
		);
	}

	function removeTask(phaseIndex: number, taskIndex: number, event: MouseEvent) {
		const scope = (event.currentTarget as HTMLElement).closest('.phase');
		items = items.map((phase, i) =>
			i === phaseIndex ? { ...phase, tasks: phase.tasks.filter((_, j) => j !== taskIndex) } : phase
		);
		void focusAfterRemove(scope, '.tasks .row', taskIndex, '.add-task');
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
					onclick={(event) => remove(i, event)}
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
							onclick={(event) => removeTask(i, j, event)}
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
