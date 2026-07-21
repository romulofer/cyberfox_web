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
		<ProjectForm strings={t} agents={settings.allAgents} />
	</div>
	<div class="pane preview">
		<div class="preview-toolbar">
			<Toolbar filename={projectConfig.targetAi.filename} {markdown} strings={t} />
		</div>
		<PreviewPane {markdown} placeholder={t.previewPlaceholder} />
	</div>
</div>

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
	.preview-toolbar {
		padding: 0.6rem 1rem;
		border-bottom: 1px solid var(--border);
		background: var(--header-bg);
	}
	@media (max-width: 800px) {
		.split {
			grid-template-columns: 1fr;
			height: auto;
		}
	}
</style>
