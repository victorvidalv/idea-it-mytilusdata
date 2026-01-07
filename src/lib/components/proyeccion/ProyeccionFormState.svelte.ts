import * as Actions from './ProyeccionFormActions';
import type { Lugar, Ciclo, MedicionCargada } from './ProyeccionComponentTypes';

export function createFormState() {
	let lugaresLocales = $state<Lugar[]>([]);
	let selectedLugarId = $state<number | null>(null);
	let selectedCicloId = $state<number | null>(null);
	let cargandoDatos = $state(false);
	let errorCarga = $state('');
	let medicionesCargadas = $state<MedicionCargada[]>([]);
	let nuevoDia = $state('');
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
		get nuevoDia() { return nuevoDia; },
		set nuevoDia(v) { nuevoDia = v; },
		get nuevaTalla() { return nuevaTalla; },
		set nuevaTalla(v) { nuevaTalla = v; },
        
        resetCiclo() {
            selectedCicloId = null;
            medicionesCargadas = [];
        },

        async loadLugares(lugares: Lugar[]) {
            if (lugares?.length > 0) { lugaresLocales = lugares; } 
            else { lugaresLocales = await Actions.fetchLugares(); }
        },

        async cargarMediciones() {
            if (!selectedCicloId) return;
            cargandoDatos = true; errorCarga = '';
            try { medicionesCargadas = await Actions.fetchMediciones(selectedCicloId); } 
            catch (err) { errorCarga = err instanceof Error ? err.message : 'Error de carga'; } 
            finally { cargandoDatos = false; }
        },

        handleUsarMediciones(callback: (m: MedicionCargada[]) => void) {
            callback(medicionesCargadas);
            this.resetCiclo();
        },

        handleAgregarPunto(onAgregar: (d: number, t: number) => void, onError: (e: string) => void) {
            const res = Actions.validarPuntoManual(nuevoDia, nuevaTalla);
            if (res.error) { onError(res.error); return; }
            onAgregar(res.dia, res.talla);
            nuevoDia = ''; nuevaTalla = ''; onError('');
        }
	};
}
