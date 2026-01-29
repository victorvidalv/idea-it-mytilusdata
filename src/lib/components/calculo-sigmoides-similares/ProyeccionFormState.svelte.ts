import * as Actions from './ProyeccionFormActions';
import type { Lugar, MedicionCargada } from './ProyeccionComponentTypes';

export function createFormState() {
	let lugaresLocales = $state<Lugar[]>([]);
	let selectedLugarId = $state<number | null>(null);
	let selectedCicloId = $state<number | null>(null);
	let cargandoDatos = $state(false);
	let errorCarga = $state('');
	let medicionesCargadas = $state<MedicionCargada[]>([]);
	let fechaSiembraCargada = $state<string | undefined>();
	let nuevaFecha = $state('');
	let nuevaTalla = $state('');

	return {
		get lugaresLocales() { return lugaresLocales; },
		set lugaresLocales(v) { lugaresLocales = v; },
		get selectedLugarId() { return selectedLugarId; },
		set selectedLugarId(v) { selectedLugarId = v; },
		get selectedCicloId() { return selectedCicloId; },
		set selectedCicloId(v) { selectedCicloId = v; },
		get cargandoDatos() { return cargandoDatos; },
		set cargandoDatos(v) { cargandoDatos = v; },
		get errorCarga() { return errorCarga; },
		set errorCarga(v) { errorCarga = v; },
		get medicionesCargadas() { return medicionesCargadas; },
		set medicionesCargadas(v) { medicionesCargadas = v; },
		get fechaSiembraCargada() { return fechaSiembraCargada; },
		set fechaSiembraCargada(v) { fechaSiembraCargada = v; },
		get nuevaFecha() { return nuevaFecha; },
		set nuevaFecha(v) { nuevaFecha = v; },
		get nuevaTalla() { return nuevaTalla; },
		set nuevaTalla(v) { nuevaTalla = v; },
        
        resetCiclo() {
            selectedCicloId = null;
            medicionesCargadas = [];
			fechaSiembraCargada = undefined;
        },

        async loadLugares(lugares: Lugar[]) {
            if (lugares?.length > 0) { lugaresLocales = lugares; } 
            else { lugaresLocales = await Actions.fetchLugares(); }
        },

        async cargarMediciones() {
            if (!selectedCicloId) return;
            cargandoDatos = true; errorCarga = '';
			try {
				const data = await Actions.fetchMediciones(selectedCicloId);
				medicionesCargadas = data.mediciones;
				fechaSiembraCargada = data.fechaSiembra;
			} 
            catch (err) { errorCarga = err instanceof Error ? err.message : 'Error de carga'; } 
            finally { cargandoDatos = false; }
        },

		handleUsarMediciones(callback: (m: MedicionCargada[], fechaSiembra?: string) => void) {
			callback(medicionesCargadas, fechaSiembraCargada);
            this.resetCiclo();
        },

        handleAgregarPunto(onAgregar: (f: string, t: number) => void, onError: (e: string) => void) {
            const res = Actions.validarPuntoManual(nuevaFecha, nuevaTalla);
            if (res.error) { onError(res.error); return; }
            onAgregar(res.fecha, res.talla);
            nuevaFecha = ''; nuevaTalla = ''; onError('');
        }
	};
}
