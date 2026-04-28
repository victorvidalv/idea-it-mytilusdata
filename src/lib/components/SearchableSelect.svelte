<script lang="ts">
	/** Componente Select con búsqueda integrada (estilo Select2) - Svelte 5 */
	import { isSelected } from './searchable-select-utils.js';
	import SearchableSelectButton from './SearchableSelectButton.svelte';
	import SearchableSelectDropdown from './SearchableSelectDropdown.svelte';

	interface Props {
		value?: string | number | null;
		options?: { value: string | number; label: string }[];
		placeholder?: string;
		name?: string;
		id?: string;
		disabled?: boolean;
		required?: boolean;
		class?: string;
	}

	let {
		value = $bindable(''),
		options = [],
		placeholder = 'Seleccionar...',
		name = '',
		id = '',
		disabled = false,
		required = false,
		class: className = ''
	}: Props = $props();

	let open = $state(false);
	const selectedOption = $derived(options.find((o) => isSelected(o.value, value)));

	function handleSelect(v: string | number) {
		value = v;
		open = false;
	}
</script>

<svelte:window onclick={() => { open = false; }} />

<div class="relative w-full {className}" onclick={(e) => e.stopPropagation()} role="presentation">
	<input type="hidden" {name} {id} bind:value {required} {disabled} />

	<SearchableSelectButton
		selectedLabel={selectedOption?.label}
		{placeholder}
		{disabled}
		{open}
		hasSelection={!!selectedOption}
		onclick={() => { if (!disabled) open = !open; }}
	/>

	{#if open}
		<SearchableSelectDropdown {options} currentValue={value} onSelect={handleSelect} />
	{/if}
</div>