// --- Constantes de paginación ---

/** Tamaño de página por defecto */
export const DEFAULT_PAGE_SIZE = 50;

/** Tamaño máximo de página permitido (protección contra abuso) */
export const MAX_PAGE_SIZE = 200;

// --- Tipos ---

export interface PaginationParams {
	page: number;
	limit: number;
	offset: number;
}

export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

// --- Funciones ---

/**
 * Extraer y sanitizar parámetros de paginación desde URL searchParams.
 * Aplica límites seguros para evitar abuso (DoS por paginación excesiva).
 */
export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {
	const rawPage = parseInt(searchParams.get('page') ?? '1', 10);
	const rawLimit = parseInt(searchParams.get('limit') ?? String(DEFAULT_PAGE_SIZE), 10);

	// Sanitizar: valores mínimos y máximos
	const page = Math.max(1, isNaN(rawPage) ? 1 : rawPage);
	const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, isNaN(rawLimit) ? DEFAULT_PAGE_SIZE : rawLimit));
	const offset = (page - 1) * limit;

	return { page, limit, offset };
}

/**
 * Construir metadatos de paginación a partir de los parámetros y el total de registros.
 */
export function buildPaginationMeta(params: PaginationParams, total: number): PaginationMeta {
	const totalPages = Math.ceil(total / params.limit) || 1;

	return {
		page: params.page,
		limit: params.limit,
		total,
		totalPages,
		hasNextPage: params.page < totalPages,
		hasPrevPage: params.page > 1
	};
}
