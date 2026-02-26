import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';

// Create all mock functions with vi.hoisted
const mockSelect = vi.hoisted(() => vi.fn());

const mockCheckApiRateLimit = vi.hoisted(() => vi.fn());
const mockLogApiRateLimit = vi.hoisted(() => vi.fn());
const mockGetApiRateLimitIdentifier = vi.hoisted(() => vi.fn());
const mockLogDataExport = vi.hoisted(() => vi.fn());

// Mock ExcelJS
const mockAddWorksheet = vi.hoisted(() => vi.fn());
const mockAddRow = vi.hoisted(() => vi.fn());
const mockGetXlsxBuffer = vi.hoisted(() => vi.fn());
const mockWorksheetGetRow = vi.hoisted(() => vi.fn());

vi.mock('$lib/server/db', () => ({
	db: {
		select: mockSelect
	}
}));

vi.mock('$lib/server/db/schema', () => ({
	lugares: { symbol: Symbol('lugares') },
	ciclos: { symbol: Symbol('ciclos') },
	mediciones: { symbol: Symbol('mediciones') },
	tiposRegistro: { symbol: Symbol('tiposRegistro') },
	origenDatos: { symbol: Symbol('origenDatos') }
}));

vi.mock('drizzle-orm', () => ({
	eq: vi.fn((_, value) => ({ eq: value }))
}));

vi.mock('$lib/server/apiRateLimiter', () => ({
	checkApiRateLimit: mockCheckApiRateLimit,
	logApiRateLimit: mockLogApiRateLimit,
	getApiRateLimitIdentifier: mockGetApiRateLimitIdentifier
}));

vi.mock('$lib/server/audit', () => ({
	logDataExport: mockLogDataExport
}));

vi.mock('exceljs', () => ({
	default: {
		Workbook: class MockWorkbook {
			creator = 'MytilusData';
			created = new Date();
			worksheets: unknown[] = [];

			addWorksheet = mockAddWorksheet.mockImplementation(() => ({
				columns: [],
				addRow: mockAddRow,
				getRow: mockWorksheetGetRow.mockReturnValue({
					font: {},
					fill: {}
				})
			}));

			xlsx = {
				writeBuffer: mockGetXlsxBuffer
			};
		}
	},
	Workbook: class MockWorkbook {
		creator = 'MytilusData';
		created = new Date();
		worksheets: unknown[] = [];

		addWorksheet = mockAddWorksheet.mockImplementation(() => ({
			columns: [],
			addRow: mockAddRow,
			getRow: mockWorksheetGetRow.mockReturnValue({
				font: {},
				fill: {}
			})
		}));

		xlsx = {
			writeBuffer: mockGetXlsxBuffer
		};
	}
}));

// Import after mocks are set up
import { GET } from '../../../routes/api/export-data/+server';

/**
 * Helper para crear RequestEvent mock para el endpoint de export-data
 */
function createExportRequestEvent(options: {
	user?: { userId: number; rol: string } | null;
	clientAddress?: string;
	userAgent?: string;
}): RequestEvent {
	const headers = new Map<string, string>();
	if (options.userAgent) {
		headers.set('user-agent', options.userAgent);
	}

	return {
		locals: {
			user: options.user ?? null
		},
		request: {
			headers: {
				get: (key: string) => headers.get(key) ?? null
			}
		} as unknown as Request,
		getClientAddress: () => options.clientAddress ?? '127.0.0.1',
		cookies: {
			get: vi.fn(),
			set: vi.fn(),
			delete: vi.fn(),
			getAll: vi.fn(),
			serialize: vi.fn()
		},
		params: {},
		route: { id: '/api/export-data' },
		url: new URL('http://localhost/api/export-data'),
		isDataRequest: false,
		isSubRequest: false,
		method: 'GET'
	} as unknown as RequestEvent;
}

