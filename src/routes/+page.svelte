<script lang="ts">
	import { onMount } from 'svelte';
	import { projectConfig, emptyConfig } from '$lib/stores/projectConfig.svelte';
	import { settings } from '$lib/stores/settings.svelte';
	import { strings } from '$lib/core/i18n/strings';
	import { generateMarkdown } from '$lib/core/generators/markdownGenerator';
	import { configHash, encodeConfig, readConfigFromHash } from '$lib/stores/urlState';
	import ProjectForm from '$lib/components/ProjectForm.svelte';
	import PreviewPane from '$lib/components/PreviewPane.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';

	const t = $derived(strings[settings.language]);
	const markdown = $derived(generateMarkdown(projectConfig.config, t));

	const emptyEncoded = encodeConfig(emptyConfig());
	let hydrated = $state(false);
	let clearDialog = $state<HTMLDialogElement>();

	function clearForm() {
		projectConfig.reset();
		clearDialog?.close();
	}

	onMount(() => {
		const fromHash = readConfigFromHash(location.hash);
		if (fromHash) projectConfig.load(fromHash);
		hydrated = true;
	});

	// Mirror the current config into the URL hash once hydrated; a default config
	// clears the hash to keep the URL clean.
	$effect(() => {
		const encoded = encodeConfig(projectConfig.config);
		if (!hydrated) return;
		const next =
			encoded === emptyEncoded
				? location.pathname + location.search
				: configHash(projectConfig.config);
		history.replaceState(null, '', next);
	});
</script>

<div class="split">
	<div class="pane editor">
		<div class="editor-toolbar">
			<button
				type="button"
				class="icon-btn"
				data-testid="clear-form"
				title={t.clearDialogTitle}
				aria-label={t.clearDialogTitle}
				onclick={() => clearDialog?.showModal()}
			>
				🧹
			</button>
		</div>
		<ProjectForm strings={t} agents={settings.allAgents} />
	</div>
	<div class="pane preview">
		<div class="preview-toolbar">
			<Toolbar filename={projectConfig.targetAi.filename} {markdown} strings={t} />
		</div>
		<PreviewPane {markdown} placeholder={t.previewPlaceholder} />
	</div>
</div>

<dialog bind:this={clearDialog} class="clear-dialog" data-testid="clear-dialog">
	<h2>{t.clearDialogTitle}</h2>
	<p>{t.clearDialogContent}</p>
	<div class="dialog-actions">
		<button type="button" onclick={() => clearDialog?.close()}>
			{t.clearDialogCancel}
		</button>
		<button type="button" class="danger" data-testid="clear-confirm" onclick={clearForm}>
			{t.clearDialogConfirm}
		</button>
	</div>
</dialog>

<style>
	.split {
		display: grid;
		grid-template-columns: 1fr 1fr;
		height: calc(100vh - 3.1rem);
	}
	.pane {
		overflow: auto;
		height: 100%;
	}
	.editor {
		border-right: 1px solid var(--border);
	}
	.preview {
		display: flex;
		flex-direction: column;
	}
	.editor-toolbar {
		display: flex;
		justify-content: flex-end;
		padding: 0.6rem 1rem;
		border-bottom: 1px solid var(--border);
		background: var(--header-bg);
	}
	.icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.2rem;
		height: 2.2rem;
		padding: 0;
		font-size: 1.15rem;
		line-height: 1;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--input-bg);
		color: var(--fg);
		cursor: pointer;
	}
	.preview-toolbar {
		padding: 0.6rem 1rem;
		border-bottom: 1px solid var(--border);
		background: var(--header-bg);
	}
	.clear-dialog {
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 1.25rem 1.5rem;
		max-width: 24rem;
		background: var(--input-bg);
		color: var(--fg);
	}
	.clear-dialog::backdrop {
		background: rgba(0, 0, 0, 0.4);
	}
	.clear-dialog h2 {
		margin: 0 0 0.5rem;
		font-size: 1.1rem;
	}
	.clear-dialog p {
		margin: 0 0 1.25rem;
	}
	.dialog-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}
	.dialog-actions button {
		font: inherit;
		padding: 0.4rem 0.9rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--input-bg);
		color: var(--fg);
		cursor: pointer;
	}
	.dialog-actions .danger {
		font-weight: 600;
		border-color: var(--accent);
		color: var(--accent);
	}
	@media (max-width: 800px) {
		.split {
			grid-template-columns: 1fr;
			height: auto;
		}
	}
</style>
