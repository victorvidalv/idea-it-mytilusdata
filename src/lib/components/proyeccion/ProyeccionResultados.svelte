<!--
Componente para mostrar los resultados de la proyección.
Refactorizado para reducir complejidad y usar tipos compartidos.
Ahora soporta cono de incertidumbre (bootstrap) y degradación temporal (walk-forward).
-->
<script lang="ts">
	import { LineChart, AreaChart } from 'layerchart';
	import { scaleLinear } from 'd3-scale';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import CurvaInfoCard from './CurvaInfoCard.svelte';
	import ProyeccionResultadosTabla from './ProyeccionResultadosTabla.svelte';
	import { construirSeriesProyeccion, construirTablaDatos, generarDescripcionGrafico, type CurvaReferencia } from './proyeccionUtils';
	import { COLOR_REAL } from './proyeccion-colores';
	import type { PuntoProyeccion, CurvaUsada, Metadatos, IncertidumbreProyeccion, DegradacionRMSE } from './ProyeccionComponentTypes';

	interface Props {
		proyeccion: PuntoProyeccion[];
		curvaUsada?: CurvaUsada;
		curvaReferencia?: CurvaReferencia;
		metadatos?: Metadatos;
		mediciones?: { dia: number; talla: number }[];
		meta?: number;
		incertidumbre?: IncertidumbreProyeccion;
		degradacionRMSE?: DegradacionRMSE;
		onExportar: () => void;
	}

	let { proyeccion, curvaUsada, curvaReferencia, metadatos, mediciones = [], meta, incertidumbre, degradacionRMSE, onExportar }: Props = $props();

	let chartSeriesData = $derived(construirSeriesProyeccion(proyeccion, mediciones, meta, curvaReferencia, incertidumbre));
	let tablaDatos = $derived(construirTablaDatos(proyeccion, mediciones));
	let chartDescription = $derived(generarDescripcionGrafico(mediciones, proyeccion));

	let seriesConDatos = $derived(chartSeriesData.filter((s) => s.data && s.data.length > 0));
	let hasMultipleSeries = $derived(seriesConDatos.length > 1);
	let hasDataToPlot = $derived(seriesConDatos.length > 0);
	let tieneIncertidumbre = $derived(!!incertidumbre && incertidumbre.dias.length > 0);
</script>

<div id="grafico-resultados" class="space-y-6 scroll-mt-8">
	{#if curvaUsada}
		<CurvaInfoCard {curvaUsada} {curvaReferencia} {metadatos} {mediciones} />
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
						<p class="text-xs font-medium text-muted-foreground">Día objetivo ({metadatos.tallaObjetivo} mm)</p>
						<p class="font-mono text-lg font-semibold text-ocean-mid">Día {metadatos.diaObjetivo}</p>
					</div>
				{/if}
			</div>
		</Card.Header>
		<Card.Content>
			<div class="h-[400px] w-full">
				{#if tieneIncertidumbre}
					<AreaChart
						data={[]}
						x="dia"
						xScale={scaleLinear()}
						y="talla"
						yScale={scaleLinear()}
						series={seriesConDatos.map((s) => ({
							key: s.key,
							label: s.label,
							data: s.data,
							color: s.color,
							value: s.value || 'talla',
							props: s.props
						}))}
						axis
						grid
						tooltip
						legend={false}
						props={{
							grid: { class: 'stroke-border/30' },
							xAxis: { class: 'text-muted-foreground text-xs', tickLength: 4 },
							yAxis: { class: 'text-muted-foreground text-xs', tickLength: 4 }
						}}
					/>
					<!-- Leyenda manual premium -->
					<div class="mt-4 flex flex-wrap items-center justify-center gap-5">
						<div class="flex items-center gap-2">
							<span class="h-2.5 w-2.5 rounded-full" style="background: {COLOR_REAL}"></span>
							<span class="text-xs text-muted-foreground">Real</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="h-2.5 w-2.5 rounded-sm border border-amber-600/50" style="background: rgba(251, 191, 36, 0.2)"></span>
							<span class="text-xs text-muted-foreground">Intervalo de confianza (95%)</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="h-1 w-5 rounded-full" style="background: oklch(0.55 0.16 65)"></span>
							<span class="text-xs text-muted-foreground">Proyectado (mediana)</span>
						</div>
					</div>
				{:else}
					<LineChart
						data={hasDataToPlot ? seriesConDatos[0].data : []}
						x="dia"
						xScale={scaleLinear()}
						y="talla"
						yScale={scaleLinear()}
						series={hasMultipleSeries ? seriesConDatos.map((s) => ({ key: s.key, label: s.label, data: s.data, color: s.color, value: 'talla' })) : undefined}
						axis
						grid
						tooltip
						points
						legend={hasMultipleSeries}
					/>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root class="border-border/50">
		<Card.Header>
			<div class="flex items-center justify-between">
				<div>
					<Card.Title class="font-display text-lg">Datos de la proyección</Card.Title>
					<Card.Description class="mt-1 font-body text-xs">Tabla con datos reales y proyectados</Card.Description>
				</div>
				<Button onclick={onExportar} variant="outline" class="rounded-xl border-ocean-mid/50 text-ocean-mid hover:bg-ocean-mid/10">
					Exportar CSV
				</Button>
			</div>
		</Card.Header>
		<Card.Content>
			<ProyeccionResultadosTabla {tablaDatos} {degradacionRMSE} {onExportar} />
		</Card.Content>
	</Card.Root>
</div>
