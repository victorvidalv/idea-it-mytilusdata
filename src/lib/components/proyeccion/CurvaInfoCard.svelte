<!--
Tarjeta informativa con indicadores clave, alertas de confiabilidad, y análisis matemático desplegable.
Componente contenedor que delega responsabilidad a subcomponentes especializados.
-->
<script lang="ts">
	import type { ParametrosSigmoidal, CurvaReferencia } from './proyeccionUtils';
	import { generarAlertas, type Alerta } from './curva-alertas';
	import CurvaIndicadores from './CurvaIndicadores.svelte';
	import CurvaAlertasPanel from './CurvaAlertasPanel.svelte';
	import CurvaAnalisisMatematico from './CurvaAnalisisMatematico.svelte';

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
