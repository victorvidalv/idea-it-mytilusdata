<script lang="ts">
	import type { DegradacionRMSE } from './ProyeccionComponentTypes';

	interface Props {
		degradacionRMSE: DegradacionRMSE;
	}

	let { degradacionRMSE }: Props = $props();

	let rmsePromedio = $derived(
		degradacionRMSE.rmse.length > 0
			? degradacionRMSE.rmse.reduce((a, b) => a + b, 0) / degradacionRMSE.rmse.length
			: 0
	);

	let maxMes = $derived(
		degradacionRMSE.meses.length > 0 ? Math.max(...degradacionRMSE.meses) : 0
	);

	let config = $derived(
		maxMes <= 2
			? {
					nivel: 'alta' as const,
					claseColor: 'text-emerald-600',
					claseBg: 'bg-emerald-100',
					claseDot: 'bg-emerald-500',
					texto: 'Alta Confiabilidad'
				}
			: maxMes <= 4
				? {
						nivel: 'media' as const,
						claseColor: 'text-amber-600',
						claseBg: 'bg-amber-100',
						claseDot: 'bg-amber-500',
						texto: 'Confiabilidad Media'
					}
				: {
						nivel: 'baja' as const,
						claseColor: 'text-rose-600',
						claseBg: 'bg-rose-100',
						claseDot: 'bg-rose-500',
						texto: 'Baja Confiabilidad (Referencial)'
					}
	);
</script>

<div class="flex items-center gap-3 rounded-lg border border-border/50 p-3 {config.claseBg}">
	<span class="h-3 w-3 shrink-0 rounded-full {config.claseDot}"></span>
	<div class="min-w-0">
		<p class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
			Nivel de Confiabilidad Temporal
		</p>
		<p class="text-sm font-medium {config.claseColor}">{config.texto}</p>
		{#if degradacionRMSE.rmse.length > 0}
			<p class="text-[10px] text-muted-foreground mt-0.5">
				RMSE promedio: {rmsePromedio.toFixed(2)} mm · Horizonte: {maxMes} meses
			</p>
		{/if}
	</div>
</div>
