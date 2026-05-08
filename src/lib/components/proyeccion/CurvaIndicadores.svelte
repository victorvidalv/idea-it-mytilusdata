<!--
Tarjeta de indicadores clave del modelo de crecimiento: método, R², talla máxima y día objetivo.
-->
<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { ParametrosSigmoidal } from './proyeccionUtils';

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
		metadatos?: MetadatosProps;
	}

	let { curvaUsada, metadatos }: Props = $props();

	// Calidad del R²
	function calificarR2(r2: number): { texto: string; clase: string } {
		if (r2 >= 0.98) return { texto: 'Excelente', clase: 'text-green-500' };
		if (r2 >= 0.95) return { texto: 'Muy bueno', clase: 'text-emerald-500' };
		if (r2 >= 0.90) return { texto: 'Bueno', clase: 'text-blue-500' };
		if (r2 >= 0.85) return { texto: 'Aceptable', clase: 'text-yellow-500' };
		return { texto: 'Bajo', clase: 'text-red-500' };
	}
</script>

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
