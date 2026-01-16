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
	import {
		construirSeriesProyeccion,
		construirTablaDatos,
		generarDescripcionGrafico,
		type CurvaReferencia
	} from './proyeccionUtils';
	import { COLOR_REAL } from './proyeccion-colores';
	import type {
		PuntoProyeccion,
		CurvaUsada,
		Metadatos,
		IncertidumbreProyeccion,
		DegradacionRMSE
	} from './ProyeccionComponentTypes';

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

	let {
		proyeccion,
		curvaUsada,
		curvaReferencia,
		metadatos,
		mediciones = [],
		meta,
		incertidumbre,
		degradacionRMSE,
		onExportar
	}: Props = $props();

	let chartSeriesData = $derived(
		construirSeriesProyeccion(proyeccion, mediciones, meta, curvaReferencia, incertidumbre)
	);
	let tablaDatos = $derived(construirTablaDatos(proyeccion, mediciones));
	let chartDescription = $derived(generarDescripcionGrafico(mediciones, proyeccion));

	let seriesConDatos = $derived(chartSeriesData.filter((s) => s.data && s.data.length > 0));
	let hasMultipleSeries = $derived(seriesConDatos.length > 1);
	let hasDataToPlot = $derived(seriesConDatos.length > 0);
	let tieneIncertidumbre = $derived(!!incertidumbre && incertidumbre.dias.length > 0);

	let chartDomain = $derived.by(() => {
		const maxDia = Math.max(
			1,
			...seriesConDatos.flatMap((serie) => serie.data.map((punto) => punto.dia))
		);
		const maxTalla = Math.max(
			1,
			...seriesConDatos.flatMap((serie) =>
				serie.data.flatMap((punto) => [
					punto.talla ?? 0,
					punto.limiteSuperior ?? 0,
					'mediana' in punto && typeof punto.mediana === 'number' ? punto.mediana : 0
				])
			)
		);

		return {
			x: [0, Math.ceil(maxDia * 1.02)] as [number, number],
			y: [0, Math.ceil(maxTalla * 1.08)] as [number, number]
		};
	});

	let leyendaSeries = $derived(
		seriesConDatos.map((serie) => ({
			key: serie.key,
			label:
				serie.key === 'referencia'
					? 'Referencia histórica'
					: serie.key === 'referencia-escalada'
						? 'Referencia escalada'
						: serie.key === 'banda'
							? 'Rango esperado 95%'
							: serie.key === 'limite-inferior'
								? 'Mínimo esperado'
								: serie.key === 'limite-superior'
									? 'Máximo esperado'
									: serie.key === 'proyectado'
										? tieneIncertidumbre
											? 'Predicción mediana'
											: 'Predicción'
										: serie.key === 'real'
											? 'Datos reales'
											: serie.label,
			color: serie.color,
			dashed:
				serie.key === 'referencia' ||
				serie.key === 'referencia-escalada' ||
				serie.key === 'meta' ||
				serie.key === 'limite-inferior' ||
				serie.key === 'limite-superior',
			point: serie.key === 'real',
			fill: serie.key === 'banda'
		}))
	);

	let comparacionCurvas = $derived.by(() => {
		if (!curvaReferencia?.parametros || !curvaUsada?.parametros) return [];

		const ref = curvaReferencia.parametros;
		const usada = curvaUsada.parametros;

		return [
			{
				label: 'Escala L',
				value: `${ref.L.toFixed(1)} -> ${usada.L.toFixed(1)} mm`,
				helper: `${(usada.L - ref.L >= 0 ? '+' : '') + (usada.L - ref.L).toFixed(1)} mm`
			},
			{
				label: 'Tasa k',
				value: usada.k.toFixed(4),
				helper: curvaUsada.esCurvaLocal
					? 'optimizada localmente'
					: 'tomada del perfil de referencia'
			},
			{
				label: 'Inflexion x0',
				value: `dia ${usada.x0.toFixed(1)}`,
				helper: curvaUsada.esCurvaLocal
					? 'ajustada a datos propios'
					: `ref. dia ${ref.x0.toFixed(1)}`
			},
			{
				label: 'Error de forma',
				value: curvaReferencia.sse.toFixed(3),
				helper: 'SSE normalizado'
			}
		];
	});

	let resumenRiesgo = $derived.by(() => {
		if (!incertidumbre || incertidumbre.dias.length === 0) return null;

		const anchoInicial = incertidumbre.limiteSuperior[0] - incertidumbre.limiteInferior[0];
		const ultimo = incertidumbre.dias.length - 1;
		const anchoFinal = incertidumbre.limiteSuperior[ultimo] - incertidumbre.limiteInferior[ultimo];
		const maxDia = Math.max(...incertidumbre.dias);
		const ultimoDato = mediciones.length > 0 ? Math.max(...mediciones.map((m) => m.dia)) : 0;
		const horizonteMeses = Math.max(0, (maxDia - ultimoDato) / 30);
		const crecimiento = anchoInicial > 0 ? anchoFinal / anchoInicial : 1;
		const nivel =
			anchoFinal <= 4 && horizonteMeses <= 2
				? 'Bajo'
				: anchoFinal <= 8 && horizonteMeses <= 4
					? 'Medio'
					: 'Alto';
		const clase =
			nivel === 'Bajo'
				? 'text-emerald-600'
				: nivel === 'Medio'
					? 'text-amber-600'
					: 'text-rose-600';

		return {
			anchoInicial,
			anchoFinal,
			horizonteMeses,
			crecimiento,
			nivel,
			clase
		};
	});
