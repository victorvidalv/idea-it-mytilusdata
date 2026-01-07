/**
 * Lógica para la rotación de mensajes en ProyeccionLoader.svelte.
 */

export const MENSAJES_LOADER = [
	'Analizando tus datos.',
	'Buscando en la biblioteca',
	'Ajustando formulas',
	'Proyectando.'
];

export const DURACION_MINIMA_LOADER = 5000;
export const INTERVALO_MENSAJE = 1000;

export function scrollToResults() {
    const el = document.getElementById('grafico-resultados');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
