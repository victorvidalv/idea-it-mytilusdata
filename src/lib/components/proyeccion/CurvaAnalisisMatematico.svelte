<!--
Sección desplegable con análisis matemático detallado del modelo sigmoidal.
Delegación a subcomponentes especializados para reducir complejidad.
-->
<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { ParametrosSigmoidal, CurvaReferencia } from './proyeccionUtils';
	import CurvaMetricasCalidad from './CurvaMetricasCalidad.svelte';
	import CurvaCalculoObjetivo from './CurvaCalculoObjetivo.svelte';
	import CurvaFuncionesAjustadas from './CurvaFuncionesAjustadas.svelte';

	interface MetadatosProps {
		rangoDias?: string;
		rangoTallas?: string;
		tallaObjetivo?: number;
		diaObjetivo?: number;
		totalPuntos: number;
	}

	interface Props {
		curvaUsada: {
			id: number;
			codigoReferencia: string;
			sse: number;
			esCurvaLocal: boolean;
			r2?: number;
			parametros?: ParametrosSigmoidal;
		};
		curvaReferencia?: CurvaReferencia;
		metadatos?: MetadatosProps;
		mediciones?: { dia: number; talla: number }[];
	}

	let { curvaUsada, curvaReferencia, metadatos, mediciones = [] }: Props = $props();
</script>

