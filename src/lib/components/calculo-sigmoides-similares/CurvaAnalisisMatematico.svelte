<!--
Sección desplegable con análisis matemático detallado del modelo sigmoidal.
Refactorizado para reducir complejidad delegando en sub-componentes.
-->
<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import CurvaMetricasCalidad from './CurvaMetricasCalidad.svelte';
	import CurvaCalculoObjetivo from './CurvaCalculoObjetivo.svelte';
	import CurvaFuncionesAjustadas from './CurvaFuncionesAjustadas.svelte';
	import CurvaAnalisisMetodo from './CurvaAnalisisMetodo.svelte';
	import CurvaAnalisisModelo from './CurvaAnalisisModelo.svelte';
	import type { CurvaUsada, Metadatos } from './ProyeccionComponentTypes';
	import type { CurvaReferencia } from './proyeccionUtils';

	interface Props {
		curvaUsada: CurvaUsada;
		curvaReferencia?: CurvaReferencia;
		metadatos?: Metadatos;
		mediciones?: { dia: number; talla: number }[];
	}

	let { curvaUsada, curvaReferencia, metadatos, mediciones = [] }: Props = $props();
</script>

<Card.Root class="border-border/50">
	<details class="group">
		<summary class="cursor-pointer list-none">
			<Card.Header class="group-open:pb-2">
				<div class="flex items-center justify-between">
					<Card.Title class="font-display text-lg">Análisis matemático</Card.Title>
					<span class="text-xs text-muted-foreground transition-transform group-open:rotate-180"
						>▼</span
					>
				</div>
				<Card.Description class="font-body text-xs"
					>Modelo sigmoidal y proyección detallada</Card.Description
				>
			</Card.Header>
		</summary>

		<Card.Content class="space-y-6 pt-0">
			<CurvaAnalisisMetodo />
			<CurvaAnalisisModelo />

			<CurvaFuncionesAjustadas {curvaUsada} {curvaReferencia} {mediciones} {metadatos} />

			<div class="space-y-3">
				<h4 class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
					Métricas de calidad
				</h4>
				<CurvaMetricasCalidad
					r2={curvaUsada.r2}
					sse={curvaUsada.sse}
					totalPuntos={metadatos?.totalPuntos ?? mediciones.length}
					parametros={curvaUsada.parametros}
				/>
			</div>

			{#if metadatos?.diaObjetivo && metadatos.tallaObjetivo && curvaUsada.parametros}
				<CurvaCalculoObjetivo
					diaObjetivo={metadatos.diaObjetivo}
					tallaObjetivo={metadatos.tallaObjetivo}
					parametros={curvaUsada.parametros}
				/>
			{/if}

			{#if !curvaUsada.esCurvaLocal && curvaReferencia}
				<div class="space-y-3">
					<h4 class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
						Escalamiento de L
					</h4>
					<div class="space-y-3 rounded-lg border border-border/50 bg-secondary/10 p-4">
						<p class="text-[10px] leading-relaxed text-muted-foreground">
							Ajuste de magnitud por mínimos cuadrados analíticos.
						</p>
						<div class="space-y-2 rounded-md bg-background/60 p-3 text-center">
							<p class="font-mono text-sm font-semibold">L<sub>opt</sub> = ∑(yᵢ·aᵢ) / ∑(aᵢ²)</p>
						</div>
						<p class="text-[10px] leading-relaxed text-muted-foreground">
							donde aᵢ = 1/(1 + e<sup>-k(tᵢ-x₀)</sup>). El valor final se restringe al rango
							biológico y queda sobre la talla máxima observada.
						</p>
					</div>
				</div>
			{/if}
		</Card.Content>
	</details>
</Card.Root>
