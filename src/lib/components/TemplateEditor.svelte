<script lang="ts">
	import type { AppStrings } from '$lib/core/i18n/strings';
	import type {
		DocumentationReference,
		ProjectPhase,
		SectionContent,
		SectionTemplate,
		SetupCommand,
		TechStackEntry,
		TemplateSectionKey
	} from '$lib/core/models/types';
	import {
		isStringListSection,
		sectionLabel,
		templateSectionKeys
	} from '$lib/core/models/sectionContent';
	import { untrack } from 'svelte';
	import StringListEditor from './StringListEditor.svelte';
	import TechStackEditor from './TechStackEditor.svelte';
	import SetupCommandsEditor from './SetupCommandsEditor.svelte';
	import DocRefsEditor from './DocRefsEditor.svelte';
	import PhasesEditor from './PhasesEditor.svelte';

	interface Props {
		strings: AppStrings;
		// When present the editor edits an existing template; its section is locked.
		template?: SectionTemplate;
		onSave: (_section: TemplateSectionKey, _name: string, _content: SectionContent) => void;
		onCancel: () => void;
	}

	let { strings, template, onSave, onCancel }: Props = $props();

	const editing = $derived(!!template);

	// Capture the incoming template once; the editor works on an independent copy and
	// is remounted (via {#key}) whenever a different template is opened.
	const initial = untrack(() => {
		const t = template;
		return {
			section: t?.section ?? ('coreFeatures' as TemplateSectionKey),
			name: t?.name ?? '',
			text: typeof t?.content === 'string' ? t.content : '',
			techStack: t?.section === 'techStack' ? structuredClone(t.content as TechStackEntry[]) : [],
			setupCommands:
				t?.section === 'setupCommands' ? structuredClone(t.content as SetupCommand[]) : [],
			stringList: t && isStringListSection(t.section) ? [...(t.content as string[])] : [],
			phases: t?.section === 'phases' ? structuredClone(t.content as ProjectPhase[]) : [],
			docRefs:
				t?.section === 'documentationReferences'
					? structuredClone(t.content as DocumentationReference[])
					: []
		};
	});

	// One typed holder per content shape; only the one matching `section` is used.
	let section = $state<TemplateSectionKey>(initial.section);
	let name = $state(initial.name);
	let textContent = $state(initial.text);
	let techStack = $state<TechStackEntry[]>(initial.techStack);
	let setupCommands = $state<SetupCommand[]>(initial.setupCommands);
	let stringList = $state<string[]>(initial.stringList);
	let phases = $state<ProjectPhase[]>(initial.phases);
	let docRefs = $state<DocumentationReference[]>(initial.docRefs);

	// Switching section (new-template mode only) discards any content typed under the
	// previous shape, since the shapes are incompatible.
	function changeSection(event: Event) {
		section = (event.currentTarget as HTMLSelectElement).value as TemplateSectionKey;
		textContent = '';
		techStack = [];
		setupCommands = [];
		stringList = [];
		phases = [];
		docRefs = [];
	}

	function currentContent(): SectionContent {
		switch (section) {
			case 'description':
				return textContent;
			case 'techStack':
				return techStack;
			case 'setupCommands':
				return setupCommands;
			case 'phases':
				return phases;
			case 'documentationReferences':
				return docRefs;
			default:
				return stringList;
		}
	}

	function stringListPlaceholder(): string {
		if (section === 'acceptanceCriteria') return strings.hintCriterion;
		if (section === 'whatToDo') return strings.hintGuideline;
		if (section === 'whatNotToDo') return strings.hintProhibition;
		return strings.hintFeature;
	}

	function submit() {
		const trimmed = name.trim();
		if (!trimmed) return;
		onSave(section, trimmed, currentContent());
	}
</script>

<form class="editor" data-testid="template-editor" onsubmit={(e) => e.preventDefault()}>
	<label>
		{strings.templateSection}
		<select
			value={section}
			onchange={changeSection}
			disabled={editing}
			data-testid="template-section-select"
		>
			{#each templateSectionKeys as key (key)}
				<option value={key}>{sectionLabel(key, strings)}</option>
			{/each}
		</select>
	</label>

	<label>
		{strings.templateNamePlaceholder}
		<input
			bind:value={name}
			placeholder={strings.templateNamePlaceholder}
			data-testid="template-name-input"
		/>
	</label>

	<div class="content">
		{#if section === 'description'}
			<textarea
				bind:value={textContent}
				rows="4"
				aria-label={strings.fieldDescription}
				data-testid="template-description"></textarea>
		{:else if section === 'techStack'}
			<TechStackEditor bind:items={techStack} {strings} />
		{:else if section === 'setupCommands'}
			<SetupCommandsEditor bind:items={setupCommands} {strings} />
		{:else if section === 'phases'}
			<PhasesEditor bind:items={phases} {strings} />
		{:else if section === 'documentationReferences'}
			<DocRefsEditor bind:items={docRefs} {strings} />
		{:else}
			<StringListEditor
				label={sectionLabel(section, strings)}
				bind:items={stringList}
				placeholder={stringListPlaceholder()}
				addLabel={strings.add}
			/>
		{/if}
	</div>

	<footer>
		<button type="button" onclick={onCancel} data-testid="template-cancel">
			↩️ {strings.templateCancel}
		</button>
		<button
			type="submit"
			class="primary"
			onclick={submit}
			disabled={!name.trim()}
			data-testid="template-save"
		>
			💾 {strings.templateSave}
		</button>
	</footer>
</form>

<style>
	.editor {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 1.25rem;
		background: var(--input-bg);
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-weight: 500;
	}
	input,
	textarea,
	select {
		font: inherit;
	}
	.content {
		display: flex;
		flex-direction: column;
	}
	footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}
	footer button {
		font: inherit;
	}
	.primary {
		font-weight: 600;
	}
</style>
