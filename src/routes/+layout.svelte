<script lang="ts">
	import { resolve } from '$app/paths';
	import favicon from '$lib/assets/favicon.svg';
	import { settings } from '$lib/stores/settings.svelte';
	import { strings } from '$lib/core/i18n/strings';
	import '../app.css';

	let { children } = $props();

	const t = $derived(strings[settings.language]);

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
		<button type="button" data-testid="theme-toggle" onclick={() => settings.toggleTheme()}>
			{settings.theme === 'dark' ? '☀' : '☾'}
		</button>
		<a href={resolve('/settings')}>{t.settingsTitle}</a>
	</nav>
</header>

<main>
	{@render children()}
</main>

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
		gap: 1rem;
	}
</style>
