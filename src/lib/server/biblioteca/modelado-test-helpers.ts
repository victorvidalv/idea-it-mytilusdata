import { crearModeloLogisticoEstacional } from './modelado-utils';

/**
 * Mock data determinista de Mytilus chilensis.
 * 18 puntos a lo largo de ~1 año con sigmoide base + estacionalidad
 * que frena el crecimiento en invierno (días ~150–240, hemisferio sur)
 * y un ruido gaussiano leve predecible.
 */
const MOCK_DIAS = [
	30, 50, 70, 90, 110, 130, 150, 170, 190, 210, 230, 250, 270, 290, 310, 330, 350, 370
];

const RUIDO_FIJO = [
	0.35, -0.42, 0.18, -0.28, 0.55, -0.15, 0.22, -0.62, 0.48, -0.12, 0.25, -0.38, 0.52, -0.22,
	0.15, -0.35, 0.28, -0.18
];

export function generarMockDatosCrecimiento(): { dias: number[]; tallas: number[] } {
	const L = 92;
	const k0 = 0.022;
	const k1 = 0.007;
	const k2 = -0.004;
	const x0 = 195;

	const modelo = crearModeloLogisticoEstacional([L, k0, k1, k2, x0]);
	const tallas = MOCK_DIAS.map((d, i) => modelo(d) + RUIDO_FIJO[i]);
	return { dias: MOCK_DIAS, tallas };
}
