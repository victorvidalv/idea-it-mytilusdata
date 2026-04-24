/**
 * Gestión de puntos de datos para ProyeccionPanel.
 */

export function agregarPunto(dias: number[], tallas: number[], dia: number, talla: number) {
	const newDias = [...dias];
	const newTallas = [...tallas];
	const idx = newDias.indexOf(dia);
	
	if (idx >= 0) {
		newTallas[idx] = talla;
	} else {
		newDias.push(dia);
		newTallas.push(talla);
	}
	
	return { dias: newDias, tallas: newTallas };
}

export function eliminarPunto(dias: number[], tallas: number[], dia: number) {
	const idx = dias.indexOf(dia);
	if (idx < 0) return { dias, tallas };
	
	return {
		dias: dias.filter((_, i) => i !== idx),
		tallas: tallas.filter((_, i) => i !== idx)
	};
}
