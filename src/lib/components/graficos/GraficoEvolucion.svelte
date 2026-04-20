<script lang="ts">
	import { LineChart } from 'layerchart';
	import { scaleTime, scaleLinear } from 'd3-scale';
	import * as Card from '$lib/components/ui/card';
	import type { ChartSeriesItem, Registro } from './types';
	import GraficoEmptyState from './GraficoEmptyState.svelte';

	export let isInvestigador: boolean = false;
	export let chartSeries: ChartSeriesItem[];
	export let hayDatos: boolean;
	export let registrosFiltrados: Registro[];
</script>

<div class="animate-fade-up delay-150">
	<Card.Root class="overflow-hidden border-border/50">
		<Card.Header>
			<div class="flex items-center justify-between">
				<div>
					<Card.Title class="font-display text-lg">
						Evolución Temporal{isInvestigador ? ' Global' : ''}
					</Card.Title>
					<Card.Description class="mt-1 font-body text-xs">
						{#if hayDatos}
							{registrosFiltrados.length} mediciones visualizadas
						{:else}
							Selecciona filtros para ver datos
						{/if}
					</Card.Description>
				</div>
				{#if hayDatos}
					<div class="flex flex-wrap gap-3">
						{#each chartSeries as s (s.key)}
							<div class="flex items-center gap-1.5 font-body text-xs text-muted-foreground">
								<div class="h-2.5 w-2.5 rounded-full" style="background-color: {s.color}"></div>
								{s.label}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</Card.Header>
		<Card.Content>
			{#if hayDatos}
				<div class="h-[400px] w-full">
					<LineChart
						data={chartSeries.length === 1 ? chartSeries[0].data : []}
						x="date"
						xScale={scaleTime()}
						y="value"
						yScale={scaleLinear()}
						series={chartSeries.length > 1
							? chartSeries.map((s) => ({
									key: s.key,
									label: s.label,
									data: s.data,
									color: s.color,
									value: 'value'
								}))
							: undefined}
						axis
						grid
						legend={chartSeries.length > 1}
						tooltip
						points={registrosFiltrados.length < 100}
						props={{
							xAxis: {
								format: (v: Date | number | string) =>
									v instanceof Date
										? v.toLocaleDateString('es-CL', { month: 'short', year: '2-digit' })
										: String(v)
							}
						}}
					/>
				</div>
			{:else}
				<GraficoEmptyState {isInvestigador} />
			{/if}
		</Card.Content>
	</Card.Root>
</div>