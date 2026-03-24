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
		curvaReferencia?: CurvaReferencia;
		metadatos?: Metadatos;
		mediciones?: { dia: number; talla: number }[];
	}

	let { curvaUsada, curvaReferencia, metadatos, mediciones = [] }: Props = $props();

	// Alertas delegadas al módulo curva-alertas
	let alertas = $derived<Alerta[]>(
		generarAlertas({
			totalPuntos: metadatos?.totalPuntos ?? mediciones.length,
			mediciones,
			esCurvaLocal: curvaUsada.esCurvaLocal,
			r2: curvaUsada.r2,
			parametros: curvaUsada.parametros,
			tallaObjetivo: metadatos?.tallaObjetivo
		})
	);
</script>

<div class="space-y-4">
	<CurvaIndicadores {curvaUsada} {metadatos} />
	<CurvaAlertasPanel {alertas} />
	<CurvaAnalisisMatematico {curvaUsada} {curvaReferencia} {metadatos} {mediciones} />
</div>
