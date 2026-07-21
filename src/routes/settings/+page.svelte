<script lang="ts">
	import { resolve } from '$app/paths';
	import { settings } from '$lib/stores/settings.svelte';
	import { strings } from '$lib/core/i18n/strings';
	import { builtInAgents } from '$lib/core/agents/builtInAgents';

	const t = $derived(strings[settings.language]);

	let newName = $state('');
	let newFilename = $state('');

	function addAgent() {
		const name = newName.trim();
		const filename = newFilename.trim();
		if (!name || !filename) return;
		settings.addCustomAgent({ name, filename });
		newName = '';
		newFilename = '';
	}
</script>

<div class="settings">
	<a class="back" href={resolve('/')}>←</a>
	<h1>{t.settingsTitle}</h1>

	<section>
		<h2>{t.settingsLanguage}</h2>
		<label>
			<input
				type="radio"
				name="language"
				checked={settings.language === 'ptBR'}
				onchange={() => settings.setLanguage('ptBR')}
			/>
			{t.languagePtBR}
		</label>
		<label>
			<input
				type="radio"
				name="language"
				checked={settings.language === 'en'}
				onchange={() => settings.setLanguage('en')}
			/>
			{t.languageEn}
		</label>
	</section>

	<section>
		<h2>{t.settingsTheme}</h2>
		<label>
			<input
				type="radio"
				name="theme"
				checked={settings.theme === 'light'}
				onchange={() => settings.setTheme('light')}
			/>
			{t.themeLight}
		</label>
		<label>
			<input
				type="radio"
				name="theme"
				checked={settings.theme === 'dark'}
				onchange={() => settings.setTheme('dark')}
			/>
			{t.themeDark}
		</label>
	</section>

	<section>
		<h2>{t.sectionCustomAgents}</h2>
		<ul class="agents">
			{#each settings.allAgents as agent (agent.filename + agent.name)}
				<li>
					<span>{agent.name} <code>{agent.filename}</code></span>
					{#if !builtInAgents.some((b) => b.filename === agent.filename && b.name === agent.name)}
						<button
							type="button"
							data-testid="remove-agent"
							onclick={() => settings.removeCustomAgent(agent)}
						>
							✕
						</button>
					{/if}
				</li>
			{/each}
		</ul>
		<div class="add-agent">
			<input
				bind:value={newName}
				placeholder={t.hintAgentName}
				aria-label={t.fieldAgentName}
				data-testid="agent-name-input"
			/>
			<input
				bind:value={newFilename}
				placeholder={t.hintAgentFilename}
				aria-label={t.fieldAgentFilename}
				data-testid="agent-filename-input"
			/>
			<button type="button" class="primary" data-testid="add-agent" onclick={addAgent}
				>{t.add}</button
			>
		</div>
	</section>
</div>

<style>
	.settings {
		max-width: 640px;
		margin: 0 auto;
		padding: 1.5rem;
	}
	.back {
		text-decoration: none;
		font-size: 1.2rem;
	}
	section {
		margin-top: 1.5rem;
	}
	label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.4rem;
	}
	label input {
		width: auto;
	}
	.agents {
		list-style: none;
		padding: 0;
	}
	.agents li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.35rem 0;
		border-bottom: 1px solid var(--border);
	}
	.add-agent {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}
</style>
