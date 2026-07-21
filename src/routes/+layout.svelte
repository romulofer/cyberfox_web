<script lang="ts">
	import { resolve } from '$app/paths';
	import favicon from '$lib/assets/favicon.svg';
	import { settings } from '$lib/stores/settings.svelte';
	import { projectConfig } from '$lib/stores/projectConfig.svelte';
	import { strings } from '$lib/core/i18n/strings';
	import '../app.css';

	let { children } = $props();

	const t = $derived(strings[settings.language]);

	let clearDialog = $state<HTMLDialogElement>();

	function clearForm() {
		projectConfig.reset();
		clearDialog?.close();
	}

	$effect(() => {
		document.documentElement.dataset.theme = settings.theme;
		document.documentElement.lang = settings.language === 'ptBR' ? 'pt-BR' : 'en';
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="app-header">
	<a class="brand" href={resolve('/')}>Cyberfox</a>
	<nav>
		<button
			type="button"
			class="icon-btn"
			data-testid="language-toggle"
			title={settings.language === 'en' ? 'Mudar para Português' : 'Switch to English'}
			aria-label={settings.language === 'en' ? 'Mudar para Português' : 'Switch to English'}
			onclick={() => settings.toggleLanguage()}
		>
			{settings.language === 'en' ? '🇧🇷' : '🇺🇸'}
		</button>
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
		<button
			type="button"
			class="icon-btn"
			data-testid="theme-toggle"
			title={settings.theme === 'dark' ? t.themeLight : t.themeDark}
			aria-label={settings.theme === 'dark' ? t.themeLight : t.themeDark}
			onclick={() => settings.toggleTheme()}
		>
			{settings.theme === 'dark' ? '☀' : '☾'}
		</button>
		<a
			class="icon-btn"
			href={resolve('/settings')}
			data-testid="settings-link"
			title={t.settingsTitle}
			aria-label={t.settingsTitle}
		>
			⚙
		</a>
	</nav>
</header>

<main>
	{@render children()}
</main>

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
	.app-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.6rem 1.25rem;
		border-bottom: 1px solid var(--border);
		background: var(--header-bg);
	}
	.brand {
		font-weight: 700;
		font-size: 1.15rem;
		text-decoration: none;
		color: var(--accent);
	}
	nav {
		display: flex;
		align-items: center;
		gap: 0.5rem;
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
		text-decoration: none;
		cursor: pointer;
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
</style>
