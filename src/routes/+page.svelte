<script lang="ts">
	import { onMount } from 'svelte';
	import { projectConfig, emptyConfig } from '$lib/stores/projectConfig.svelte';
	import { settings } from '$lib/stores/settings.svelte';
	import { strings } from '$lib/core/i18n/strings';
	import { generateMarkdown } from '$lib/core/generators/markdownGenerator';
	import { configHash, readConfigFromHash } from '$lib/stores/urlState';
	import { agentFilenameKey } from '$lib/core/models/schema';
	import type { ProjectConfig } from '$lib/core/models/types';
	import { createDebouncedWriter } from '$lib/debounce';
	import ProjectForm from '$lib/components/ProjectForm.svelte';
	import PreviewPane from '$lib/components/PreviewPane.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';

	const t = $derived(strings[settings.language]);
	const markdown = $derived(generateMarkdown(projectConfig.config, t));

	// The agent chosen in a shared link (or a custom agent removed later) may not exist
	// in this browser's settings. Keep it selectable so the selector never goes blank.
	const agentOptions = $derived.by(() => {
		const current = projectConfig.targetAi;
		const known = settings.allAgents.some(
			(agent) => agentFilenameKey(agent.filename) === agentFilenameKey(current.filename)
		);
		return known ? settings.allAgents : [...settings.allAgents, current];
	});

	const emptyHash = configHash(emptyConfig());
	let hydrated = $state(false);

	// Encoding the config and rewriting the URL on every keystroke is wasteful, so the
	// write is debounced and flushed when the page is hidden or the route is left.
	const hashWriter = createDebouncedWriter((config: ProjectConfig) => {
		const hash = configHash(config);
		history.replaceState(null, '', hash === emptyHash ? location.pathname + location.search : hash);
	}, 300);

	onMount(() => {
		const fromHash = readConfigFromHash(location.hash);
		if (fromHash) projectConfig.load(fromHash);
		hydrated = true;

		const flush = () => hashWriter.flush();
		window.addEventListener('pagehide', flush);
		return () => {
			window.removeEventListener('pagehide', flush);
			hashWriter.flush();
		};
	});

	// Mirror the current config into the URL hash once hydrated; a default config
	// clears the hash to keep the URL clean.
	$effect(() => {
		if (!hydrated) return;
		hashWriter.schedule($state.snapshot(projectConfig.config));
	});
</script>

<div class="split">
	<div class="pane editor">
		<ProjectForm strings={t} agents={agentOptions} />
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
