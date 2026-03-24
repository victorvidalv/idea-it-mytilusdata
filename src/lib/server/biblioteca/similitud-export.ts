import type { ResultadoProyeccion } from './similitud-tipos';

/**
 * Convertir resultado de proyección a formato CSV exportable.
 */
export function exportarProyeccionCSV(resultado: ResultadoProyeccion): string {
	if (!resultado.success || resultado.proyeccion.length === 0) {
		return 'dia,talla,tipo\n';
	}

	const lineas = ['dia,talla,tipo'];
	for (const punto of resultado.proyeccion) {
		lineas.push(`${punto.dia},${punto.talla},${punto.tipo}`);
	}

	return lineas.join('\n');
}
