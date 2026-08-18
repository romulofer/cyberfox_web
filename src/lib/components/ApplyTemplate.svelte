<script lang="ts">
	import type { AppStrings } from '$lib/core/i18n/strings';
	import type { SectionContent, TemplateSectionKey } from '$lib/core/models/types';
	import { templates } from '$lib/stores/templates.svelte';

	interface Props {
		section: TemplateSectionKey;
		onApply: (_content: SectionContent) => void;
		strings: AppStrings;
	}

	let { section, onApply, strings }: Props = $props();

	const list = $derived(templates.forSection(section));
	let selected = $state('');

	function apply() {
		const template = templates.get(selected);
		if (template) onApply(template.content);
		selected = '';
	}
</script>

{#if list.length > 0}
	<div class="apply-template">
		<select
			bind:value={selected}
			aria-label={strings.templateApplyLabel}
			data-testid={`apply-select-${section}`}
		>
			<option value="">{strings.templateApplyLabel}</option>
			{#each list as template (template.id)}
				<option value={template.id}>{template.name}</option>
			{/each}
		</select>
		<button
			type="button"
			disabled={!selected}
			onclick={apply}
			data-testid={`apply-template-${section}`}
		>
			✅ {strings.templateApply}
		</button>
	</div>
{/if}

<style>
	.apply-template {
		display: flex;
		gap: 0.5rem;
		align-self: flex-start;
		font-size: 0.85rem;
	}
	select,
	button {
		font: inherit;
	}
</style>
