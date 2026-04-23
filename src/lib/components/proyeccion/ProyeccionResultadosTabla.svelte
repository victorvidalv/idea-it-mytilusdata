<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import IndicadorConfiabilidadTemporal from './IndicadorConfiabilidadTemporal.svelte';
	import type { DegradacionRMSE } from './ProyeccionComponentTypes';

	interface Props {
		tablaDatos: { dia: number; talla: number; tipo: string }[];
		degradacionRMSE?: DegradacionRMSE;
		onExportar: () => void;
	}

	let { tablaDatos, degradacionRMSE, onExportar }: Props = $props();
</script>

<div class="space-y-3">
	{#if degradacionRMSE}
		<IndicadorConfiabilidadTemporal {degradacionRMSE} />
	{/if}

	<div class="max-h-64 overflow-y-auto rounded-lg border border-border/50">
		<table class="w-full text-sm">
			<thead class="bg-secondary/30 text-muted-foreground sticky top-0">
				<tr>
					<th class="px-3 py-2 text-left font-medium">Día</th>
					<th class="px-3 py-2 text-left font-medium">Talla (mm)</th>
					<th class="px-3 py-2 text-left font-medium">Tipo</th>
				</tr>
			</thead>
			<tbody>
				{#each tablaDatos as punto}
					<tr class="border-t border-border/30">
						<td class="px-3 py-2">{punto.dia}</td>
						<td class="px-3 py-2">{punto.talla.toFixed(2)}</td>
						<td class="px-3 py-2">
							<span
								class="rounded-full px-2 py-0.5 text-xs {punto.tipo === 'dato'
									? 'bg-ocean-mid/20 text-ocean-mid'
									: 'bg-ocean-light/20 text-ocean-light'}"
							>
								{punto.tipo === 'dato' ? 'Dato real' : 'Proyectado'}
							</span>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
