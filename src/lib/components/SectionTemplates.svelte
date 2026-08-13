<script lang="ts">
	import type { AppStrings } from '$lib/core/i18n/strings';
	import type { SectionContent, TemplateSectionKey } from '$lib/core/models/types';
	import { templates } from '$lib/stores/templates.svelte';

	interface Props {
		section: TemplateSectionKey;
		current: SectionContent;
		onApply: (_content: SectionContent) => void;
		strings: AppStrings;
	}

	let { section, current, onApply, strings }: Props = $props();

	const list = $derived(templates.forSection(section));
	let selectedId = $state('');
	let newName = $state('');

	function apply() {
		const template = templates.get(selectedId);
		if (template) onApply(template.content);
	}

	function remove() {
		if (!selectedId) return;
		templates.remove(selectedId);
		selectedId = '';
	}

	function save() {
		const name = newName.trim();
		if (!name) return;
		const created = templates.save(section, name, current);
		newName = '';
		selectedId = created.id;
	}
</script>

<div class="templates" data-testid={`templates-${section}`}>
	<span class="label">{strings.templatesLabel}</span>
	<div class="apply-row">
		<select bind:value={selectedId} aria-label={strings.templatesLabel}>
			<option value="" disabled>
				{list.length === 0 ? strings.templateEmpty : strings.templateSelectPlaceholder}
			</option>
			{#each list as template (template.id)}
				<option value={template.id}>{template.name}</option>
			{/each}
		</select>
		<button type="button" onclick={apply} disabled={!selectedId} data-testid="template-apply">
			{strings.templateApply}
		</button>
		<button
			type="button"
			class="remove"
			onclick={remove}
			disabled={!selectedId}
			aria-label={strings.templateDelete}
			title={strings.templateDelete}>✕</button
		>
	</div>
	<div class="save-row">
		<input
			bind:value={newName}
			placeholder={strings.templateNamePlaceholder}
			aria-label={strings.templateNamePlaceholder}
			onkeydown={(event) => {
				if (event.key === 'Enter') {
					event.preventDefault();
					save();
				}
			}}
		/>
		<button type="button" onclick={save} disabled={!newName.trim()} data-testid="template-save">
			{strings.templateSave}
		</button>
	</div>
</div>

<style>
	.templates {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		margin: 0 0 0.5rem;
		padding: 0.5rem 0.6rem;
		border: 1px dashed var(--border);
		border-radius: 6px;
		background: var(--header-bg);
	}
	.label {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		opacity: 0.75;
	}
	.apply-row,
	.save-row {
		display: flex;
		gap: 0.4rem;
	}
	select,
	.save-row input {
		flex: 1;
		min-width: 0;
		font: inherit;
	}
	button {
		flex: 0 0 auto;
		font: inherit;
	}
</style>
