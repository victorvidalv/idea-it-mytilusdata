<script lang="ts">
	/** Opción individual del dropdown de SearchableSelect */
	import { isSelected, getOptionClasses } from './searchable-select-utils.js';

	interface Props {
		option: { value: string | number; label: string };
		currentValue: string | number | null | undefined;
		onSelect: (value: string | number) => void;
	}

	let { option, currentValue, onSelect }: Props = $props();
</script>

<button
	type="button"
	onclick={() => onSelect(option.value)}
	class={getOptionClasses(isSelected(option.value, currentValue))}
>
	<span class="truncate">{option.label}</span>
	{#if isSelected(option.value, currentValue)}
		<svg class="ml-2 h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
		</svg>
	{/if}
</button>