<!--
Panel de calidad de datos para proyeccion.
Muestra indicadores de calidad de las mediciones cargadas.
-->
<script lang="ts">
	import { AlertTriangle, CheckCircle2, XCircle, Calendar, Ruler, Clock } from 'lucide-svelte';

	interface Props {
		fechas: string[];
		tallas: number[];
	}

	let { fechas, tallas }: Props = $props();

	let hayDatos = $derived(fechas.length > 0 && tallas.length > 0);
	let numMediciones = $derived(fechas.length);

	let rangoFechas = $derived.by(() => {
		if (fechas.length === 0) return null;
		const sorted = [...fechas].sort();
		return { inicio: sorted[0], fin: sorted[sorted.length - 1] };
	});

	let rangoTallas = $derived.by(() => {
		if (tallas.length === 0) return null;
		return { min: Math.min(...tallas), max: Math.max(...tallas) };
	});

	let intervaloPromedio = $derived.by(() => {
		if (fechas.length < 2) return null;
		const sorted = [...fechas].sort();
		const dias: number[] = [];
		for (let i = 1; i < sorted.length; i++) {
			const d1 = new Date(sorted[i - 1] + 'T00:00:00Z');
			const d2 = new Date(sorted[i] + 'T00:00:00Z');
			dias.push((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
		}
		return dias.reduce((a, b) => a + b, 0) / dias.length;
	});

	let valoresNegativos = $derived(tallas.filter((t) => t < 0).length);
	let valoresFueraRango = $derived(tallas.filter((t) => t > 200).length);

	let crecimientoNoMonotono = $derived.by(() => {
		if (tallas.length < 2) return 0;
		let bajadas = 0;
		for (let i = 1; i < tallas.length; i++) {
			if (tallas[i] < tallas[i - 1] - 0.5) bajadas++;
		}
		return bajadas;
	});

	let calidadOk = $derived(
		valoresNegativos === 0 && valoresFueraRango === 0 && crecimientoNoMonotono === 0
	);

	let statusClase = $derived(
		calidadOk
			? 'bg-emerald-500/10 text-emerald-600'
			: 'bg-amber-500/10 text-amber-600'
	);

	function diasEntre(f1: string, f2: string): number {
		const d1 = new Date(f1 + 'T00:00:00Z');
		const d2 = new Date(f2 + 'T00:00:00Z');
		return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
	}
</script>

{#if hayDatos}
	<div class="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
		<div class="mb-3 flex items-center justify-between">
			<h3 class="font-display text-sm font-semibold text-foreground">Calidad de datos</h3>
			<span
				class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider {statusClase}"
			>
				{#if calidadOk}
					<CheckCircle2 class="h-3 w-3" />
					Buena
				{:else}
					<AlertTriangle class="h-3 w-3" />
					Revisar
				{/if}
			</span>
		</div>

		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			<!-- Mediciones -->
			<div class="rounded-lg border border-border/30 bg-secondary/20 p-3">
				<div class="flex items-center gap-2">
					<Ruler class="h-3.5 w-3.5 text-ocean-mid" />
					<span class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
						>Mediciones</span
					>
				</div>
				<p class="mt-1 font-mono text-lg font-semibold text-foreground">{numMediciones}</p>
				<p class="text-[10px] text-muted-foreground">
					{#if numMediciones >= 5}
						<span class="text-emerald-600">Suficientes para proyectar</span>
					{:else}
						<span class="text-amber-600">Mínimo recomendado: 5</span>
					{/if}
				</p>
			</div>

			<!-- Rango de fechas -->
			{#if rangoFechas}
				<div class="rounded-lg border border-border/30 bg-secondary/20 p-3">
					<div class="flex items-center gap-2">
						<Calendar class="h-3.5 w-3.5 text-ocean-mid" />
						<span class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
							>Rango de fechas</span
						>
					</div>
					<p class="mt-1 text-sm font-semibold text-foreground">
						{diasEntre(rangoFechas.inicio, rangoFechas.fin)} días
					</p>
					<p class="text-[10px] text-muted-foreground">
						{rangoFechas.inicio} → {rangoFechas.fin}
					</p>
				</div>
			{/if}

			<!-- Rango de tallas -->
			{#if rangoTallas}
				<div class="rounded-lg border border-border/30 bg-secondary/20 p-3">
					<div class="flex items-center gap-2">
						<Ruler class="h-3.5 w-3.5 text-ocean-mid" />
						<span class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
							>Rango de tallas</span
						>
					</div>
					<p class="mt-1 text-sm font-semibold text-foreground">
						{rangoTallas.min.toFixed(1)} - {rangoTallas.max.toFixed(1)} mm
					</p>
					<p class="text-[10px] text-muted-foreground">
						Δ {(rangoTallas.max - rangoTallas.min).toFixed(1)} mm
					</p>
				</div>
			{/if}

			<!-- Intervalo promedio -->
			{#if intervaloPromedio !== null}
				<div class="rounded-lg border border-border/30 bg-secondary/20 p-3">
					<div class="flex items-center gap-2">
						<Clock class="h-3.5 w-3.5 text-ocean-mid" />
						<span class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
							>Intervalo promedio</span
						>
					</div>
					<p class="mt-1 text-sm font-semibold text-foreground">
						{intervaloPromedio.toFixed(1)} días
					</p>
					<p class="text-[10px] text-muted-foreground">
						{#if intervaloPromedio < 7}
							<span class="text-emerald-600">Alta frecuencia</span>
						{:else if intervaloPromedio < 30}
							<span class="text-emerald-600">Frecuencia normal</span>
						{:else}
							<span class="text-amber-600">Baja frecuencia</span>
						{/if}
					</p>
				</div>
			{/if}
		</div>

		<!-- Alertas de calidad -->
		{#if valoresNegativos > 0 || valoresFueraRango > 0 || crecimientoNoMonotono > 0}
			<div class="mt-3 space-y-2">
				{#if valoresNegativos > 0}
					<div class="flex items-start gap-2 rounded-md bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
						<XCircle class="mt-0.5 h-3.5 w-3.5 shrink-0" />
						<span>{valoresNegativos} {valoresNegativos === 1 ? 'valor negativo detectado' : 'valores negativos detectados'}. Las tallas deben ser ≥ 0.</span>
					</div>
				{/if}
				{#if valoresFueraRango > 0}
					<div class="flex items-start gap-2 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
						<AlertTriangle class="mt-0.5 h-3.5 w-3.5 shrink-0" />
						<span>{valoresFueraRango} {valoresFueraRango === 1 ? 'valor fuera de rango' : 'valores fuera de rango'} (>200 mm). Verifique las unidades.</span>
					</div>
				{/if}
				{#if crecimientoNoMonotono > 0}
					<div class="flex items-start gap-2 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
						<AlertTriangle class="mt-0.5 h-3.5 w-3.5 shrink-0" />
						<span>{crecimientoNoMonotono} {crecimientoNoMonotono === 1 ? 'bajada significativa' : 'bajadas significativas'} en talla detectadas. Puede indicar errores de medición o muestreo de diferentes cohortes.</span>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Features disponibles -->
		<div class="mt-3 flex flex-wrap items-center gap-2">
			<span class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
				>Features:</span
			>
			{#each ['talla', 'biomasa', 'densidad', 'temperatura'] as feature}
				{#if feature === 'talla'}
					<span class="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
						<CheckCircle2 class="mr-0.5 h-2.5 w-2.5" />
						{feature}
					</span>
				{:else}
					<span class="inline-flex items-center rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] font-medium text-slate-500">
						{feature}
					</span>
				{/if}
			{/each}
		</div>
	</div>
{/if}
