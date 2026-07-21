<script lang="ts">
	import type { AppStrings } from '$lib/core/i18n/strings';
	import type { AiTarget } from '$lib/core/models/types';
	import { projectConfig } from '$lib/stores/projectConfig.svelte';
	import StringListEditor from './StringListEditor.svelte';
	import TechStackEditor from './TechStackEditor.svelte';
	import SetupCommandsEditor from './SetupCommandsEditor.svelte';
	import DocRefsEditor from './DocRefsEditor.svelte';

	interface Props {
		strings: AppStrings;
		agents: AiTarget[];
	}

	let { strings, agents }: Props = $props();

	function selectAgent(event: Event) {
		const filename = (event.currentTarget as HTMLSelectElement).value;
		const found = agents.find((a) => a.filename === filename);
		if (found) projectConfig.targetAi = found;
	}
</script>

<form class="form" onsubmit={(e) => e.preventDefault()}>
	<fieldset>
		<legend>{strings.sectionProject}</legend>
		<label>
			{strings.fieldName}
			<input bind:value={projectConfig.projectName} data-testid="project-name" />
		</label>
		<label>
			{strings.fieldDescription}
			<textarea bind:value={projectConfig.description} rows="3"></textarea>
		</label>
		<label>
			{strings.fieldTargetAi}
			<select
				value={projectConfig.targetAi.filename}
				onchange={selectAgent}
				data-testid="agent-select"
			>
				{#each agents as agent (agent.filename)}
					<option value={agent.filename}>{agent.name} ({agent.filename})</option>
				{/each}
			</select>
		</label>
	</fieldset>

	<TechStackEditor bind:items={projectConfig.techStack} {strings} />
	<SetupCommandsEditor bind:items={projectConfig.setupCommands} {strings} />
	<StringListEditor
		label={strings.sectionCoreFeatures}
		bind:items={projectConfig.coreFeatures}
		placeholder={strings.hintFeature}
		addLabel={strings.add}
	/>
	<StringListEditor
		label={strings.sectionAcceptanceCriteria}
		bind:items={projectConfig.acceptanceCriteria}
		placeholder={strings.hintCriterion}
		addLabel={strings.add}
	/>
	<StringListEditor
		label={strings.sectionWhatNotToDo}
		bind:items={projectConfig.whatNotToDo}
		placeholder={strings.hintProhibition}
		addLabel={strings.add}
	/>
	<DocRefsEditor bind:items={projectConfig.documentationReferences} {strings} />
</form>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.5rem;
	}
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
	label {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		margin-bottom: 0.6rem;
		font-weight: 500;
	}
	input,
	textarea,
	select {
		font: inherit;
	}
</style>