<Card.Root class="border-border/50">
	<details class="group">
		<summary class="cursor-pointer list-none">
			<Card.Header class="group-open:pb-2">
				<div class="flex items-center justify-between">
					<Card.Title class="font-display text-lg">📐 Análisis Matemático</Card.Title>
					<span class="text-xs text-muted-foreground transition-transform group-open:rotate-180">▼</span>
				</div>
				<Card.Description class="font-body text-xs">
					Modelo sigmoidal, análogos dinámicos y proyección detallada
				</Card.Description>
			</Card.Header>
		</summary>

		<Card.Content class="space-y-6 pt-0">
			<!-- INTRO: Análogos Dinámicos -->
			<div class="rounded-xl border border-ocean-mid/20 bg-gradient-to-br from-ocean-mid/5 to-transparent p-4 space-y-3">
				<h4 class="text-sm font-semibold text-foreground flex items-center gap-2">
					🔬 Método de Análogos Dinámicos
				</h4>
				<p class="text-xs text-muted-foreground leading-relaxed">
					Este sistema proyecta el crecimiento usando <strong>análogos dinámicos</strong>: en lugar de predecir desde
					cero, compara tus datos con una <strong>biblioteca de curvas de crecimiento históricas</strong> de ciclos productivos
					reales. Se identifica la curva con forma más similar (mismo patrón temporal de crecimiento) y se
					<strong>escala su magnitud</strong> para adaptarla a tus datos actuales.
				</p>
				<div class="grid gap-2 sm:grid-cols-3 pt-1">
					<div class="flex gap-2 items-start">
						<span class="text-sm mt-0.5">🎯</span>
						<p class="text-[10px] text-muted-foreground"><strong class="text-foreground">Precisión temprana</strong> — con solo 3-5 mediciones ya puede encontrar un análogo y proyectar</p>
					</div>
					<div class="flex gap-2 items-start">
						<span class="text-sm mt-0.5">📊</span>
						<p class="text-[10px] text-muted-foreground"><strong class="text-foreground">Base empírica</strong> — se apoya en ciclos productivos reales, no en suposiciones teóricas</p>
					</div>
					<div class="flex gap-2 items-start">
						<span class="text-sm mt-0.5">🔄</span>
						<p class="text-[10px] text-muted-foreground"><strong class="text-foreground">Adaptación</strong> — mantiene la forma del análogo pero ajusta la escala a tus condiciones</p>
					</div>
				</div>
			</div>

			<!-- SECCIÓN 1: El Modelo -->
			<div class="space-y-3">
				<h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
					<span>📈</span> Modelo Logístico Sigmoidal
				</h4>
				<div class="rounded-lg bg-secondary/20 border border-border/50 p-3 space-y-2">
					<p class="text-xs text-muted-foreground leading-relaxed">
						El crecimiento biológico sigue una curva en "S": lento al inicio, acelerado en la fase media,
						y estabilización al acercarse al máximo. La <strong>función logística</strong> captura este comportamiento:
					</p>
					<div class="rounded-md bg-background/60 p-2 text-center">
						<p class="font-mono text-sm">f(t) = L / (1 + e<sup>-k·(t - x₀)</sup>)</p>
					</div>
					<div class="grid gap-2 sm:grid-cols-3 text-[10px] text-muted-foreground pt-1">
						<div class="border-l-2 border-ocean-mid/40 pl-2">
							<strong class="text-foreground">L</strong> — Talla máxima teórica (mm). Es la asíntota superior: el valor al que tiende la curva pero nunca alcanza exactamente.
						</div>
						<div class="border-l-2 border-ocean-mid/40 pl-2">
							<strong class="text-foreground">k</strong> — Tasa de crecimiento (1/día). Controla cuán rápida es la transición de lento a rápido. Valores mayores = transición más abrupta.
						</div>
						<div class="border-l-2 border-ocean-mid/40 pl-2">
							<strong class="text-foreground">x₀</strong> — Punto de inflexión (día). El momento de máxima velocidad de crecimiento. En este día la talla es exactamente L/2.
						</div>
					</div>
				</div>
			</div>

	<!-- SECCIÓN 2: Funciones ajustadas -->
	<CurvaFuncionesAjustadas
		{curvaUsada}
		{curvaReferencia}
		{mediciones}
		{metadatos}
	/>

			<!-- SECCIÓN 3: Métricas de Calidad (delegado a subcomponente) -->
			<div class="space-y-3">
				<h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
					<span>📊</span> Métricas de Calidad
				</h4>
				<p class="text-[10px] text-muted-foreground">
					Indicadores que miden qué tan bien el modelo describe los datos observados.
				</p>
				<CurvaMetricasCalidad
					r2={curvaUsada.r2}
					sse={curvaUsada.sse}
					totalPuntos={metadatos?.totalPuntos ?? mediciones.length}
					parametros={curvaUsada.parametros}
				/>
			</div>

			<!-- SECCIÓN 4: Día objetivo detallado (delegado a subcomponente) -->
			{#if metadatos?.diaObjetivo && metadatos.tallaObjetivo && curvaUsada.parametros}
				<CurvaCalculoObjetivo
					diaObjetivo={metadatos.diaObjetivo}
					tallaObjetivo={metadatos.tallaObjetivo}
					parametros={curvaUsada.parametros}
				/>
			{/if}

			<!-- SECCIÓN 5: Escalamiento (solo si es biblioteca) -->
			{#if !curvaUsada.esCurvaLocal && curvaReferencia}
				<div class="space-y-3">
					<h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
						<span>⚖️</span> Escalamiento de L (Análogos Dinámicos)
					</h4>
					<div class="rounded-lg border border-border/50 bg-secondary/10 p-4 space-y-3">
						<p class="text-xs text-muted-foreground leading-relaxed">
							El análogo de biblioteca tiene una forma temporal correcta (mismos k y x₀), pero su escala (L)
							puede diferir de tus datos. Para adaptar la magnitud, se resuelve analíticamente el valor de L
							que minimiza el error cuadrático:
						</p>
						<div class="rounded-md bg-background/60 p-3 space-y-2">
							<p class="text-[10px] text-muted-foreground italic">Función a minimizar:</p>
							<p class="font-mono text-[11px] text-center">SSE(L) = ∑(yᵢ − L/gᵢ)²</p>
							<p class="text-[10px] text-muted-foreground italic">donde gᵢ = 1 + e<sup>-k·(tᵢ − x₀)</sup></p>

							<p class="text-[10px] text-muted-foreground italic mt-2">Derivando respecto a L e igualando a cero:</p>
							<p class="font-mono text-[11px] text-center">dSSE/dL = −2∑(yᵢ/gᵢ − L/gᵢ²) = 0</p>

							<p class="text-[10px] text-muted-foreground italic mt-2">Solución analítica (exacta, sin iteración):</p>
							<p class="font-mono text-sm text-center font-semibold">L<sub>opt</sub> = ∑(yᵢ/gᵢ) / ∑(1/gᵢ²)</p>
						</div>
						<p class="text-[10px] text-muted-foreground">
							Esta fórmula es la solución de <strong>mínimos cuadrados ponderados</strong>:
							cada punto contribuye según su posición en la curva. Puntos en la zona de transición rápida
							(cerca de x₀) tienen mayor peso porque son más informativos para determinar L.
						</p>
					</div>
				</div>
			{/if}
		</Card.Content>
	</details>
</Card.Root>
