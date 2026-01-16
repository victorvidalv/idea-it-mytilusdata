<!--
Subcomponente para mostrar las funciones ajustadas (curva proyectada, referencia y escalado).
Refactorizado para reducir complejidad y usar tipos compartidos.
-->
<script lang="ts">
	import { calcularLEscalado, type CurvaReferencia } from './proyeccionUtils';
	import {
		formatearFormulaSigmoidal,
		type CurvaUsada,
		type Metadatos
	} from './ProyeccionComponentTypes';

	interface Props {
		curvaUsada: CurvaUsada;
		curvaReferencia?: CurvaReferencia;
		mediciones?: { dia: number; talla: number }[];
		metadatos?: Metadatos;
	}

	let { curvaUsada, curvaReferencia, mediciones = [], metadatos }: Props = $props();

	let lEscalado = $derived.by(() => {
		if (!curvaReferencia || mediciones.length === 0) return undefined;
		return calcularLEscalado(
			{ dias: mediciones.map((m) => m.dia), tallas: mediciones.map((m) => m.talla) },
			curvaReferencia.parametros
		);
	});
</script>

<div class="space-y-3">
	<h4 class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
		Funciones ajustadas
	</h4>

	{#if curvaUsada.parametros}
		<div class="space-y-2 rounded-lg border border-border/50 bg-secondary/20 p-3">
			<div class="flex items-center gap-2">
				<div class="h-3 w-3 rounded-full bg-blue-500"></div>
				<span class="text-xs font-semibold">
					{curvaUsada.esCurvaLocal
						? 'Ajuste local (Levenberg-Marquardt)'
						: 'Perfil histórico escalado'}
				</span>
			</div>
			<p class="pl-5 text-[10px] text-muted-foreground">
				{curvaUsada.esCurvaLocal
					? 'Optimización no lineal directa de los 3 parámetros.'
					: 'Rescalado analítico de L basado en el perfil histórico más compatible.'}
			</p>
			<div class="rounded-md bg-background/60 p-2 text-center">
				<p class="font-mono text-[11px]">{formatearFormulaSigmoidal(curvaUsada.parametros, 'f')}</p>
			</div>
			<div class="grid grid-cols-3 gap-2 pl-5">
				<div>
					<p class="text-[10px] text-muted-foreground">L</p>
					<p class="font-mono text-xs font-semibold">{curvaUsada.parametros.L.toFixed(2)} mm</p>
				</div>
				<div>
					<p class="text-[10px] text-muted-foreground">k</p>
					<p class="font-mono text-xs font-semibold">{curvaUsada.parametros.k.toFixed(4)}</p>
				</div>
				<div>
					<p class="text-[10px] text-muted-foreground">x₀</p>
					<p class="font-mono text-xs font-semibold">d {curvaUsada.parametros.x0.toFixed(1)}</p>
				</div>
			</div>
		</div>
	{/if}

	{#if curvaReferencia}
		<div class="space-y-2 rounded-lg border border-border/50 bg-secondary/10 p-3">
			<div class="flex items-center gap-2">
				<div class="h-3 w-3 rounded-full bg-emerald-500"></div>
				<span class="text-xs font-semibold">Referencia: {curvaReferencia.codigoReferencia}</span>
			</div>
			<div class="rounded-md bg-background/60 p-2 text-center">
				<p class="font-mono text-[11px]">
					{formatearFormulaSigmoidal(curvaReferencia.parametros, 'g')}
				</p>
			</div>
		</div>

		{#if lEscalado !== undefined}
			<div class="space-y-2 rounded-lg border border-border/50 bg-secondary/10 p-3">
				<div class="flex items-center gap-2">
					<div class="h-3 w-3 rounded-full bg-orange-400"></div>
					<span class="text-xs font-semibold">Referencia escalada (h)</span>
				</div>
				<div class="rounded-md bg-background/60 p-2 text-center">
					<p class="font-mono text-[11px]">
						{formatearFormulaSigmoidal({ ...curvaReferencia.parametros, L: lEscalado }, 'h')}
					</p>
				</div>
				<p class="pl-5 text-[10px] text-muted-foreground">
					L: {curvaReferencia.parametros.L.toFixed(1)} → {lEscalado.toFixed(1)} mm
				</p>
			</div>
		{/if}
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
