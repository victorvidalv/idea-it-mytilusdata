<!--
	Componente principal para proyección de crecimiento de moluscos.
	Coordina el estado y la comunicación entre el formulario y los resultados.
-->
<script lang="ts">
	import ProyeccionForm from './ProyeccionForm.svelte';
	import ProyeccionResultados from './ProyeccionResultados.svelte';
	import GraficoEmptyState from '$lib/components/graficos/GraficoEmptyState.svelte';

	// --- Tipos ---
	interface Lugar {
		id: number;
		nombre: string;
	}

	interface Ciclo {
		id: number;
		nombre: string;
		lugarId: number;
		fechaSiembra: string | Date;
	}

	interface PuntoProyeccion {
		dia: number;
		talla: number;
		tipo: 'dato' | 'proyeccion';
	}

	interface CurvaUsada {
		id: number;
		codigoReferencia: string;
		sse: number;
		esCurvaLocal: boolean;
		r2?: number;
		parametros?: ParametrosSigmoidal;
	}

	interface ParametrosSigmoidal {
		L: number;
		k: number;
		x0: number;
	}

	interface CurvaReferencia {
		id: number;
		codigoReferencia: string;
		sse: number;
		parametros: ParametrosSigmoidal;
	}

	interface Metadatos {
		rangoDias: string;
		rangoTallas: string;
		tallaObjetivo?: number;
		diaObjetivo?: number;
		totalPuntos: number;
	}

	interface ResultadoProyeccion {
		success: boolean;
		proyeccion?: PuntoProyeccion[];
		curvaUsada?: CurvaUsada;
		curvaReferencia?: CurvaReferencia;
		metadatos?: Metadatos;
		error?: string;
	}

	interface Props {
		lugares: Lugar[];
		ciclos: Ciclo[];
	}

	let { lugares, ciclos }: Props = $props();

	// --- Estado ---
	let dias: number[] = $state([]);
	let tallas: number[] = $state([]);
	let tallaObjetivo = $state('');
	let cargando = $state(false);
	let error = $state('');
	let resultado = $state<ResultadoProyeccion | null>(null);

	// --- Datos derivados ---
	let hayProyeccion = $derived(resultado?.success && resultado.proyeccion && resultado.proyeccion.length > 0);

	// --- Funciones de callback ---
	function agregarPunto(dia: number, talla: number) {
		const idxExistente = dias.indexOf(dia);
		if (idxExistente >= 0) {
			tallas[idxExistente] = talla;
			tallas = [...tallas];
		} else {
			dias = [...dias, dia];
			tallas = [...tallas, talla];
		}
		resultado = null;
	}

	function eliminarPunto(dia: number) {
		const idx = dias.indexOf(dia);
		if (idx >= 0) {
			dias = dias.filter((_, i) => i !== idx);
			tallas = tallas.filter((_, i) => i !== idx);
			resultado = null;
		}
	}

	function usarMedicionesCargadas(mediciones: { dia: number; talla: number }[]) {
		dias = mediciones.map((m) => m.dia);
		tallas = mediciones.map((m) => m.talla);
		resultado = null;
	}

	function ejecutarProyeccion() {
		if (dias.length < 3) {
			error = 'Se requieren al menos 3 puntos de datos';
			return;
		}

		cargando = true;
		error = '';
		resultado = null;

		const body: Record<string, unknown> = { dias, tallas };
		const tallaObj = parseFloat(tallaObjetivo);
		if (!isNaN(tallaObj) && tallaObj > 0) {
			body.tallaObjetivo = tallaObj;
		}

		fetch('/api/proyeccion', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include', // Incluir cookies de sesión para autenticación
			body: JSON.stringify(body)
		})
			.then(async (res) => {
				// Verificar código de estado HTTP antes de parsear
				if (!res.ok) {
					const errorData = await res.json().catch(() => ({ error: `Error HTTP ${res.status}` }));
					throw new Error(errorData.error || `Error HTTP ${res.status}`);
				}
				return res.json();
			})
			.then((data) => {
				resultado = data;
				if (!data.success) {
					error = data.error || 'Error al ejecutar la proyección';
				}
			})
			.catch((err) => {
				error = err.message || 'Error de conexión con el servidor';
			})
			.finally(() => {
				cargando = false;
			});
	}

	function exportarCSV() {
		if (!resultado?.success || !resultado.proyeccion) return;

		const headers = ['Día', 'Talla (mm)', 'Tipo'];
		const filas = resultado.proyeccion.map((p) => [p.dia, p.talla.toFixed(2), p.tipo]);
		const csv = [headers, ...filas].map((r) => r.join(',')).join('\n');

		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'proyeccion-crecimiento.csv';
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="space-y-6">
	<ProyeccionForm
		lugares={lugares}
		ciclos={ciclos}
		{dias}
		{tallas}
		bind:tallaObjetivo
		{error}
		{cargando}
		onAgregarPunto={agregarPunto}
		onEliminarPunto={eliminarPunto}
		onUsarMedicionesCargadas={usarMedicionesCargadas}
		onEjecutarProyeccion={ejecutarProyeccion}
	/>

	{#if hayProyeccion}
		<ProyeccionResultados
			proyeccion={resultado!.proyeccion || []}
			curvaUsada={resultado!.curvaUsada}
			curvaReferencia={resultado!.curvaReferencia}
			meta={resultado!.metadatos?.tallaObjetivo}
			metadatos={resultado!.metadatos}
			mediciones={dias.map((d, i) => ({ dia: d, talla: tallas[i] }))}
			onExportar={exportarCSV}
		/>
	{:else if !cargando}
		<GraficoEmptyState isInvestigador={false} />
	{/if}
</div>
