<script lang="ts">
	import { resolve } from '$app/paths';
	import { settings } from '$lib/stores/settings.svelte';
	import { strings } from '$lib/core/i18n/strings';
	import { templates } from '$lib/stores/templates.svelte';
	import { templatesEnabled } from '$lib/core/env';
	import { sectionLabel } from '$lib/core/models/sectionContent';
	import type { SectionContent, SectionTemplate, TemplateSectionKey } from '$lib/core/models/types';
	import TemplateEditor from '$lib/components/TemplateEditor.svelte';

	const t = $derived(strings[settings.language]);

	type Mode = { kind: 'list' } | { kind: 'new' } | { kind: 'edit'; template: SectionTemplate };
	let mode = $state<Mode>({ kind: 'list' });

	function startNew() {
		mode = { kind: 'new' };
	}
	function startEdit(template: SectionTemplate) {
		mode = { kind: 'edit', template };
	}
	function cancel() {
		mode = { kind: 'list' };
	}
	function save(section: TemplateSectionKey, name: string, content: SectionContent) {
		if (mode.kind === 'edit') {
			templates.update(mode.template.id, { name, content });
		} else {
			templates.save(section, name, content);
		}
		mode = { kind: 'list' };
	}
	function remove(id: string) {
		templates.remove(id);
	}
</script>

<div class="templates-page">
	<a class="back" href={resolve('/')} aria-label="←">←</a>
	<h1>{t.templatesManageTitle}</h1>

	{#if !templatesEnabled}
		<p class="intro">{t.templatesManageIntro}</p>
	{:else if mode.kind === 'list'}
		<p class="intro">{t.templatesManageIntro}</p>

		<button type="button" class="primary new" onclick={startNew} data-testid="template-new">
			➕ {t.templateNew}
		</button>

		<ul class="list">
			{#each templates.items as template (template.id)}
				<li data-testid="template-item">
					<div class="meta">
						<span class="name">{template.name}</span>
						<span class="section">{sectionLabel(template.section, t)}</span>
					</div>
					<div class="actions">
						<button type="button" onclick={() => startEdit(template)} data-testid="template-edit">
							✏️ {t.templateEdit}
						</button>
						<button
							type="button"
							class="icon"
							aria-label={t.templateDelete}
							title={t.templateDelete}
							onclick={() => remove(template.id)}
							data-testid="template-delete"
						>
							🗑️
						</button>
					</div>
				</li>
			{:else}
				<li class="empty">{t.templateEmpty}</li>
			{/each}
		</ul>
	{:else}
		{#key mode.kind === 'edit' ? mode.template.id : 'new'}
			<TemplateEditor
				strings={t}
				template={mode.kind === 'edit' ? mode.template : undefined}
				onSave={save}
				onCancel={cancel}
			/>
		{/key}
	{/if}
</div>

<style>
	.templates-page {
		max-width: 720px;
		margin: 0 auto;
		padding: 1.5rem;
	}
	.back {
		text-decoration: none;
		font-size: 1.2rem;
	}
	h1 {
		margin: 0.5rem 0;
	}
	.intro {
		color: var(--muted);
		margin: 0 0 1.25rem;
	}
	.new {
		margin-bottom: 1.25rem;
	}
	button {
		font: inherit;
		cursor: pointer;
	}
	.primary {
		font-weight: 600;
	}
	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.list li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.6rem 0.75rem;
		border: 1px solid var(--border);
		border-radius: 8px;
	}
	.meta {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}
	.name {
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.section {
		font-size: 0.8rem;
		color: var(--muted);
	}
	.actions {
		display: flex;
		gap: 0.4rem;
		flex: 0 0 auto;
	}
	.icon {
		width: 2rem;
		height: 2rem;
		padding: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
	}
	.empty {
		justify-content: center;
		color: var(--muted);
		border-style: dashed;
	}
</style>
