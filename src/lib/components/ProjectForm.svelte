<script lang="ts">
	import type { AppStrings } from '$lib/core/i18n/strings';
	import type { AiTarget } from '$lib/core/models/types';
	import { projectConfig } from '$lib/stores/projectConfig.svelte';
	import { templatesEnabled } from '$lib/core/env';
	import StringListEditor from './StringListEditor.svelte';
	import TechStackEditor from './TechStackEditor.svelte';
	import SetupCommandsEditor from './SetupCommandsEditor.svelte';
	import DocRefsEditor from './DocRefsEditor.svelte';
	import PhasesEditor from './PhasesEditor.svelte';
	import ApplyTemplate from './ApplyTemplate.svelte';

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
		<label class="tight">
			{strings.fieldDescription}
			<textarea bind:value={projectConfig.description} rows="3"></textarea>
		</label>
		{#if templatesEnabled}
			<div class="desc-templates">
				<ApplyTemplate section="description" onApply={(c) => projectConfig.applySection('description', c)} {strings} />
			</div>
		{/if}
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

	<div class="section">
		<TechStackEditor bind:items={projectConfig.techStack} {strings} />
		{#if templatesEnabled}
			<ApplyTemplate section="techStack" onApply={(c) => projectConfig.applySection('techStack', c)} {strings} />
		{/if}
	</div>

	<div class="section">
		<SetupCommandsEditor bind:items={projectConfig.setupCommands} {strings} />
		{#if templatesEnabled}
			<ApplyTemplate section="setupCommands" onApply={(c) => projectConfig.applySection('setupCommands', c)} {strings} />
		{/if}
	</div>

	<div class="section">
		<StringListEditor
			label={strings.sectionCoreFeatures}
			bind:items={projectConfig.coreFeatures}
			placeholder={strings.hintFeature}
			addLabel={strings.add}
		/>
		{#if templatesEnabled}
			<ApplyTemplate section="coreFeatures" onApply={(c) => projectConfig.applySection('coreFeatures', c)} {strings} />
		{/if}
	</div>

	<div class="section">
		<PhasesEditor bind:items={projectConfig.phases} {strings} />
		{#if templatesEnabled}
			<ApplyTemplate section="phases" onApply={(c) => projectConfig.applySection('phases', c)} {strings} />
		{/if}
	</div>

	<div class="section">
		<StringListEditor
			label={strings.sectionAcceptanceCriteria}
			bind:items={projectConfig.acceptanceCriteria}
			placeholder={strings.hintCriterion}
			addLabel={strings.add}
		/>
		{#if templatesEnabled}
			<ApplyTemplate section="acceptanceCriteria" onApply={(c) => projectConfig.applySection('acceptanceCriteria', c)} {strings} />
		{/if}
	</div>

	<div class="section">
		<StringListEditor
			label={strings.sectionWhatToDo}
			bind:items={projectConfig.whatToDo}
			placeholder={strings.hintGuideline}
			addLabel={strings.add}
		/>
		{#if templatesEnabled}
			<ApplyTemplate section="whatToDo" onApply={(c) => projectConfig.applySection('whatToDo', c)} {strings} />
		{/if}
	</div>

	<div class="section">
		<StringListEditor
			label={strings.sectionWhatNotToDo}
			bind:items={projectConfig.whatNotToDo}
			placeholder={strings.hintProhibition}
			addLabel={strings.add}
		/>
		{#if templatesEnabled}
			<ApplyTemplate section="whatNotToDo" onApply={(c) => projectConfig.applySection('whatNotToDo', c)} {strings} />
		{/if}
	</div>

	<div class="section">
		<DocRefsEditor bind:items={projectConfig.documentationReferences} {strings} />
		{#if templatesEnabled}
			<ApplyTemplate section="documentationReferences" onApply={(c) => projectConfig.applySection('documentationReferences', c)} {strings} />
		{/if}
	</div>
</form>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		padding: 1.5rem;
	}
	/* Each section groups its editor with the "Apply template" control below it. */
	.section {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	fieldset {
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 0.9rem 1rem 1rem;
		margin: 0;
	}
	legend {
		font-weight: 600;
		padding: 0 0.4rem;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		margin-bottom: 0.75rem;
		font-weight: 500;
	}
	fieldset > label:last-child {
		margin-bottom: 0;
	}
	/* Description sits directly above its apply control; drop the gap between. */
	label.tight {
		margin-bottom: 0.4rem;
	}
	.desc-templates {
		margin-bottom: 0.75rem;
	}
	input,
	textarea,
	select {
		font: inherit;
	}
</style>
