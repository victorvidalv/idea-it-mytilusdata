<script lang="ts">
	/** Botón del SearchableSelect que muestra la opción seleccionada */
	import { getButtonClasses } from './searchable-select-utils.js';

	interface Props {
		selectedLabel: string | undefined;
		placeholder: string;
		disabled: boolean;
		open: boolean;
		hasSelection: boolean;
		onclick: () => void;
	}

	let { selectedLabel, placeholder, disabled, open, hasSelection, onclick }: Props = $props();
</script>

<button type="button" {onclick} {disabled} class={getButtonClasses(disabled, open)}>
	<span class="truncate {hasSelection ? 'text-foreground' : 'text-muted-foreground'}">
		{selectedLabel ?? placeholder}
	</span>
	<svg
		class="ml-2 h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 {open ? 'rotate-180' : ''}"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
	>
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
	</svg>
</button>