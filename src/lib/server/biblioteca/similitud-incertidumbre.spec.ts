import { describe, expect, it } from 'vitest';
import { calcularIncertidumbreResidual } from './similitud-incertidumbre';
import { crearModeloLogistico } from './modelado-utils';
import type { ParametrosSigmoidal } from '$lib/server/db/schema';

const PARAMS: ParametrosSigmoidal = { L: 60, k: 0.02, x0: 150, r2: 0.98 };

function generarDatos(dias: number[]) {
	const modelo = crearModeloLogistico([PARAMS.L, PARAMS.k, PARAMS.x0]);
	return { dias, tallas: dias.map((dia) => modelo(dia)) };
}

describe('calcularIncertidumbreResidual', () => {
	it('genera bandas finitas alrededor de la mediana', () => {
		const datos = generarDatos([60, 90, 120, 150, 180, 210, 240, 270, 300]);
		const proyeccion = [
			{ dia: 330, talla: 58, tipo: 'proyectado' as const },
			{ dia: 360, talla: 59, tipo: 'proyectado' as const }
		];

		const incertidumbre = calcularIncertidumbreResidual(datos, PARAMS, proyeccion, false);

		expect(incertidumbre).toBeDefined();
		expect(incertidumbre!.dias).toEqual([330, 360]);
		for (let i = 0; i < incertidumbre!.dias.length; i++) {
			expect(incertidumbre!.limiteInferior[i]).toBeLessThanOrEqual(incertidumbre!.mediana[i]);
			expect(incertidumbre!.mediana[i]).toBeLessThanOrEqual(incertidumbre!.limiteSuperior[i]);
			expect(Number.isFinite(incertidumbre!.limiteInferior[i])).toBe(true);
			expect(Number.isFinite(incertidumbre!.limiteSuperior[i])).toBe(true);
		}
	});

	it('ensancha la banda con el horizonte temporal', () => {
		const datos = generarDatos([60, 90, 120, 150, 180, 210, 240, 270, 300]);
		const proyeccion = [
			{ dia: 305, talla: 58, tipo: 'proyectado' as const },
			{ dia: 390, talla: 59, tipo: 'proyectado' as const }
		];

		const incertidumbre = calcularIncertidumbreResidual(datos, PARAMS, proyeccion, false)!;
		const anchoInicial = incertidumbre.limiteSuperior[0] - incertidumbre.limiteInferior[0];
		const anchoFinal = incertidumbre.limiteSuperior[1] - incertidumbre.limiteInferior[1];

		expect(anchoFinal).toBeGreaterThan(anchoInicial);
	});
});
