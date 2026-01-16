import {
	calcularSSENormalizado,
	encontrarCurvaMasSimilar
} from '../src/lib/server/biblioteca/similitud-calculo';
import { calcularDiaObjetivo } from '../src/lib/server/biblioteca/similitud-proyeccion';
import { escalarParametros } from '../src/lib/server/biblioteca/similitud-estadisticas';
import { calcularIncertidumbreResidual } from '../src/lib/server/biblioteca/similitud-incertidumbre';
import {
	construirSeriesProyeccion,
	evaluarSigmoidal
} from '../src/lib/components/calculo-sigmoides-similares/proyeccionUtils';
import type { ParametrosSigmoidal } from '../src/lib/server/db/schema';
import type { BibliotecaRecord } from '../src/lib/server/biblioteca/queries';

type Datos = { dias: number[]; tallas: number[] };
type Check = { nombre: string; esperado: string; obtenido: string; ok: boolean };

function modelo(params: ParametrosSigmoidal, dia: number): number {
	return params.L / (1 + Math.exp(-params.k * (dia - params.x0)));
}

function generarDatos(params: ParametrosSigmoidal, dias: number[]): Datos {
	return {
		dias,
		tallas: dias.map((dia) => Math.round(modelo(params, dia) * 100) / 100)
	};
}

function crearCurva(params: ParametrosSigmoidal, id: number, codigo: string): BibliotecaRecord {
	return {
		id,
		codigoReferencia: codigo,
		cicloId: id,
		puntosJson: {},
		parametrosCalculados: params,
		formulaTipo: 'LOGISTICO',
		metadatos: null,
		userId: 1,
		createdAt: new Date(),
		updatedAt: new Date()
	};
}

function cerca(valor: number, esperado: number, tolerancia: number): boolean {
	return Math.abs(valor - esperado) <= tolerancia;
}

function imprimir(checks: Check[]) {
	for (const check of checks) {
		const estado = check.ok ? 'OK' : 'FALLA';
		console.log(`${estado} | ${check.nombre}`);
		console.log(`  esperado: ${check.esperado}`);
		console.log(`  obtenido : ${check.obtenido}`);
	}
}

async function main() {
	const referencia: ParametrosSigmoidal = { L: 80, k: 0.02, x0: 150, r2: 0.98 };
	const mismaFormaEscalada: ParametrosSigmoidal = { L: 60, k: 0.02, x0: 150, r2: 0.97 };
	const formaDesplazada: ParametrosSigmoidal = { L: 60, k: 0.018, x0: 210, r2: 0.9 };
	const dias = [60, 90, 120, 150, 180, 210, 240, 270, 300];
	const datos = generarDatos(mismaFormaEscalada, dias);

	const curvaReferencia = crearCurva(referencia, 1, 'REF-MISMA-FORMA');
	const curvaDesplazada = crearCurva(formaDesplazada, 2, 'REF-DESPLAZADA');

	const paramsEscalados = escalarParametros(referencia, datos);
	const diaObjetivo = calcularDiaObjetivo(paramsEscalados, 45);
	const sseMismaForma = calcularSSENormalizado(datos, curvaReferencia);
	const sseDesplazada = calcularSSENormalizado(datos, curvaDesplazada);
	const mejor = await encontrarCurvaMasSimilar(datos, [curvaDesplazada, curvaReferencia]);

	const proyeccion = [
		{ dia: 305, talla: evaluarSigmoidal(305, paramsEscalados), tipo: 'proyectado' as const },
		{ dia: 365, talla: evaluarSigmoidal(365, paramsEscalados), tipo: 'proyectado' as const }
	];
	const incertidumbre = calcularIncertidumbreResidual(datos, paramsEscalados, proyeccion, false);
	const series = construirSeriesProyeccion(
		proyeccion,
		datos.dias.map((dia, i) => ({ dia, talla: datos.tallas[i] })),
		45,
		{
			id: curvaReferencia.id,
			codigoReferencia: curvaReferencia.codigoReferencia,
			sse: sseMismaForma,
			parametros: curvaReferencia.parametrosCalculados
		},
		incertidumbre
	);

	const checks: Check[] = [
		{
			nombre: 'Escalamiento de L recupera la escala real de una curva con misma forma',
			esperado: 'L cercano a 60 mm (tolerancia 0.5)',
			obtenido: `L=${paramsEscalados.L.toFixed(3)} mm`,
			ok: cerca(paramsEscalados.L, 60, 0.5)
		},
		{
			nombre:
				'Día objetivo usa la inversa logística y cae después del punto de inflexión para 45 mm',
			esperado: 'dia objetivo cercano a 205',
			obtenido: `dia=${diaObjetivo ?? 'sin solucion'}`,
			ok: diaObjetivo !== undefined && cerca(diaObjetivo, 205, 1)
		},
		{
			nombre: 'La comparación normalizada premia forma similar aunque cambie la escala',
			esperado: 'SSE misma forma menor que SSE desplazada',
			obtenido: `SSE misma=${sseMismaForma.toFixed(6)}, SSE desplazada=${sseDesplazada.toFixed(6)}`,
			ok: sseMismaForma < sseDesplazada
		},
		{
			nombre: 'La búsqueda de biblioteca selecciona la curva con patrón temporal correcto',
			esperado: 'REF-MISMA-FORMA',
			obtenido: mejor?.codigoReferencia ?? 'sin seleccion',
			ok: mejor?.codigoReferencia === 'REF-MISMA-FORMA'
		},
		{
			nombre: 'La evaluación sigmoidal es estable en extremos numéricos',
			esperado: 'inicio cercano a 0 y cola cercana a L',
			obtenido: `f(-100000)=${evaluarSigmoidal(-100000, referencia).toFixed(3)}, f(100000)=${evaluarSigmoidal(100000, referencia).toFixed(3)}`,
			ok:
				evaluarSigmoidal(-100000, referencia) < 0.001 &&
				cerca(evaluarSigmoidal(100000, referencia), referencia.L, 0.001)
		},
		{
			nombre: 'El gráfico construye las series comparativas esperadas',
			esperado: 'meta, referencia, referencia-escalada, real, banda, mínimos, máximos y proyectado',
			obtenido: series.map((serie) => serie.key).join(', '),
			ok: [
				'meta',
				'referencia',
				'referencia-escalada',
				'real',
				'banda',
				'limite-inferior',
				'limite-superior',
				'proyectado'
			].every((key) => series.some((serie) => serie.key === key))
		},
		{
			nombre: 'La banda de riesgo se ensancha al proyectar más lejos',
			esperado: 'ancho final mayor que ancho inicial',
			obtenido: incertidumbre
				? `inicial=${(incertidumbre.limiteSuperior[0] - incertidumbre.limiteInferior[0]).toFixed(2)} mm, final=${(incertidumbre.limiteSuperior.at(-1)! - incertidumbre.limiteInferior.at(-1)!).toFixed(2)} mm`
				: 'sin incertidumbre',
			ok:
				!!incertidumbre &&
				incertidumbre.limiteSuperior.at(-1)! - incertidumbre.limiteInferior.at(-1)! >
					incertidumbre.limiteSuperior[0] - incertidumbre.limiteInferior[0]
		}
	];

	imprimir(checks);

	if (checks.some((check) => !check.ok)) {
		process.exitCode = 1;
	}
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
