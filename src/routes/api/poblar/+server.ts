/**
 * Endpoint GET /api/poblar
 * 
 * Ejecuta el ETL de biblioteca de curvas sigmoidales.
 * Replica la lógica del ETL.py:
 * 1. Extrae mediciones de talla por ciclo
 * 2. Calcula días transcurridos desde primera medición
 * 3. Ajusta modelo sigmoidal con Levenberg-Marquardt
 * 4. Filtra por R² >= 0.85
 * 5. Vacia tabla biblioteca e inserta nuevos registros
 * 
 * Solo accesible para usuarios con rol ADMIN.
 */

import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { usuarios, apiKeys } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { hasMinRole, ROLES, type Rol } from '$lib/server/auth/roles';
import {
	extraerYTransformar,
	procesarCiclos,
	filtrarExitosos,
	cargarBiblioteca
} from '$lib/server/biblioteca';

import type { RequestEvent } from './$types';

/**
 * Valida API Key y verifica que el usuario tenga rol ADMIN.
 */
async function validarAdmin(authHeader: string | null): Promise<{ userId: number } | { error: Response }> {
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return { error: json({ error: 'Falta la API Key en el header Authorization' }, { status: 401 }) };
	}

	const key = authHeader.split(' ')[1];

	// Buscar API key
	const [apiKeyRecord] = await db
		.select()
		.from(apiKeys)
		.where(eq(apiKeys.key, key))
		.limit(1);

	if (!apiKeyRecord) {
		return { error: json({ error: 'API Key inválida' }, { status: 401 }) };
	}

	// Obtener usuario con su rol
	const [user] = await db
		.select({ id: usuarios.id, rol: usuarios.rol })
		.from(usuarios)
		.where(eq(usuarios.id, apiKeyRecord.userId))
		.limit(1);

	if (!user) {
		return { error: json({ error: 'Usuario no encontrado' }, { status: 401 }) };
	}

	// Verificar rol ADMIN
	if (!hasMinRole(user.rol as Rol, ROLES.ADMIN)) {
		return { error: json({ error: 'Acceso denegado. Se requiere rol ADMIN' }, { status: 403 }) };
	}

	return { userId: user.id };
}

/**
 * GET /api/poblar
 * Ejecuta el ETL completo de biblioteca.
 */
export async function GET({ request }: RequestEvent) {
	// Validar autenticación y autorización
	const authResult = await validarAdmin(request.headers.get('Authorization'));
	if ('error' in authResult) {
		return authResult.error;
	}

	try {
		// Fase 1: Extracción y transformación
		console.log('[POBLAR] Iniciando extracción de datos...');
		const { adminId, datosPorCiclo, totalMediciones, totalCiclos } = await extraerYTransformar();

		if (totalMediciones === 0) {
			return json({
				success: true,
				message: 'No hay mediciones de TALLA_LONGITUD para procesar',
				estadisticas: {
					medicionesEncontradas: 0,
					ciclosProcesados: 0,
					ciclosExitosos: 0,
					registrosInsertados: 0
				}
			});
		}

		console.log(`[POBLAR] Encontradas ${totalMediciones} mediciones en ${totalCiclos} ciclos`);

		// Fase 2: Modelado sigmoidal
		console.log('[POBLAR] Iniciando ajuste de curvas...');
		const resultados = procesarCiclos(datosPorCiclo);
		const exitosos = filtrarExitosos(resultados);

		console.log(`[POBLAR] Ajustes exitosos: ${exitosos.length}/${resultados.length}`);

		// Fase 3: Carga en base de datos
		console.log('[POBLAR] Iniciando carga en base de datos...');
		const resultadoCarga = await cargarBiblioteca(exitosos, adminId);

		if (!resultadoCarga.exitoso) {
			return json(
				{
					success: false,
					error: resultadoCarga.error || 'Error en la carga de datos'
				},
				{ status: 500 }
			);
		}

		console.log(`[POBLAR] Proceso completado. ${resultadoCarga.registrosInsertados} registros insertados`);

		return json({
			success: true,
			message: 'Biblioteca poblada exitosamente',
			estadisticas: {
				medicionesEncontradas: totalMediciones,
				ciclosProcesados: totalCiclos,
				ciclosExitosos: exitosos.length,
				ciclosDescartados: resultados.length - exitosos.length,
				registrosInsertados: resultadoCarga.registrosInsertados
			}
		});
	} catch (error) {
		console.error('[POBLAR] Error:', error);
		const mensaje = error instanceof Error ? error.message : 'Error desconocido';
		return json(
			{
				success: false,
				error: mensaje
			},
			{ status: 500 }
		);
	}
}