import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import ExcelJS from 'exceljs';
import {
	checkApiRateLimit,
	logApiRateLimit,
	getApiRateLimitIdentifier
} from '$lib/server/apiRateLimiter';
import { logDataExport } from '$lib/server/audit';

import type { RequestEvent } from './$types';

export async function GET({ locals, request, getClientAddress }: RequestEvent) {
	if (!locals.user) {
		return new Response('No autorizado', { status: 401 });
	}

	const userId = locals.user.userId;
	const clientIp = getClientAddress();
	const userAgent = request.headers.get('user-agent') ?? undefined;

	// Rate limiting con límite EXPORT más restrictivo
	const identifier = getApiRateLimitIdentifier(null, clientIp);
	const rateLimitResult = await checkApiRateLimit(identifier, 'EXPORT');

	if (!rateLimitResult.allowed) {
		return new Response(
			JSON.stringify({
				error: 'Límite de exportaciones excedido',
				retryAfter: rateLimitResult.resetIn
			}),
			{
				status: 429,
				headers: {
					'Content-Type': 'application/json',
					'Retry-After': String(Math.ceil(rateLimitResult.resetIn / 1000)),
					'X-RateLimit-Limit': String(rateLimitResult.limit),
					'X-RateLimit-Remaining': '0',
					'X-RateLimit-Reset': String(Date.now() + rateLimitResult.resetIn)
				}
			}
		);
	}

	// Registrar solicitud para rate limiting
	await logApiRateLimit(identifier);

	// Registrar exportación en auditoría (sin bloquear)
	logDataExport({
		userId,
		format: 'xlsx',
		ip: clientIp,
		userAgent
	}).catch(() => {});

	try {
		// 1. Obtener Centros de Cultivo (Lugares)
		const lugaresData = await db
			.select({
				ID: table.lugares.id,
				Nombre: table.lugares.nombre,
				Latitud: table.lugares.latitud,
				Longitud: table.lugares.longitud,
				'Creado el': table.lugares.createdAt
			})
			.from(table.lugares)
			.where(eq(table.lugares.userId, userId));

		// 2. Obtener Ciclos Productivos
		const ciclosData = await db
			.select({
				ID: table.ciclos.id,
				Nombre: table.ciclos.nombre,
				'Centro de Cultivo': table.lugares.nombre,
				'Fecha Inicio': table.ciclos.fechaSiembra,
				'Fecha Fin Estimada': table.ciclos.fechaFinalizacion,
				Activo: table.ciclos.activo
			})
			.from(table.ciclos)
			.innerJoin(table.lugares, eq(table.ciclos.lugarId, table.lugares.id))
			.where(eq(table.ciclos.userId, userId));

		// 3. Obtener Registros (Mediciones)
		const registrosData = await db
			.select({
				ID: table.mediciones.id,
				'Centro de Cultivo': table.lugares.nombre,
				'Ciclo Productivo': table.ciclos.nombre,
				Tipo: table.tiposRegistro.codigo,
				Origen: table.origenDatos.nombre,
				Valor: table.mediciones.valor,
				Unidad: table.tiposRegistro.unidadBase,
				Texto: table.mediciones.notas,
				'Fecha Registro': table.mediciones.fechaMedicion,
				'Creado el': table.mediciones.createdAt
			})
			.from(table.mediciones)
			.innerJoin(table.lugares, eq(table.mediciones.lugarId, table.lugares.id))
			.leftJoin(table.ciclos, eq(table.mediciones.cicloId, table.ciclos.id))
			.innerJoin(table.tiposRegistro, eq(table.mediciones.tipoId, table.tiposRegistro.id))
			.innerJoin(table.origenDatos, eq(table.mediciones.origenId, table.origenDatos.id))
			.where(eq(table.mediciones.userId, userId));

		// Crear libro de Excel con ExcelJS
		const workbook = new ExcelJS.Workbook();
		workbook.creator = 'Plataforma Idea';
		workbook.created = new Date();

		// Función auxiliar para agregar una hoja con datos
		function addSheetWithData(
			workbook: ExcelJS.Workbook,
			sheetName: string,
			data: Record<string, unknown>[]
		) {
			const worksheet = workbook.addWorksheet(sheetName);

			if (data.length === 0) {
				worksheet.columns = [{ header: 'Mensaje', key: 'Mensaje' }];
				worksheet.addRow({ Mensaje: 'No hay datos registrados' });
				return;
			}

			// Obtener las columnas del primer objeto
			const columns = Object.keys(data[0]);
			worksheet.columns = columns.map((col) => ({ header: col, key: col }));

			// Agregar filas
			data.forEach((row) => {
				worksheet.addRow(row);
			});

			// Estilo para el encabezado
			worksheet.getRow(1).font = { bold: true };
			worksheet.getRow(1).fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: 'FFE0E0E0' }
			};
		}

		// Agregar hojas
		addSheetWithData(workbook, 'Centros de Cultivo', lugaresData);
		addSheetWithData(workbook, 'Ciclos Productivos', ciclosData);
		addSheetWithData(workbook, 'Registros', registrosData);

		// Generar buffer
		const excelBuffer = await workbook.xlsx.writeBuffer();

		// Configurar cabeceras para descarga
		const headers = new Headers();
		headers.append(
			'Content-Type',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		headers.append('Content-Disposition', 'attachment; filename="Mis_Datos_PlataformaIdea.xlsx"');
		// Headers de rate limiting
		headers.append('X-RateLimit-Limit', String(rateLimitResult.limit));
		headers.append('X-RateLimit-Remaining', String(rateLimitResult.remaining - 1));
		headers.append('X-RateLimit-Reset', String(Date.now() + rateLimitResult.resetIn));

		return new Response(excelBuffer, {
			status: 200,
			headers
		});
	} catch (error) {
		console.error('Error al generar Excel:', error);
		return new Response('Error al generar el archivo de exportación', { status: 500 });
	}
}
