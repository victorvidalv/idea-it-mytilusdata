<!--
Tarjeta informativa con indicadores clave, alertas de confiabilidad, y análisis matemático desplegable.
-->
<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { evaluarSigmoidal, calcularLEscalado, type ParametrosSigmoidal, type CurvaReferencia } from './proyeccionUtils';
	import {
		COLOR_PROYECTADO,
		COLOR_REFERENCIA,
		COLOR_REFERENCIA_ESCALADA,
		COLOR_META
	} from './proyeccionUtils';

	interface CurvaUsadaProps {
		id: number;
		codigoReferencia: string;
		sse: number;
		esCurvaLocal: boolean;
		r2?: number;
		parametros?: ParametrosSigmoidal;
	}

	interface MetadatosProps {
		rangoDias?: string;
		rangoTallas?: string;
		tallaObjetivo?: number;
		diaObjetivo?: number;
		totalPuntos: number;
	}

	interface Props {
		curvaUsada: CurvaUsadaProps;
		curvaReferencia?: CurvaReferencia;
		metadatos?: MetadatosProps;
		mediciones?: { dia: number; talla: number }[];
	}

	let { curvaUsada, curvaReferencia, metadatos, mediciones = [] }: Props = $props();

	// --- Cálculos derivados ---
	let lEscalado = $derived.by(() => {
		if (!curvaReferencia || mediciones.length === 0) return undefined;
		return calcularLEscalado(
			{ dias: mediciones.map((m) => m.dia), tallas: mediciones.map((m) => m.talla) },
			curvaReferencia.parametros
		);
	});

	// Velocidad máxima = L * k / 4
	let velocidadMax = $derived.by(() => {
		if (!curvaUsada.parametros) return undefined;
		return (curvaUsada.parametros.L * curvaUsada.parametros.k) / 4;
	});

	// --- Alertas de confiabilidad ---
	interface Alerta {
		tipo: 'warning' | 'info';
		titulo: string;
		mensaje: string;
	}

	let alertas = $derived.by((): Alerta[] => {
		const resultado: Alerta[] = [];
		const n = metadatos?.totalPuntos ?? mediciones.length;
		const params = curvaUsada.parametros;

		// 1. Pocos datos
		if (n < 5) {
			resultado.push({
				tipo: 'warning',
				titulo: 'Datos insuficientes',
				mensaje: `Solo se dispone de ${n} puntos de datos. Con menos de 5 puntos, la estimación de parámetros es inestable. Se recomienda agregar más mediciones para mejorar la confiabilidad.`
			});
		} else if (n < 10) {
			resultado.push({
				tipo: 'info',
				titulo: 'Muestra limitada',
				mensaje: `Se dispone de ${n} puntos. Un mínimo de 10 mediciones proporciona mayor estabilidad estadística para los 3 parámetros del modelo (L, k, x₀).`
			});
		}

		// 2. Ajuste por biblioteca (no local)
		if (!curvaUsada.esCurvaLocal) {
			resultado.push({
				tipo: 'warning',
				titulo: 'Proyección basada en biblioteca',
				mensaje: 'No se logró un ajuste local directo a tus datos (insuficientes o dispersos). Se usó la curva más similar de la biblioteca histórica y se escaló su magnitud (L). La forma (k, x₀) proviene de otro ciclo productivo, por lo que la proyección podría diferir si las condiciones de cultivo son distintas.'
			});
		}

		// 3. R² bajo
		if (curvaUsada.r2 !== undefined && curvaUsada.r2 < 0.95) {
			const pct = (curvaUsada.r2 * 100).toFixed(1);
			resultado.push({
				tipo: curvaUsada.r2 < 0.90 ? 'warning' : 'info',
				titulo: `R² = ${curvaUsada.r2.toFixed(3)} (${pct}% varianza explicada)`,
				mensaje: curvaUsada.r2 < 0.90
					? 'El modelo explica menos del 90% de la variabilidad. Los datos podrían no seguir un patrón sigmoidal claro, o haber puntos atípicos que afectan el ajuste. Verifica las mediciones.'
					: 'El ajuste es aceptable pero no óptimo. Puede mejorarse con más mediciones o verificando puntos atípicos.'
			});
		}

		// 4. Datos tienen alta dispersión (coeficiente de variación > 0.3)
		if (mediciones.length >= 3) {
			const tallasArr = mediciones.map((m) => m.talla);
			const media = tallasArr.reduce((a, b) => a + b, 0) / tallasArr.length;
			const varianza = tallasArr.reduce((s, t) => s + (t - media) ** 2, 0) / tallasArr.length;
			const cv = Math.sqrt(varianza) / media;
			if (cv > 0.4) {
				resultado.push({
					tipo: 'warning',
					titulo: 'Alta dispersión en los datos',
					mensaje: `El coeficiente de variación es ${(cv * 100).toFixed(0)}%. Los datos tienen una dispersión alta, lo que reduce la confiabilidad del ajuste. Esto puede indicar mediciones en diferentes individuos o condiciones heterogéneas.`
				});
			}
		}

		// 5. Extrapolación a la asíntota
		if (params && metadatos?.tallaObjetivo) {
			const fraccion = metadatos.tallaObjetivo / params.L;
			if (fraccion > 0.95) {
				resultado.push({
					tipo: 'warning',
					titulo: 'Meta muy cercana a la asíntota',
					mensaje: `La talla objetivo (${metadatos.tallaObjetivo} mm) es el ${(fraccion * 100).toFixed(0)}% de la asíntota L = ${params.L.toFixed(1)} mm. En la zona asintótica, pequeñas variaciones en los parámetros producen grandes cambios en el día estimado. La predicción del día objetivo tiene alta incertidumbre.`
				});
			}
		}

		// 6. La talla máxima medida es mayor que L → modelo subestima
		if (params && mediciones.length > 0) {
			const maxTalla = Math.max(...mediciones.map((m) => m.talla));
			if (maxTalla > params.L * 0.98) {
				resultado.push({
					tipo: 'warning',
					titulo: 'Talla observada cercana o superior a L',
					mensaje: `La talla máxima observada (${maxTalla.toFixed(1)} mm) está muy cerca o supera la asíntota L = ${params.L.toFixed(1)} mm. El modelo podría estar subestimando el crecimiento real. Considera que se requieren más datos en la fase de estabilización.`
				});
			}
		}

		return resultado;
	});

	// Calidad del R²
	function calificarR2(r2: number): { texto: string; clase: string } {
		if (r2 >= 0.98) return { texto: 'Excelente', clase: 'text-green-500' };
		if (r2 >= 0.95) return { texto: 'Muy bueno', clase: 'text-emerald-500' };
		if (r2 >= 0.90) return { texto: 'Bueno', clase: 'text-blue-500' };
		if (r2 >= 0.85) return { texto: 'Aceptable', clase: 'text-yellow-500' };
		return { texto: 'Bajo', clase: 'text-red-500' };
	}

	function formatearFormula(p: ParametrosSigmoidal, nombre: string): string {
		return `${nombre}(t) = ${p.L.toFixed(1)} / (1 + e^(-${p.k.toFixed(4)} · (t - ${p.x0.toFixed(1)})))`;
	}
