<script lang="ts">
	import type { AppStrings } from '$lib/core/i18n/strings';
	import type { SectionContent, TemplateSectionKey } from '$lib/core/models/types';
	import { templates } from '$lib/stores/templates.svelte';

	interface Props {
		section: TemplateSectionKey;
		title: string;
		current: SectionContent;
		onApply: (_content: SectionContent) => void;
		strings: AppStrings;
	}

	let { section, title, current, onApply, strings }: Props = $props();

	const list = $derived(templates.forSection(section));
	let dialog = $state<HTMLDialogElement>();
	let newName = $state('');

	function open() {
		dialog?.showModal();
	}
	function close() {
		dialog?.close();
	}
	function apply(id: string) {
		const template = templates.get(id);
		if (template) onApply(template.content);
		close();
	}
	function remove(id: string) {
		templates.remove(id);
	}
	function save() {
		const name = newName.trim();
		if (!name) return;
		templates.save(section, name, current);
		newName = '';
	}
</script>

<button
	type="button"
	class="open-templates"
	data-testid={`templates-open-${section}`}
	onclick={open}
>
	🗂️ {strings.templateOpen}
</button>

<dialog
	bind:this={dialog}
	class="templates-dialog"
	data-testid={`templates-dialog-${section}`}
	aria-label={`${strings.templatesLabel} — ${title}`}
	onclick={(event) => {
		if (event.target === dialog) close();
	}}
>
	<div class="modal">
		<header>
			<h2>{strings.templatesLabel} — {title}</h2>
			<button type="button" class="icon" aria-label={strings.templateClose} onclick={close}
				>✕</button
			>
		</header>

		<ul class="list">
			{#each list as template (template.id)}
				<li>
					<span class="name">{template.name}</span>
					<button
						type="button"
						class="primary"
						data-testid="template-apply"
						onclick={() => apply(template.id)}
					>
						✅ {strings.templateApply}
					</button>
					<button
						type="button"
						class="icon"
						aria-label={strings.templateDelete}
						title={strings.templateDelete}
						onclick={() => remove(template.id)}
					>
						🗑️
					</button>
				</li>
			{:else}
				<li class="empty">{strings.templateEmpty}</li>
			{/each}
		</ul>

		<div class="save">
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
			<button type="button" onclick={save} data-testid="template-save" disabled={!newName.trim()}>
				💾 {strings.templateSave}
			</button>
		</div>

		<footer>
			<button type="button" onclick={close}>{strings.templateClose}</button>
		</footer>
	</div>
</dialog>

<style>
	.open-templates {
		align-self: flex-start;
		font: inherit;
		font-size: 0.85rem;
		padding: 0.3rem 0.7rem;
		color: var(--muted);
	}
	.templates-dialog {
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 0;
		width: min(28rem, calc(100vw - 2rem));
		background: var(--input-bg);
		color: var(--fg);
	}
	.templates-dialog::backdrop {
		background: rgba(0, 0, 0, 0.4);
	}
	.modal {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.25rem 1.5rem 1.4rem;
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}
	header h2 {
		margin: 0;
		font-size: 1.05rem;
	}
	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		max-height: 45vh;
		overflow: auto;
	}
	.list li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.55rem;
		border: 1px solid var(--border);
		border-radius: 6px;
	}
	.list .name {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.list .empty {
		justify-content: center;
		color: var(--muted);
		border-style: dashed;
	}
	.save {
		display: flex;
		gap: 0.5rem;
		border-top: 1px solid var(--border);
		padding-top: 1rem;
	}
	.save input {
		flex: 1;
		min-width: 0;
		font: inherit;
	}
	button {
		font: inherit;
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
	footer {
		display: flex;
		justify-content: flex-end;
	}
</style>