</script>

<div id="grafico-resultados" class="scroll-mt-8 space-y-6">
	{#if curvaUsada}
		<CurvaInfoCard {curvaUsada} {curvaReferencia} {metadatos} {mediciones} />
	{/if}

	<Card.Root class="border-border/50">
		<Card.Header>
			<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<Card.Title class="font-display text-lg">Curva de crecimiento proyectada</Card.Title>
					<Card.Description class="mt-1 font-body text-xs">{chartDescription}</Card.Description>
				</div>
				{#if metadatos?.diaObjetivo}
					<div class="text-right">
						<p class="text-xs font-medium text-muted-foreground">
							Día objetivo ({metadatos.tallaObjetivo} mm)
						</p>
						<p class="font-mono text-lg font-semibold text-ocean-mid">
							Día {metadatos.diaObjetivo}
						</p>
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
						xDomain={chartDomain.x}
						xScale={scaleLinear()}
						y="talla"
						yDomain={chartDomain.y}
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
				{:else}
					<LineChart
						data={hasDataToPlot ? seriesConDatos[0].data : []}
						x="dia"
						xDomain={chartDomain.x}
						xScale={scaleLinear()}
						y="talla"
						yDomain={chartDomain.y}
						yScale={scaleLinear()}
						series={hasMultipleSeries
							? seriesConDatos.map((s) => ({
									key: s.key,
									label: s.label,
									data: s.data,
									color: s.color,
									value: 'talla',
									props: s.props
								}))
							: undefined}
						axis
						grid
						tooltip
						points={false}
						legend={false}
						props={{
							grid: { class: 'stroke-border/30' },
							xAxis: { class: 'text-muted-foreground text-xs', tickLength: 4 },
							yAxis: { class: 'text-muted-foreground text-xs', tickLength: 4 },
							spline: { 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }
						}}
					/>
				{/if}
			</div>
			{#if hasMultipleSeries}
				<div class="mt-4 grid gap-2 border-t border-border/40 pt-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each leyendaSeries as item}
						<div class="flex min-w-0 items-center gap-2">
							{#if item.fill}
								<span
									class="h-2.5 w-5 rounded-sm border border-amber-600/40"
									style="background: rgba(251, 191, 36, 0.2)"
								></span>
							{:else if item.point}
								<span class="h-2.5 w-2.5 rounded-full" style="background: {COLOR_REAL}"></span>
							{:else}
								<span
									class="h-1 w-6 rounded-full"
									class:border-t-2={item.dashed}
									class:border-dashed={item.dashed}
									style="background: {item.dashed
										? 'transparent'
										: item.color}; border-color: {item.color}"
								></span>
							{/if}
							<span class="truncate text-xs text-muted-foreground">{item.label}</span>
						</div>
					{/each}
				</div>
			{/if}
			{#if comparacionCurvas.length > 0}
				<div class="mt-4 grid gap-3 border-t border-border/40 pt-4 sm:grid-cols-2 lg:grid-cols-4">
					{#each comparacionCurvas as item}
						<div class="min-w-0 rounded-md border border-border/40 bg-secondary/10 px-3 py-2">
							<p class="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
								{item.label}
							</p>
							<p class="truncate font-mono text-sm font-semibold text-foreground">{item.value}</p>
							<p class="truncate text-[10px] text-muted-foreground">{item.helper}</p>
						</div>
					{/each}
				</div>
			{/if}
			{#if resumenRiesgo}
				<div class="mt-4 rounded-md border border-border/40 bg-secondary/10 p-3">
					<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p class="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
								Riesgo de estimación
							</p>
							<p class="text-sm font-semibold {resumenRiesgo.clase}">
								{resumenRiesgo.nivel}
							</p>
						</div>
						<div class="grid gap-3 text-xs sm:grid-cols-3">
							<div>
								<p class="text-[10px] text-muted-foreground">Rango inicial</p>
								<p class="font-mono font-semibold">{resumenRiesgo.anchoInicial.toFixed(1)} mm</p>
							</div>
							<div>
								<p class="text-[10px] text-muted-foreground">Rango final</p>
								<p class="font-mono font-semibold">{resumenRiesgo.anchoFinal.toFixed(1)} mm</p>
							</div>
							<div>
								<p class="text-[10px] text-muted-foreground">Horizonte</p>
								<p class="font-mono font-semibold">
									{resumenRiesgo.horizonteMeses.toFixed(1)} meses
								</p>
							</div>
						</div>
					</div>
					<p class="mt-2 text-[10px] leading-relaxed text-muted-foreground">
						El rango esperado se ensancha con el horizonte temporal; una banda más amplia indica
						menor representatividad de la predicción central.
					</p>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<Card.Root class="border-border/50">
		<Card.Header>
			<div class="flex items-center justify-between">
				<div>
					<Card.Title class="font-display text-lg">Datos de la proyección</Card.Title>
					<Card.Description class="mt-1 font-body text-xs"
						>Tabla con datos reales y proyectados</Card.Description
					>
				</div>
				<Button
					onclick={onExportar}
					variant="outline"
					class="rounded-xl border-ocean-mid/50 text-ocean-mid hover:bg-ocean-mid/10"
				>
					Exportar CSV
				</Button>
			</div>
		</Card.Header>
		<Card.Content>
			<ProyeccionResultadosTabla {tablaDatos} {degradacionRMSE} {onExportar} />
		</Card.Content>
	</Card.Root>
</div>
