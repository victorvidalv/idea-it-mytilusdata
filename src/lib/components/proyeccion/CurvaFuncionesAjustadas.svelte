<!--
Subcomponente para mostrar las funciones ajustadas (curva proyectada, referencia y escalado).
Extraído de CurvaAnalisisMatematico para reducir complejidad.
-->
<script lang="ts">
	import { calcularLEscalado, type ParametrosSigmoidal, type CurvaReferencia } from './proyeccionUtils';

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
		mediciones?: { dia: number; talla: number }[];
		metadatos?: {
			tallaObjetivo?: number;
		};
	}

	let { curvaUsada, curvaReferencia, mediciones = [], metadatos }: Props = $props();

	// L escalado para el análogo dinámico
	let lEscalado = $derived.by(() => {
		if (!curvaReferencia || mediciones.length === 0) return undefined;
		return calcularLEscalado(
			{ dias: mediciones.map((m) => m.dia), tallas: mediciones.map((m) => m.talla) },
			curvaReferencia.parametros
		);
	});

	function formatearFormula(p: ParametrosSigmoidal, nombre: string): string {
		return `${nombre}(t) = ${p.L.toFixed(1)} / (1 + e^(-${p.k.toFixed(4)} · (t - ${p.x0.toFixed(1)})))`;
	}
</script>

<div class="space-y-3">
	<h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
		<span>🔧</span> Funciones Ajustadas
	</h4>

	<!-- Curva proyectada -->
	{#if curvaUsada.parametros}
		<div class="rounded-lg border border-border/50 bg-secondary/20 p-3 space-y-2">
			<div class="flex items-center gap-2">
				<div class="h-3 w-3 rounded-full bg-blue-500"></div>
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
				<div class="h-3 w-3 rounded-full bg-emerald-500"></div>
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
					<div class="h-3 w-3 rounded-full bg-orange-400"></div>
					<span class="text-xs font-semibold">Análogo escalado</span>
				</div>
				<p class="text-[10px] text-muted-foreground pl-5">
					Misma forma temporal que el análogo (k y x₀ idénticos) pero con L recalculado para pasar lo más cerca posible de tus datos.
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
				<div class="h-3 w-3 rounded-full bg-purple-500"></div>
				<span class="text-xs font-semibold">Meta de cosecha: y = {metadatos.tallaObjetivo} mm</span>
			</div>
			<p class="text-[10px] text-muted-foreground pl-5 mt-1">
				Línea horizontal que marca la talla objetivo. Su intersección con la curva proyectada determina el día estimado de cosecha.
			</p>
		</div>
	{/if}
</div>
