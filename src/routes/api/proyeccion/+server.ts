/**
 * Endpoint API para proyección de crecimiento.
 * Delega la lógica a los handlers correspondientes.
 */

import type { RequestEvent } from './$types';
import { handleGetProyeccion, handlePostProyeccion } from './handlers';

/**
 * GET /api/proyeccion?cicloId=123
 * Ruta de compatibilidad. El endpoint canonico es /api/proyectar-sigmoides.
 * Obtiene las mediciones de talla de un ciclo para proyección.
 */
export async function GET(event: RequestEvent): Promise<Response> {
	return handleGetProyeccion(event);
}

/**
 * POST /api/proyeccion
 * Ruta de compatibilidad. El endpoint canonico es /api/proyectar-sigmoides.
 * Ejecuta la proyección de crecimiento usando el servicio de similitud.
 */
export async function POST(event: RequestEvent): Promise<Response> {
	return handlePostProyeccion(event);
}
