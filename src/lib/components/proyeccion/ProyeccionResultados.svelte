<!--
Componente para mostrar los resultados de la proyección.
Incluye información de la curva usada, gráfico y tabla de datos.
Muestra 3 curvas: Meta (línea horizontal), Real (datos históricos) y Proyectado (curva ajustada).
-->
<script lang="ts">
	import { LineChart } from 'layerchart';
	import { scaleLinear } from 'd3-scale';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import CurvaInfoCard from './CurvaInfoCard.svelte';
	import { construirSeriesProyeccion, construirTablaDatos, generarDescripcionGrafico, type CurvaReferencia } from './proyeccionUtils';

	interface Props {
		proyeccion: { dia: number; talla: number; tipo: 'dato' | 'proyeccion' }[];
		curvaUsada?: { id: number; codigoReferencia: string; sse: number; esCurvaLocal: boolean; r2?: number };
		curvaReferencia?: CurvaReferencia;
		metadatos?: { rangoDias: string; rangoTallas: string; tallaObjetivo?: number; diaObjetivo?: number; totalPuntos: number };
		mediciones?: { dia: number; talla: number }[];
		meta?: number;
		onExportar: () => void;
	}

	let { proyeccion, curvaUsada, curvaReferencia, metadatos, mediciones = [], meta, onExportar }: Props = $props();

	let chartSeriesData = $derived(construirSeriesProyeccion(proyeccion, mediciones, meta, curvaReferencia));
	let tablaDatos = $derived(construirTablaDatos(proyeccion, mediciones));
	let chartDescription = $derived(generarDescripcionGrafico(mediciones, proyeccion));
	let hasMultipleSeries = $derived(chartSeriesData.length > 1);
	let hasMediciones = $derived(mediciones.length > 0);
</script>

<div class="space-y-6">
	{#if curvaUsada}
		<CurvaInfoCard {curvaUsada} />
	{/if}

	<Card.Root class="border-border/50">
		<Card.Header>
			<div class="flex items-center justify-between">
				<div>
					<Card.Title class="font-display text-lg">Curva de crecimiento proyectada</Card.Title>
					<Card.Description class="mt-1 font-body text-xs">{chartDescription}</Card.Description>
				</div>
				{#if metadatos?.diaObjetivo}
					<div class="text-right">
						<p class="text-xs font-medium text-muted-foreground">
							Día objetivo ({metadatos.tallaObjetivo} mm)
						</p>
						<p class="font-mono text-lg font-semibold text-ocean-mid">Día {metadatos.diaObjetivo}</p>
					</div>
				{/if}
			</div>
		</Card.Header>
		<Card.Content>
			<div class="h-[400px] w-full">
				<LineChart
					data={hasMultipleSeries ? chartSeriesData[0].data : chartSeriesData[0]?.data ?? []}
					x="dia"
					xScale={scaleLinear()}
					y="talla"
					yScale={scaleLinear()}
					series={hasMultipleSeries
						? chartSeriesData.map((s) => ({ key: s.key, label: s.label, data: s.data, color: s.color, value: 'talla' }))
						: undefined}
					axis
					grid
					tooltip
					points
					legend={hasMultipleSeries}
				/>
			</div>
		</Card.Content>
	</Card.Root>

	{#if hasMultipleSeries}
		<div class="flex flex-wrap gap-4 px-2">
			{#each chartSeriesData as serie (serie.key)}
				<div class="flex items-center gap-1.5 font-body text-xs text-muted-foreground">
					<div class="h-2.5 w-2.5 rounded-full" style="background-color: {serie.color}"></div>
					{serie.label}
				</div>
			{/each}
		</div>
	{/if}

	<Card.Root class="border-border/50">
		<Card.Header>
			<div class="flex items-center justify-between">
				<div>
					<Card.Title class="font-display text-lg">Datos de la proyección</Card.Title>
					<Card.Description class="mt-1 font-body text-xs">Tabla con datos reales y proyectados</Card.Description>
				</div>
				<Button
					onclick={() => onExportar()}
					variant="outline"
					class="rounded-xl border-ocean-mid/50 text-ocean-mid hover:bg-ocean-mid/10"
				>
					Exportar CSV
				</Button>
			</div>
		</Card.Header>
		<Card.Content>
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
		</Card.Content>
	</Card.Root>
</div>
