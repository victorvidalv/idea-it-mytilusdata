/**
 * Gestión de puntos de datos para ProyeccionPanel.
 * Ahora usa fechas reales en lugar de días relativos.
 */

export function agregarPunto(fechas: string[], tallas: number[], fecha: string, talla: number) {
	const newFechas = [...fechas];
	const newTallas = [...tallas];
	const idx = newFechas.indexOf(fecha);
	
	if (idx >= 0) {
		newTallas[idx] = talla;
	} else {
		newFechas.push(fecha);
		newTallas.push(talla);
	}
	
	return { fechas: newFechas, tallas: newTallas };
}

export function eliminarPunto(fechas: string[], tallas: number[], fecha: string) {
	const idx = fechas.indexOf(fecha);
	if (idx < 0) return { fechas, tallas };
	
	return {
		fechas: fechas.filter((_, i) => i !== idx),
		tallas: tallas.filter((_, i) => i !== idx)
	};
}
