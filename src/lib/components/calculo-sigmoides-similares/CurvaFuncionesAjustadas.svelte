<!--
Subcomponente para mostrar información del modelo predictivo utilizado.
Refactorizado para eliminar referencias a sigmoides y ajuste local.
-->
<script lang="ts">
	import type { CurvaUsada, Metadatos } from './ProyeccionComponentTypes';

	interface Props {
		curvaUsada: CurvaUsada;
		mediciones?: { dia: number; talla: number }[];
		metadatos?: Metadatos;
	}

	let { curvaUsada, mediciones = [], metadatos }: Props = $props();

	// Determinar qué parámetros mostrar según el modelo usado
	function getParametrosModelo(parametros: Record<string, number> | undefined, modeloUsado: string | undefined) {
		if (!parametros) return null;

		const slug = modeloUsado || '';

		// Modelo logístico: L, k, x0
		if (slug.includes('logistic') || parametros.L !== undefined) {
			return {
				tipo: 'logistic',
				tallaMax: parametros.L,
				tasa: parametros.k,
				inflexion: parametros.x0,
				tallaMaxLabel: 'Talla máx (L)',
				tasaLabel: 'Tasa k',
				inflexionLabel: 'Inflexión x₀'
			};
		}

		// Von Bertalanffy: Linf, K, t0
		if (slug.includes('bertalanffy') || parametros.Linf !== undefined) {
			return {
				tipo: 'von_bertalanffy',
				tallaMax: parametros.Linf,
				tasa: parametros.K,
				inflexion: parametros.t0,
				tallaMaxLabel: 'Talla máx (L∞)',
				tasaLabel: 'Tasa K',
				inflexionLabel: 't₀'
			};
		}

		// Gompertz: a, b, c
		if (slug.includes('gompertz') || parametros.a !== undefined) {
			return {
				tipo: 'gompertz',
				tallaMax: parametros.a,
				tasa: parametros.b,
				inflexion: parametros.c,
				tallaMaxLabel: 'Talla máx (a)',
				tasaLabel: 'Parámetro b',
				inflexionLabel: 'Parámetro c'
			};
		}

		return null;
	}

	let paramsInfo = $derived(getParametrosModelo(curvaUsada.parametros, metadatos?.modeloUsado));
</script>

<div class="space-y-3">
	<h4 class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
		Modelo utilizado
	</h4>

	{#if metadatos?.modeloUsado}
		<div class="space-y-2 rounded-lg border border-border/50 bg-secondary/20 p-3">
			<div class="flex items-center gap-2">
				<div class="h-3 w-3 rounded-full bg-blue-500"></div>
				<span class="text-xs font-semibold">{metadatos.modeloUsado}</span>
			</div>
			<p class="pl-5 text-[10px] text-muted-foreground">
				Modelo predictivo entrenado externamente para proyectar el crecimiento de mitilicultura.
			</p>
		</div>
	{/if}

	{#if paramsInfo}
		<div class="space-y-2 rounded-lg border border-border/50 bg-secondary/10 p-3">
			<div class="flex items-center gap-2">
				<div class="h-3 w-3 rounded-full bg-emerald-500"></div>
				<span class="text-xs font-semibold">Parámetros estimados</span>
			</div>
			<div class="grid grid-cols-3 gap-2 pl-5">
				<div>
					<p class="text-[10px] text-muted-foreground">{paramsInfo.tallaMaxLabel}</p>
					<p class="font-mono text-xs font-semibold">{paramsInfo.tallaMax?.toFixed(2)} mm</p>
				</div>
				{#if paramsInfo.tasa}
					<div>
						<p class="text-[10px] text-muted-foreground">{paramsInfo.tasaLabel}</p>
						<p class="font-mono text-xs font-semibold">{paramsInfo.tasa.toFixed(4)}</p>
					</div>
				{/if}
				{#if paramsInfo.inflexion}
					<div>
						<p class="text-[10px] text-muted-foreground">{paramsInfo.inflexionLabel}</p>
						<p class="font-mono text-xs font-semibold">{paramsInfo.inflexion.toFixed(4)}</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	{#if metadatos?.tallaObjetivo}
		<div class="rounded-lg border border-border/50 bg-secondary/10 p-3">
			<div class="flex items-center gap-2">
				<div class="h-3 w-3 rounded-full bg-purple-500"></div>
				<span class="text-xs font-semibold">Meta: y = {metadatos.tallaObjetivo} mm</span>
			</div>
		</div>
	{/if}
</div>
