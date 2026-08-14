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
		<label class="tight">
			{strings.fieldDescription}
			<textarea bind:value={projectConfig.description} rows="3"></textarea>
		</label>
		{#if templatesEnabled}
			<div class="desc-templates">
				<SectionTemplates
					section="description"
					title={strings.fieldDescription}
					current={projectConfig.description}
					onApply={applyDescription}
					{strings}
				/>
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
			<SectionTemplates
				section="techStack"
				title={strings.sectionTechStack}
				current={projectConfig.techStack}
				onApply={applyTechStack}
				{strings}
			/>
		{/if}
	</div>

	<div class="section">
		<SetupCommandsEditor bind:items={projectConfig.setupCommands} {strings} />
		{#if templatesEnabled}
			<SectionTemplates
				section="setupCommands"
				title={strings.sectionSetupCommands}
				current={projectConfig.setupCommands}
				onApply={applySetupCommands}
				{strings}
			/>
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
			<SectionTemplates
				section="coreFeatures"
				title={strings.sectionCoreFeatures}
				current={projectConfig.coreFeatures}
				onApply={applyCoreFeatures}
				{strings}
			/>
		{/if}
	</div>

	<div class="section">
		<PhasesEditor bind:items={projectConfig.phases} {strings} />
		{#if templatesEnabled}
			<SectionTemplates
				section="phases"
				title={strings.sectionPhases}
				current={projectConfig.phases}
				onApply={applyPhases}
				{strings}
			/>
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
			<SectionTemplates
				section="acceptanceCriteria"
				title={strings.sectionAcceptanceCriteria}
				current={projectConfig.acceptanceCriteria}
				onApply={applyAcceptanceCriteria}
				{strings}
			/>
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
			<SectionTemplates
				section="whatNotToDo"
				title={strings.sectionWhatNotToDo}
				current={projectConfig.whatNotToDo}
				onApply={applyWhatNotToDo}
				{strings}
			/>
		{/if}
	</div>

	<div class="section">
		<DocRefsEditor bind:items={projectConfig.documentationReferences} {strings} />
		{#if templatesEnabled}
			<SectionTemplates
				section="documentationReferences"
				title={strings.sectionDocRefs}
				current={projectConfig.documentationReferences}
				onApply={applyDocRefs}
				{strings}
			/>
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
	/* Each section groups its editor with the "Templates" button below it. */
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
	/* Description sits directly above its Templates button; drop the gap between. */
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
