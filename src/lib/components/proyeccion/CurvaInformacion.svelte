<!--
Subcomponente: Información del modelo ajustado y ajustes aplicados.
Responsabilidad: Mostrar el modelo, fuente y ajustes aplicados con detalles visuales.
-->
<script lang="ts">
	import * as Card from '$lib/components/ui/card';

	interface Ajuste {
		visible: boolean;
		tipo: string;
		descripcion: string;
	}

	interface Props {
		nombreModelo: string;
		fuente: string;
		codigo?: string;
		ajustes?: Ajuste[];
		parametros?: {
			L?: number;
			k?: number;
			x0?: number;
		};
		mostrarParametros?: boolean;
	}

	let {
		nombreModelo,
		fuente,
		codigo = '',
		ajustes = [],
		parametros = {},
		mostrarParametros = false
	}: Props = $props();
</script>

<div class="space-y-2">
	<h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
		<span>📊</span> Información del Modelo
	</h4>
	<div class="rounded-lg border border-ocean-mid/20 bg-ocean-mid/5 p-4 space-y-2">
		<div class="flex items-start justify-between gap-2">
			<div class="flex-1 min-w-0">
				<p class="font-semibold text-sm truncate">{nombreModelo}</p>
				<p class="text-xs text-muted-foreground">{fuente}</p>
				{#if codigo}
					<p class="text-[10px] text-muted-foreground font-mono mt-0.5">{codigo}</p>
				{/if}
			</div>
			<span class="shrink-0 rounded-full bg-ocean-light/20 px-2 py-0.5 text-[10px] font-medium text-ocean-light">
				Ajuste #{codigo.split('-').pop() ?? '1'}
			</span>
		</div>

		{#if Object.keys(parametros).length > 0 && mostrarParametros}
			<div class="grid grid-cols-3 gap-2 pt-2 border-t border-ocean-mid/20">
				{#if parametros.L !== undefined}
					<div class="text-center">
						<p class="text-[10px] text-muted-foreground">L (mm)</p>
						<p class="font-mono text-xs font-semibold">{parametros.L.toFixed(1)}</p>
					</div>
				{/if}
				{#if parametros.k !== undefined}
					<div class="text-center">
						<p class="text-[10px] text-muted-foreground">k (1/día)</p>
						<p class="font-mono text-xs font-semibold">{parametros.k.toFixed(4)}</p>
					</div>
				{/if}
				{#if parametros.x0 !== undefined}
					<div class="text-center">
						<p class="text-[10px] text-muted-foreground">x₀ (día)</p>
						<p class="font-mono text-xs font-semibold">{parametros.x0.toFixed(1)}</p>
					</div>
				{/if}
			</div>
		{/if}

		{#if ajustes.length > 0}
			<div class="space-y-1.5 pt-2 border-t border-ocean-mid/20">
				<p class="text-[10px] text-muted-foreground font-medium">Ajustes aplicados:</p>
				<div class="flex flex-wrap gap-1.5">
					{#each ajustes as ajuste}
						{#if ajuste.visible}
							<span class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
								<span>⚡</span> {ajuste.descripcion}
							</span>
						{/if}
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
