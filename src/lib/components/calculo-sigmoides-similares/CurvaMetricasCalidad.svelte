<!--
Subcomponente: Métricas de calidad del modelo (R², SSE, n puntos, velocidad máxima).
Responsabilidad: Mostrar tarjetas con métricas de calidad del ajuste.
-->
<script lang="ts">
	import type { ParametrosSigmoidal } from './proyeccionUtils';

	interface Props {
		r2?: number;
		sse: number;
		totalPuntos: number;
		parametros?: ParametrosSigmoidal;
	}

	let { r2, sse, totalPuntos, parametros }: Props = $props();

	// Velocidad máxima = L * k / 4
	let velocidadMax = $derived(
		parametros ? (parametros.L * parametros.k) / 4 : undefined
	);

	// Calificación del R²
	function calificarR2(r2: number): { texto: string; clase: string } {
		if (r2 >= 0.98) return { texto: 'Excelente', clase: 'text-green-500' };
		if (r2 >= 0.95) return { texto: 'Muy bueno', clase: 'text-emerald-500' };
		if (r2 >= 0.90) return { texto: 'Bueno', clase: 'text-blue-500' };
		if (r2 >= 0.85) return { texto: 'Aceptable', clase: 'text-yellow-500' };
		return { texto: 'Bajo', clase: 'text-red-500' };
	}
</script>

<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
	{#if r2 !== undefined}
		{@const calidad = calificarR2(r2)}
		<div class="rounded-lg border border-border/30 bg-secondary/10 p-2.5 space-y-0.5">
			<p class="text-[10px] text-muted-foreground font-semibold">R² — Coef. de determinación</p>
			<p class="font-mono text-xs font-semibold">{r2.toFixed(4)} <span class={calidad.clase}>({calidad.texto})</span></p>
			<p class="text-[9px] text-muted-foreground">Proporción de varianza explicada por el modelo. 1.0 = ajuste perfecto.</p>
		</div>
	{/if}

	<div class="rounded-lg border border-border/30 bg-secondary/10 p-2.5 space-y-0.5">
		<p class="text-[10px] text-muted-foreground font-semibold">SSE — Error cuadrático</p>
		<p class="font-mono text-xs font-semibold">{sse.toFixed(2)} mm²</p>
		<p class="text-[9px] text-muted-foreground">Suma de errores al cuadrado. Menor = mejor.</p>
	</div>

	<div class="rounded-lg border border-border/30 bg-secondary/10 p-2.5 space-y-0.5">
		<p class="text-[10px] text-muted-foreground font-semibold">n — Puntos de datos</p>
		<p class="font-mono text-xs font-semibold">{totalPuntos}</p>
		<p class="text-[9px] text-muted-foreground">Mínimo 5 puntos para ajuste estable.</p>
	</div>

	{#if velocidadMax !== undefined && parametros}
		<div class="rounded-lg border border-border/30 bg-secondary/10 p-2.5 space-y-0.5">
			<p class="text-[10px] text-muted-foreground font-semibold">v<sub>máx</sub> — Vel. crecimiento</p>
			<p class="font-mono text-xs font-semibold">{velocidadMax.toFixed(3)} mm/día</p>
			<p class="text-[9px] text-muted-foreground">Máxima velocidad en inflexión (día {parametros.x0.toFixed(0)}).</p>
		</div>
	{/if}
</div>
