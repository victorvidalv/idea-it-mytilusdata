<script lang="ts">
	import { LineChart } from 'layerchart';
	import { scaleTime, scaleLinear } from 'd3-scale';
	import * as Card from '$lib/components/ui/card';
	import type { ChartSeriesItem, Registro } from './types';

	export let isInvestigador: boolean = false;
	export let chartSeries: ChartSeriesItem[];
	export let hayDatos: boolean;
	export let registrosFiltrados: Registro[];

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('es-CL', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
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
				<div
					class="relative flex h-[400px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-border/50 bg-secondary/30"
				>
					<div class="absolute inset-0 opacity-[0.03]">
						<svg width="100%" height="100%">
							{#each Array.from({ length: 8 }, (_, k) => k) as i (i)}
								<line
									x1="0"
									y1="{(i + 1) * 12.5}%"
									x2="100%"
									y2="{(i + 1) * 12.5}%"
									stroke="currentColor"
									stroke-width="1"
								/>
							{/each}
						</svg>
					</div>
					<div class="relative z-10 text-center">
						<div
							class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-ocean-light/10"
						>
							<svg
								class="h-6 w-6 text-ocean-light/60"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
								/>
							</svg>
						</div>
						<p class="font-body text-sm text-muted-foreground">
							No hay datos para los filtros seleccionados
						</p>
						<p class="mt-1 font-body text-xs text-muted-foreground/60">
							{isInvestigador
								? 'Ajusta los filtros o selecciona otro usuario'
								: 'Ajusta los filtros o registra nuevas mediciones'}
						</p>
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>