</script>

<div class="space-y-4">
	<!-- INDICADORES CLAVE (siempre visibles) -->
	<Card.Root class="border-border/50">
		<Card.Content class="py-4">
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<!-- Método -->
				<div class="space-y-1">
					<p class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Método</p>
					<p class="font-mono text-sm font-semibold">
						{curvaUsada.esCurvaLocal ? 'Ajuste local' : 'Biblioteca'}
					</p>
				</div>

				<!-- R² -->
				{#if curvaUsada.r2 !== undefined}
					{@const calidad = calificarR2(curvaUsada.r2)}
					<div class="space-y-1">
						<p class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">R² (Bondad de ajuste)</p>
						<p class="font-mono text-sm font-semibold">{curvaUsada.r2.toFixed(4)} <span class="text-xs {calidad.clase}">({calidad.texto})</span></p>
					</div>
				{/if}

				<!-- Talla máxima -->
				{#if curvaUsada.parametros}
					<div class="space-y-1">
						<p class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Talla máxima (L)</p>
						<p class="font-mono text-sm font-semibold text-ocean-mid">{curvaUsada.parametros.L.toFixed(1)} mm</p>
					</div>
				{/if}

				<!-- Día estimado para talla objetivo -->
				{#if metadatos?.diaObjetivo && metadatos.tallaObjetivo}
					<div class="space-y-1 rounded-lg bg-ocean-mid/10 p-2 -m-1">
						<p class="text-[10px] font-medium uppercase tracking-wider text-ocean-mid">🎯 Día estimado</p>
						<p class="font-mono text-lg font-bold text-ocean-mid">Día {metadatos.diaObjetivo}</p>
						<p class="text-[10px] text-muted-foreground">para alcanzar {metadatos.tallaObjetivo} mm</p>
					</div>
				{:else if metadatos?.tallaObjetivo && curvaUsada.parametros}
					<div class="space-y-1 rounded-lg bg-yellow-500/10 p-2 -m-1">
						<p class="text-[10px] font-medium uppercase tracking-wider text-yellow-600">⚠️ Meta</p>
						<p class="font-mono text-sm font-semibold text-yellow-600">{metadatos.tallaObjetivo} mm</p>
						<p class="text-[10px] text-muted-foreground">
							{metadatos.tallaObjetivo >= curvaUsada.parametros.L
								? `Supera L = ${curvaUsada.parametros.L.toFixed(1)} mm`
								: 'Fuera del rango proyectable'}
						</p>
					</div>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>

	<!-- ALERTAS DE CONFIABILIDAD -->
	{#if alertas.length > 0}
		<div class="space-y-2">
			{#each alertas as alerta}
				<div class="flex gap-3 rounded-lg border p-3 {alerta.tipo === 'warning'
						? 'border-yellow-500/30 bg-yellow-500/5'
						: 'border-blue-500/30 bg-blue-500/5'}">
					<span class="text-sm mt-0.5 shrink-0">{alerta.tipo === 'warning' ? '⚠️' : 'ℹ️'}</span>
					<div>
						<p class="text-xs font-semibold {alerta.tipo === 'warning' ? 'text-yellow-600' : 'text-blue-600'}">
							{alerta.titulo}
						</p>
						<p class="text-xs text-muted-foreground mt-0.5 leading-relaxed">{alerta.mensaje}</p>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- ANÁLISIS MATEMÁTICO (DESPLEGABLE) -->
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

				<!-- SECCIÓN 2: Funciones ajustadas con valores concretos -->
				<div class="space-y-3">
					<h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
						<span>🔧</span> Funciones Ajustadas
					</h4>

					<!-- Curva proyectada -->
					{#if curvaUsada.parametros}
						<div class="rounded-lg border border-border/50 bg-secondary/20 p-3 space-y-2">
							<div class="flex items-center gap-2">
								<div class="h-3 w-3 rounded-full" style="background-color: {COLOR_PROYECTADO}"></div>
								<span class="text-xs font-semibold">
									{curvaUsada.esCurvaLocal ? 'Curva ajustada (Levenberg-Marquardt)' : 'Curva ajustada (análogo dinámico escalado)'}
								</span>
							</div>
							<p class="text-[10px] text-muted-foreground pl-5">
								{curvaUsada.esCurvaLocal
									? 'Se ajustaron los 3 parámetros directamente a tus datos usando optimización no lineal (Levenberg-Marquardt), minimizando la suma de errores cuadráticos.'
									: 'Se encontró el análogo más similar en la biblioteca y se reescaló su magnitud (L) por mínimos cuadrados analíticos, manteniendo la forma temporal (k, x₀).'}
							</p>
							<div class="rounded-md bg-background/60 p-2 text-center">
								<p class="font-mono text-[11px]">{formatearFormula(curvaUsada.parametros, 'f')}</p>
							</div>
							<div class="grid grid-cols-3 gap-2 pl-5">
								<div>
									<p class="text-[10px] text-muted-foreground">L (talla máx.)</p>
									<p class="font-mono text-xs font-semibold">{curvaUsada.parametros.L.toFixed(2)} mm</p>
								</div>
								<div>
									<p class="text-[10px] text-muted-foreground">k (velocidad)</p>
									<p class="font-mono text-xs font-semibold">{curvaUsada.parametros.k.toFixed(4)} 1/día</p>
								</div>
								<div>
									<p class="text-[10px] text-muted-foreground">x₀ (inflexión)</p>
									<p class="font-mono text-xs font-semibold">día {curvaUsada.parametros.x0.toFixed(1)}</p>
								</div>
							</div>
						</div>
					{/if}

					<!-- Curva de referencia -->
					{#if curvaReferencia}
						<div class="rounded-lg border border-border/50 bg-secondary/10 p-3 space-y-2">
							<div class="flex items-center gap-2">
								<div class="h-3 w-3 rounded-full" style="background-color: {COLOR_REFERENCIA}"></div>
								<span class="text-xs font-semibold">Análogo de biblioteca: {curvaReferencia.codigoReferencia}</span>
							</div>
							<p class="text-[10px] text-muted-foreground pl-5">
								Curva original del ciclo histórico más similar en forma. Se muestra sin modificar para comparar visualmente con tus datos.
							</p>
							<div class="rounded-md bg-background/60 p-2 text-center">
								<p class="font-mono text-[11px]">{formatearFormula(curvaReferencia.parametros, 'g')}</p>
							</div>
						</div>

						{#if lEscalado !== undefined}
							<div class="rounded-lg border border-border/50 bg-secondary/10 p-3 space-y-2">
								<div class="flex items-center gap-2">
									<div class="h-3 w-3 rounded-full" style="background-color: {COLOR_REFERENCIA_ESCALADA}"></div>
									<span class="text-xs font-semibold">Análogo escalado</span>
								</div>
								<p class="text-[10px] text-muted-foreground pl-5">
									Misma forma temporal que el análogo (k y x₀ idénticos) pero con L recalculado para pasar lo más cerca posible de tus datos. Esto es el "análogo dinámico" en acción.
								</p>
								<div class="rounded-md bg-background/60 p-2 text-center">
									<p class="font-mono text-[11px]">{formatearFormula({ ...curvaReferencia.parametros, L: lEscalado }, 'h')}</p>
								</div>
								<p class="text-[10px] text-muted-foreground pl-5">
									L original: {curvaReferencia.parametros.L.toFixed(1)} → L escalado: {lEscalado.toFixed(1)} mm
									(factor: ×{(lEscalado / curvaReferencia.parametros.L).toFixed(3)})
								</p>
							</div>
						{/if}
					{/if}

					<!-- Meta -->
					{#if metadatos?.tallaObjetivo}
						<div class="rounded-lg border border-border/50 bg-secondary/10 p-3">
							<div class="flex items-center gap-2">
								<div class="h-3 w-3 rounded-full" style="background-color: {COLOR_META}"></div>
								<span class="text-xs font-semibold">Meta de cosecha: y = {metadatos.tallaObjetivo} mm</span>
							</div>
							<p class="text-[10px] text-muted-foreground pl-5 mt-1">
								Línea horizontal que marca la talla objetivo. Su intersección con la curva proyectada determina el día estimado de cosecha.
							</p>
						</div>
					{/if}
				</div>

				<!-- SECCIÓN 3: Métricas con explicación -->
				<div class="space-y-3">
					<h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
						<span>📊</span> Métricas de Calidad
					</h4>
					<p class="text-[10px] text-muted-foreground">
						Indicadores que miden qué tan bien el modelo describe los datos observados.
					</p>
					<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
						{#if curvaUsada.r2 !== undefined}
							{@const calidad = calificarR2(curvaUsada.r2)}
							<div class="rounded-lg border border-border/30 bg-secondary/10 p-2.5 space-y-0.5">
								<p class="text-[10px] text-muted-foreground font-semibold">R² — Coef. de determinación</p>
								<p class="font-mono text-xs font-semibold">{curvaUsada.r2.toFixed(4)} <span class="{calidad.clase}">({calidad.texto})</span></p>
								<p class="text-[9px] text-muted-foreground">Proporción de varianza explicada por el modelo. 1.0 = ajuste perfecto. Se calcula como 1 − SS<sub>res</sub>/SS<sub>tot</sub>.</p>
							</div>
						{/if}
						<div class="rounded-lg border border-border/30 bg-secondary/10 p-2.5 space-y-0.5">
							<p class="text-[10px] text-muted-foreground font-semibold">SSE — Error cuadrático</p>
							<p class="font-mono text-xs font-semibold">{curvaUsada.sse.toFixed(2)} mm²</p>
							<p class="text-[9px] text-muted-foreground">Suma de los cuadrados de las diferencias entre tallas reales y modeladas: ∑(yᵢ − f(tᵢ))². Menor = mejor.</p>
						</div>
						{#if metadatos}
							<div class="rounded-lg border border-border/30 bg-secondary/10 p-2.5 space-y-0.5">
								<p class="text-[10px] text-muted-foreground font-semibold">n — Puntos de datos</p>
								<p class="font-mono text-xs font-semibold">{metadatos.totalPuntos}</p>
								<p class="text-[9px] text-muted-foreground">El modelo tiene 3 parámetros, por lo que se necesitan mínimo 5 puntos (n−3 grados de libertad) para un ajuste estable.</p>
							</div>
						{/if}
						{#if velocidadMax !== undefined && curvaUsada.parametros}
							<div class="rounded-lg border border-border/30 bg-secondary/10 p-2.5 space-y-0.5">
								<p class="text-[10px] text-muted-foreground font-semibold">v<sub>máx</sub> — Vel. crecimiento</p>
								<p class="font-mono text-xs font-semibold">{velocidadMax.toFixed(3)} mm/día</p>
								<p class="text-[9px] text-muted-foreground">Máxima velocidad de crecimiento, ocurre en el punto de inflexión (día {curvaUsada.parametros.x0.toFixed(0)}). Se calcula como L·k/4.</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- SECCIÓN 4: Día objetivo detallado -->
				{#if metadatos?.diaObjetivo && metadatos.tallaObjetivo && curvaUsada.parametros}
					<div class="space-y-3">
						<h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
							<span>🎯</span> Cálculo del Día Objetivo
						</h4>
						<div class="rounded-lg border border-ocean-mid/20 bg-ocean-mid/5 p-4 space-y-3">
							<p class="text-xs text-muted-foreground leading-relaxed">
								Para determinar <strong>cuándo</strong> se alcanza la talla objetivo, se invierte la función logística.
								Dado que <span class="font-mono">f(t) = L / (1 + e<sup>-k(t-x₀)</sup>)</span>, despejamos <strong>t</strong>:
							</p>

							<div class="space-y-1.5 rounded-md bg-background/60 p-3">
								<p class="text-[10px] text-muted-foreground italic">Paso 1: Despejar el término exponencial</p>
								<p class="font-mono text-[11px] pl-2">1 + e<sup>-k(t-x₀)</sup> = L / y</p>

								<p class="text-[10px] text-muted-foreground italic mt-2">Paso 2: Aislar la exponencial</p>
								<p class="font-mono text-[11px] pl-2">e<sup>-k(t-x₀)</sup> = L/y − 1</p>

								<p class="text-[10px] text-muted-foreground italic mt-2">Paso 3: Aplicar logaritmo natural</p>
								<p class="font-mono text-[11px] pl-2">t = x₀ − (1/k) · ln(L/y − 1)</p>
							</div>

							<p class="text-[10px] text-muted-foreground">Sustituyendo los valores de tu modelo:</p>

							<div class="space-y-1 rounded-md bg-background/60 p-3">
								<p class="font-mono text-[11px]">
									t = {curvaUsada.parametros.x0.toFixed(1)} − (1/{curvaUsada.parametros.k.toFixed(4)}) · ln({curvaUsada.parametros.L.toFixed(1)}/{metadatos.tallaObjetivo} − 1)
								</p>
								<p class="font-mono text-[11px]">
									t = {curvaUsada.parametros.x0.toFixed(1)} − {(1 / curvaUsada.parametros.k).toFixed(1)} · ln({(curvaUsada.parametros.L / metadatos.tallaObjetivo - 1).toFixed(4)})
								</p>
								<p class="font-mono text-[11px]">
									t = {curvaUsada.parametros.x0.toFixed(1)} − {(1 / curvaUsada.parametros.k).toFixed(1)} · ({Math.log(curvaUsada.parametros.L / metadatos.tallaObjetivo - 1).toFixed(4)})
								</p>
							</div>

							<div class="flex items-center gap-2 pt-1">
								<span class="text-lg">🎯</span>
								<p class="font-mono text-sm font-bold text-ocean-mid">
									Día estimado ≈ {metadatos.diaObjetivo}
								</p>
								<span class="text-[10px] text-muted-foreground">para alcanzar {metadatos.tallaObjetivo} mm</span>
							</div>

							<p class="text-[9px] text-muted-foreground italic border-t border-ocean-mid/20 pt-2">
								⚠️ Esta estimación es válida solo si 0 &lt; y &lt; L. Cerca de la asíntota (y → L), pequeñas variaciones en los parámetros
								producen grandes cambios en el día estimado, ya que ∂t/∂y → ∞ cuando y → L.
							</p>
						</div>
					</div>
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
</div>
