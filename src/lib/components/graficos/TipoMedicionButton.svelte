<script lang="ts">
	import type { TipoRegistro } from './types';

	export let tipo: TipoRegistro;
	export let isSelected: boolean;
	export let getColorForTipo: (tipoId: number) => string;
	export let onToggle: (tipoId: number) => void;
</script>

<button
	type="button"
	class="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-body text-xs font-medium transition-all duration-200 {isSelected
		? 'border-ocean-light/40 bg-ocean-light/10 text-ocean-light'
		: 'border-border/50 text-muted-foreground hover:border-border hover:bg-secondary/50'}"
	onclick={() => onToggle(tipo.id)}
>
	<div
		class="h-2.5 w-2.5 rounded-full transition-opacity {isSelected ? 'opacity-100' : 'opacity-30'}"
		style="background-color: {getColorForTipo(tipo.id)}"
	></div>
	{tipo.codigo}
	<span class="text-[10px] opacity-60">({tipo.unidadBase})</span>
</button>