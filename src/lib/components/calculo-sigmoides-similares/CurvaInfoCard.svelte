<!--
Tarjeta informativa con indicadores clave, alertas de confiabilidad, y análisis matemático desplegable.
Refactorizado para usar tipos compartidos.
-->
<script lang="ts">
	import type { CurvaReferencia } from './proyeccionUtils';
	import { generarAlertas, type Alerta } from './curva-alertas';
	import CurvaIndicadores from './CurvaIndicadores.svelte';
	import CurvaAlertasPanel from './CurvaAlertasPanel.svelte';
	import CurvaAnalisisMatematico from './CurvaAnalisisMatematico.svelte';
    import type { CurvaUsada, Metadatos } from './ProyeccionComponentTypes';

	interface Props {
		curvaUsada: CurvaUsada;
		metadatos?: Metadatos;
		mediciones?: { dia: number; talla: number }[];
		metadata?: Record<string, unknown>;
	}

	let { curvaUsada, metadatos, mediciones = [], metadata = {} }: Props = $props();

	// Alertas delegadas al módulo curva-alertas
	let alertas = $derived<Alerta[]>(
		generarAlertas({
			totalPuntos: metadatos?.totalPuntos ?? mediciones.length,
			mediciones,
			esCurvaLocal: curvaUsada.esCurvaLocal,
			r2: curvaUsada.r2,
			parametros: curvaUsada.parametros as any,
			tallaObjetivo: metadatos?.tallaObjetivo
		})
	);
</script>

<div class="space-y-4">
	{#if metadata?.fallback_used}
		<div class="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
			<p class="text-xs text-amber-700 dark:text-amber-300">
				<span class="font-semibold">Nota:</span> Se utilizó un modelo de respaldo (fallback) porque el modelo seleccionado no pudo ajustarse a los datos proporcionados.
			</p>
		</div>
	{/if}
	<CurvaIndicadores {curvaUsada} {metadatos} />
	<CurvaAlertasPanel {alertas} />
	<CurvaAnalisisMatematico {curvaUsada} {metadatos} {mediciones} />
</div>
