import { describe, it, expect } from 'vitest';
import {
	parsePaginationParams,
	buildPaginationMeta,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE
} from './pagination';

describe('Pagination Module', () => {
	describe('parsePaginationParams', () => {
		it('debería retornar valores por defecto sin parámetros', () => {
			const params = new URLSearchParams();
			const result = parsePaginationParams(params);

			expect(result.page).toBe(1);
			expect(result.limit).toBe(DEFAULT_PAGE_SIZE);
			expect(result.offset).toBe(0);
		});

		it('debería parsear page y limit válidos', () => {
			const params = new URLSearchParams({ page: '3', limit: '20' });
			const result = parsePaginationParams(params);

			expect(result.page).toBe(3);
			expect(result.limit).toBe(20);
			expect(result.offset).toBe(40); // (3-1) * 20
		});

		it('debería limitar limit al MAX_PAGE_SIZE', () => {
			const params = new URLSearchParams({ limit: '9999' });
			const result = parsePaginationParams(params);

			expect(result.limit).toBe(MAX_PAGE_SIZE);
		});

		it('debería forzar page mínimo a 1', () => {
			const params = new URLSearchParams({ page: '0' });
			const result = parsePaginationParams(params);

			expect(result.page).toBe(1);
		});

		it('debería forzar page mínimo a 1 con valores negativos', () => {
			const params = new URLSearchParams({ page: '-5' });
			const result = parsePaginationParams(params);

			expect(result.page).toBe(1);
		});

		it('debería forzar limit mínimo a 1', () => {
			const params = new URLSearchParams({ limit: '0' });
			const result = parsePaginationParams(params);

			expect(result.limit).toBe(1);
		});

		it('debería manejar valores no numéricos como defecto', () => {
			const params = new URLSearchParams({ page: 'abc', limit: 'xyz' });
			const result = parsePaginationParams(params);

			expect(result.page).toBe(1);
			expect(result.limit).toBe(DEFAULT_PAGE_SIZE);
		});

		it('debería calcular offset correctamente para página 1', () => {
			const params = new URLSearchParams({ page: '1', limit: '25' });
			const result = parsePaginationParams(params);

			expect(result.offset).toBe(0);
		});

		it('debería calcular offset correctamente para página 5 con limit 10', () => {
			const params = new URLSearchParams({ page: '5', limit: '10' });
			const result = parsePaginationParams(params);

			expect(result.offset).toBe(40);
		});
	});

	describe('buildPaginationMeta', () => {
		it('debería construir metadatos correctos para primera página', () => {
			const meta = buildPaginationMeta({ page: 1, limit: 10, offset: 0 }, 100);

			expect(meta.page).toBe(1);
			expect(meta.limit).toBe(10);
			expect(meta.total).toBe(100);
			expect(meta.totalPages).toBe(10);
			expect(meta.hasNextPage).toBe(true);
			expect(meta.hasPrevPage).toBe(false);
		});

		it('debería construir metadatos correctos para última página', () => {
			const meta = buildPaginationMeta({ page: 10, limit: 10, offset: 90 }, 100);

			expect(meta.hasNextPage).toBe(false);
			expect(meta.hasPrevPage).toBe(true);
		});

		it('debería construir metadatos para página intermedia', () => {
			const meta = buildPaginationMeta({ page: 5, limit: 10, offset: 40 }, 100);

			expect(meta.hasNextPage).toBe(true);
			expect(meta.hasPrevPage).toBe(true);
		});

		it('debería manejar 0 registros', () => {
			const meta = buildPaginationMeta({ page: 1, limit: 10, offset: 0 }, 0);

			expect(meta.total).toBe(0);
			expect(meta.totalPages).toBe(1);
			expect(meta.hasNextPage).toBe(false);
			expect(meta.hasPrevPage).toBe(false);
		});

		it('debería calcular totalPages con redondeo hacia arriba', () => {
			const meta = buildPaginationMeta({ page: 1, limit: 10, offset: 0 }, 15);

			expect(meta.totalPages).toBe(2); // ceil(15/10)
		});

		it('debería manejar exactamente 1 página completa', () => {
			const meta = buildPaginationMeta({ page: 1, limit: 50, offset: 0 }, 50);

			expect(meta.totalPages).toBe(1);
			expect(meta.hasNextPage).toBe(false);
		});
	});

	describe('Constantes', () => {
		it('DEFAULT_PAGE_SIZE debería ser 50', () => {
			expect(DEFAULT_PAGE_SIZE).toBe(50);
		});

		it('MAX_PAGE_SIZE debería ser 200', () => {
			expect(MAX_PAGE_SIZE).toBe(200);
		});
	});
});
