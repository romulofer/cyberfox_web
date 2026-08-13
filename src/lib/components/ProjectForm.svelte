<script lang="ts">
	import type { AppStrings } from '$lib/core/i18n/strings';
	import type {
		AiTarget,
		DocumentationReference,
		ProjectPhase,
		SectionContent,
		SetupCommand,
		TechStackEntry
	} from '$lib/core/models/types';
	import { projectConfig } from '$lib/stores/projectConfig.svelte';
	import { templatesEnabled } from '$lib/core/env';
	import StringListEditor from './StringListEditor.svelte';
	import TechStackEditor from './TechStackEditor.svelte';
	import SetupCommandsEditor from './SetupCommandsEditor.svelte';
	import DocRefsEditor from './DocRefsEditor.svelte';
	import PhasesEditor from './PhasesEditor.svelte';
	import SectionTemplates from './SectionTemplates.svelte';

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

	// Applying a template appends a deep copy of its content to the section, so the
	// stored template stays independent from later edits.
	function applyDescription(content: SectionContent) {
		const text = String(content);
		projectConfig.description = projectConfig.description
			? `${projectConfig.description}\n\n${text}`
			: text;
	}
	function applyTechStack(content: SectionContent) {
		projectConfig.techStack = [
			...projectConfig.techStack,
			...structuredClone(content as TechStackEntry[])
		];
	}
	function applySetupCommands(content: SectionContent) {
		projectConfig.setupCommands = [
			...projectConfig.setupCommands,
			...structuredClone(content as SetupCommand[])
		];
	}
	function applyCoreFeatures(content: SectionContent) {
		projectConfig.coreFeatures = [...projectConfig.coreFeatures, ...(content as string[])];
	}
	function applyPhases(content: SectionContent) {
		projectConfig.phases = [...projectConfig.phases, ...structuredClone(content as ProjectPhase[])];
	}
	function applyAcceptanceCriteria(content: SectionContent) {
		projectConfig.acceptanceCriteria = [
			...projectConfig.acceptanceCriteria,
			...(content as string[])
		];
	}
	function applyWhatNotToDo(content: SectionContent) {
		projectConfig.whatNotToDo = [...projectConfig.whatNotToDo, ...(content as string[])];
	}
	function applyDocRefs(content: SectionContent) {
		projectConfig.documentationReferences = [
			...projectConfig.documentationReferences,
			...structuredClone(content as DocumentationReference[])
		];
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
		{#if templatesEnabled}
			<SectionTemplates
				section="description"
				current={projectConfig.description}
				onApply={applyDescription}
				{strings}
			/>
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

	{#if templatesEnabled}
		<SectionTemplates
			section="techStack"
			current={projectConfig.techStack}
			onApply={applyTechStack}
			{strings}
		/>
	{/if}
	<TechStackEditor bind:items={projectConfig.techStack} {strings} />

	{#if templatesEnabled}
		<SectionTemplates
			section="setupCommands"
			current={projectConfig.setupCommands}
			onApply={applySetupCommands}
			{strings}
		/>
	{/if}
	<SetupCommandsEditor bind:items={projectConfig.setupCommands} {strings} />

	{#if templatesEnabled}
		<SectionTemplates
			section="coreFeatures"
			current={projectConfig.coreFeatures}
			onApply={applyCoreFeatures}
			{strings}
		/>
	{/if}
	<StringListEditor
		label={strings.sectionCoreFeatures}
		bind:items={projectConfig.coreFeatures}
		placeholder={strings.hintFeature}
		addLabel={strings.add}
	/>

	{#if templatesEnabled}
		<SectionTemplates
			section="phases"
			current={projectConfig.phases}
			onApply={applyPhases}
			{strings}
		/>
	{/if}
	<PhasesEditor bind:items={projectConfig.phases} {strings} />

	{#if templatesEnabled}
		<SectionTemplates
			section="acceptanceCriteria"
			current={projectConfig.acceptanceCriteria}
			onApply={applyAcceptanceCriteria}
			{strings}
		/>
	{/if}
	<StringListEditor
		label={strings.sectionAcceptanceCriteria}
		bind:items={projectConfig.acceptanceCriteria}
		placeholder={strings.hintCriterion}
		addLabel={strings.add}
	/>

	{#if templatesEnabled}
		<SectionTemplates
			section="whatNotToDo"
			current={projectConfig.whatNotToDo}
			onApply={applyWhatNotToDo}
			{strings}
		/>
	{/if}
	<StringListEditor
		label={strings.sectionWhatNotToDo}
		bind:items={projectConfig.whatNotToDo}
		placeholder={strings.hintProhibition}
		addLabel={strings.add}
	/>

	{#if templatesEnabled}
		<SectionTemplates
			section="documentationReferences"
			current={projectConfig.documentationReferences}
			onApply={applyDocRefs}
			{strings}
		/>
	{/if}
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
	.form :global(.templates) {
		margin-bottom: -0.5rem;
	}
</style>