describe('API /api/export-data', () => {
	/**
	 * Setup all three database queries for the export-data endpoint
	 */
	function mockAllQueries(
		options: {
			lugares?: unknown[];
			ciclos?: unknown[];
			mediciones?: unknown[];
		} = {}
	) {
		// First query: lugares (simple where)
		const whereMock1 = vi.fn().mockResolvedValue(options.lugares ?? []);
		const fromMock1 = vi.fn().mockReturnValue({ where: whereMock1 });

		// Second query: ciclos (innerJoin + where)
		const whereMock2 = vi.fn().mockResolvedValue(options.ciclos ?? []);
		const innerJoinMock2 = vi.fn().mockReturnValue({ where: whereMock2 });
		const fromMock2 = vi.fn().mockReturnValue({ innerJoin: innerJoinMock2 });

		// Third query: mediciones (multiple joins + where)
		const whereMock3 = vi.fn().mockResolvedValue(options.mediciones ?? []);
		const innerJoinMock3c = vi.fn().mockReturnValue({ where: whereMock3 });
		const innerJoinMock3b = vi.fn().mockReturnValue({ innerJoin: innerJoinMock3c });
		const leftJoinMock3 = vi.fn().mockReturnValue({ innerJoin: innerJoinMock3b });
		const innerJoinMock3a = vi.fn().mockReturnValue({ leftJoin: leftJoinMock3 });
		const fromMock3 = vi.fn().mockReturnValue({ innerJoin: innerJoinMock3a });

		// Chain all three select calls
		mockSelect
			.mockReturnValueOnce({ from: fromMock1 })
			.mockReturnValueOnce({ from: fromMock2 })
			.mockReturnValueOnce({ from: fromMock3 });
	}

	beforeEach(() => {
		vi.clearAllMocks();
		mockCheckApiRateLimit.mockResolvedValue({
			allowed: true,
			remaining: 10,
			limit: 10,
			resetIn: 60000
		});
		mockGetApiRateLimitIdentifier.mockReturnValue('test-identifier');
		mockLogDataExport.mockResolvedValue(undefined);
		mockLogApiRateLimit.mockResolvedValue(undefined);
		mockGetXlsxBuffer.mockResolvedValue(Buffer.from('mock-excel-content'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('GET', () => {
		describe('Autenticación', () => {
			it('debería retornar 401 si el usuario no está autenticado', async () => {
				const event = createExportRequestEvent({ user: null });

				const response = await GET(event);

				expect(response.status).toBe(401);
				const text = await response.text();
				expect(text).toBe('No autorizado');
			});

			it('debería permitir acceso a usuario autenticado', async () => {
				mockAllQueries();

				const event = createExportRequestEvent({
					user: { userId: 1, rol: 'USUARIO' }
				});

				const response = await GET(event);

				expect(response.status).toBe(200);
			});

			it('debería funcionar con diferentes roles de usuario', async () => {
				const roles = ['USUARIO', 'INVESTIGADOR', 'ADMIN'];

				for (const rol of roles) {
					vi.clearAllMocks();
					mockCheckApiRateLimit.mockResolvedValue({
						allowed: true,
						remaining: 10,
						limit: 10,
						resetIn: 60000
					});
					mockGetXlsxBuffer.mockResolvedValue(Buffer.from('mock-excel-content'));
					mockAllQueries();

					const event = createExportRequestEvent({
						user: { userId: 1, rol }
					});

					const response = await GET(event);
					expect(response.status).toBe(200);
				}
			});
		});

		describe('Rate Limiting', () => {
			it('debería retornar 429 si se excede el límite de exportaciones', async () => {
				mockCheckApiRateLimit.mockResolvedValue({
					allowed: false,
					remaining: 0,
					limit: 10,
					resetIn: 25000
				});

				const event = createExportRequestEvent({
					user: { userId: 1, rol: 'USUARIO' }
				});

				const response = await GET(event);
				const data = await response.json();

				expect(response.status).toBe(429);
				expect(data.error).toBe('Límite de exportaciones excedido');
				expect(data.retryAfter).toBe(25000);
				expect(response.headers.get('Retry-After')).toBe('25');
				expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
				expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
			});

			it('debería usar el límite EXPORT (10 por minuto)', async () => {
				mockAllQueries();

				const event = createExportRequestEvent({
					user: { userId: 1, rol: 'USUARIO' },
					clientAddress: '192.168.1.1'
				});

				await GET(event);

				expect(mockGetApiRateLimitIdentifier).toHaveBeenCalledWith(null, '192.168.1.1');
				expect(mockCheckApiRateLimit).toHaveBeenCalledWith('test-identifier', 'EXPORT');
			});

			it('debería registrar la solicitud en el rate limiter', async () => {
				mockAllQueries();

				const event = createExportRequestEvent({
					user: { userId: 1, rol: 'USUARIO' }
				});

				await GET(event);

				expect(mockLogApiRateLimit).toHaveBeenCalledWith('test-identifier');
			});
		});

		describe('Casos exitosos', () => {
			it('debería generar un archivo Excel con las tres hojas', async () => {
				mockAllQueries();

				const event = createExportRequestEvent({
					user: { userId: 1, rol: 'USUARIO' }
				});

				const response = await GET(event);

				expect(response.status).toBe(200);
				expect(mockAddWorksheet).toHaveBeenCalledTimes(3);
				expect(mockAddWorksheet).toHaveBeenCalledWith('Centros de Cultivo');
				expect(mockAddWorksheet).toHaveBeenCalledWith('Ciclos Productivos');
				expect(mockAddWorksheet).toHaveBeenCalledWith('Registros');
			});

			it('debería retornar el tipo de contenido correcto', async () => {
				mockAllQueries();

				const event = createExportRequestEvent({
					user: { userId: 1, rol: 'USUARIO' }
				});

				const response = await GET(event);

				expect(response.headers.get('Content-Type')).toBe(
					'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
				);
			});

			it('debería incluir el header Content-Disposition', async () => {
				mockAllQueries();

				const event = createExportRequestEvent({
					user: { userId: 1, rol: 'USUARIO' }
				});

				const response = await GET(event);

				expect(response.headers.get('Content-Disposition')).toBe(
					'attachment; filename="Mis_Datos_MytilusData.xlsx"'
				);
			});

			it('debería incluir headers de rate limit en la respuesta', async () => {
				mockAllQueries();

				const event = createExportRequestEvent({
					user: { userId: 1, rol: 'USUARIO' }
				});

				const response = await GET(event);

				expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
				expect(response.headers.get('X-RateLimit-Remaining')).toBe('9');
				expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
			});

			it('debería registrar la exportación en auditoría', async () => {
				mockAllQueries();

				const event = createExportRequestEvent({
					user: { userId: 1, rol: 'USUARIO' },
					clientAddress: '10.0.0.1',
					userAgent: 'Mozilla/5.0'
				});

				await GET(event);

				expect(mockLogDataExport).toHaveBeenCalledWith({
					userId: 1,
					format: 'xlsx',
					ip: '10.0.0.1',
					userAgent: 'Mozilla/5.0'
				});
			});
		});

		describe('Manejo de datos vacíos', () => {
			it('debería manejar correctamente cuando no hay datos', async () => {
				mockAllQueries({ lugares: [], ciclos: [], mediciones: [] });

				const event = createExportRequestEvent({
					user: { userId: 1, rol: 'USUARIO' }
				});

				const response = await GET(event);

				expect(response.status).toBe(200);
			});

			it('debería agregar mensaje "No hay datos registrados" en hojas vacías', async () => {
				mockAllQueries({ lugares: [], ciclos: [], mediciones: [] });

				const event = createExportRequestEvent({
					user: { userId: 1, rol: 'USUARIO' }
				});

				await GET(event);

				// Se llama 3 veces (una por cada hoja) con datos vacíos
				expect(mockAddRow).toHaveBeenCalledWith({ Mensaje: 'No hay datos registrados' });
			});
		});

		describe('Manejo de errores', () => {
			it('debería retornar 500 si hay error al generar el Excel', async () => {
				mockAllQueries();
				mockGetXlsxBuffer.mockRejectedValue(new Error('Excel generation failed'));

				const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

				const event = createExportRequestEvent({
					user: { userId: 1, rol: 'USUARIO' }
				});

				const response = await GET(event);
				const text = await response.text();

				expect(response.status).toBe(500);
				expect(text).toBe('Error al generar el archivo de exportación');

				consoleSpy.mockRestore();
			});

			it('debería retornar 500 si hay error de base de datos al obtener lugares', async () => {
				// First query fails
				const whereMock1 = vi.fn().mockRejectedValue(new Error('DB connection error'));
				const fromMock1 = vi.fn().mockReturnValue({ where: whereMock1 });
				mockSelect.mockReturnValueOnce({ from: fromMock1 });

				const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

				const event = createExportRequestEvent({
					user: { userId: 1, rol: 'USUARIO' }
				});

				const response = await GET(event);
				const text = await response.text();

				expect(response.status).toBe(500);
				expect(text).toBe('Error al generar el archivo de exportación');

				consoleSpy.mockRestore();
			});

			it('debería retornar 500 si hay error de base de datos al obtener ciclos', async () => {
				// First query succeeds
				const whereMock1 = vi.fn().mockResolvedValue([]);
				const fromMock1 = vi.fn().mockReturnValue({ where: whereMock1 });

				// Second query fails
				const whereMock2 = vi.fn().mockRejectedValue(new Error('DB error'));
				const innerJoinMock2 = vi.fn().mockReturnValue({ where: whereMock2 });
				const fromMock2 = vi.fn().mockReturnValue({ innerJoin: innerJoinMock2 });

				mockSelect
					.mockReturnValueOnce({ from: fromMock1 })
					.mockReturnValueOnce({ from: fromMock2 });

				const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

				const event = createExportRequestEvent({
					user: { userId: 1, rol: 'USUARIO' }
				});

				const response = await GET(event);

				expect(response.status).toBe(500);

				consoleSpy.mockRestore();
			});
		});

		describe('Casos edge', () => {
			it('debería manejar correctamente un cliente sin user-agent', async () => {
				mockAllQueries();

				const event = createExportRequestEvent({
					user: { userId: 1, rol: 'USUARIO' },
					userAgent: undefined
				});

				const response = await GET(event);

				expect(response.status).toBe(200);
				expect(mockLogDataExport).toHaveBeenCalledWith({
					userId: 1,
					format: 'xlsx',
					ip: '127.0.0.1',
					userAgent: undefined
				});
			});

			it('debería manejar diferentes IDs de usuario', async () => {
				const userIds = [1, 42, 999];

				for (const userId of userIds) {
					vi.clearAllMocks();
					mockCheckApiRateLimit.mockResolvedValue({
						allowed: true,
						remaining: 10,
						limit: 10,
						resetIn: 60000
					});
					mockGetXlsxBuffer.mockResolvedValue(Buffer.from('mock-excel-content'));
					mockAllQueries();

					const event = createExportRequestEvent({
						user: { userId, rol: 'USUARIO' }
					});

					const response = await GET(event);
					expect(response.status).toBe(200);
				}
			});

			it('debería manejar datos con caracteres especiales', async () => {
				mockAllQueries({
					lugares: [
						{
							ID: 1,
							Nombre: 'Centro con caracteres: áéíóú ñÑ',
							Latitud: -33.0,
							Longitud: -70.0,
							'Creado el': new Date()
						}
					]
				});

				const event = createExportRequestEvent({
					user: { userId: 1, rol: 'USUARIO' }
				});

				const response = await GET(event);

				expect(response.status).toBe(200);
			});

			it('debería manejar diferentes direcciones IP', async () => {
				mockAllQueries();

				const event = createExportRequestEvent({
					user: { userId: 1, rol: 'USUARIO' },
					clientAddress: '2001:0db8:85a3:0000:0000:8a2e:0370:7334'
				});

				const response = await GET(event);

				expect(response.status).toBe(200);
				expect(mockGetApiRateLimitIdentifier).toHaveBeenCalledWith(
					null,
					'2001:0db8:85a3:0000:0000:8a2e:0370:7334'
				);
			});

			it('debería manejar grandes cantidades de datos', async () => {
				const manyLugares = Array(1000)
					.fill(null)
					.map((_, i) => ({
						ID: i + 1,
						Nombre: `Lugar ${i + 1}`,
						Latitud: -33.0 + i * 0.001,
						Longitud: -70.0 + i * 0.001,
						'Creado el': new Date()
					}));

				mockAllQueries({ lugares: manyLugares, ciclos: [], mediciones: [] });

				const event = createExportRequestEvent({
					user: { userId: 1, rol: 'USUARIO' }
				});

				const response = await GET(event);

				expect(response.status).toBe(200);
			});
		});
	});
});
