import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CicloRow from './CicloRow.svelte';

vi.mock('$app/forms', () => ({
	enhance: vi.fn(() => ({}))
}));

vi.mock('$app/environment', () => ({
	browser: false
}));

describe('CicloRow', () => {
	const formatDate = (d: string | null) => (d ? new Date(d).toLocaleDateString('es-CL') : '—');
	const diasCultivo = (s: string | null, f: string | null) => {
		if (!s) return '—';
		const start = new Date(s);
		const end = f ? new Date(f) : new Date();
		return Math.floor((end.getTime() - start.getTime()) / 86400000).toString();
	};

	const baseCiclo = {
		id: 1,
		activo: true,
		nombre: 'Ciclo Primavera',
		lugarNombre: 'Centro Norte',
		fechaSiembra: '2025-09-01T00:00:00Z',
		fechaFinalizacion: null,
		isOwner: true
	};

	const defaultProps = {
		ciclo: baseCiclo,
		canViewAll: false,
		formatDate,
		diasCultivo
	};

	describe('Renderizado básico', () => {
		it('debería mostrar el nombre del ciclo', async () => {
			render(CicloRow, defaultProps);
			await expect.element(page.getByText('Ciclo Primavera')).toBeInTheDocument();
		});

		it('debería mostrar el nombre del centro', async () => {
			render(CicloRow, defaultProps);
			await expect.element(page.getByText('Centro Norte')).toBeInTheDocument();
		});

		it('debería mostrar estado "Activo" cuando ciclo está activo', async () => {
			render(CicloRow, defaultProps);
			await expect.element(page.getByText('Activo')).toBeInTheDocument();
		});

		it('debería mostrar estado "Finalizado" cuando ciclo no está activo', async () => {
			render(CicloRow, { ...defaultProps, ciclo: { ...baseCiclo, activo: false } });
			await expect.element(page.getByText('Finalizado')).toBeInTheDocument();
		});
	});

	describe('Permisos del propietario', () => {
		it('debería mostrar botón "Finalizar" cuando isOwner y activo', async () => {
			render(CicloRow, defaultProps);
			await expect.element(page.getByText('Finalizar')).toBeInTheDocument();
		});

		it('debería mostrar botón "Reactivar" cuando isOwner y no activo', async () => {
			render(CicloRow, { ...defaultProps, ciclo: { ...baseCiclo, activo: false } });
			await expect.element(page.getByText('Reactivar')).toBeInTheDocument();
		});

		it('debería mostrar botón Eliminar cuando isOwner', async () => {
			render(CicloRow, defaultProps);
			await expect.element(page.getByTitle('Eliminar ciclo')).toBeInTheDocument();
		});

		it('no debería mostrar acciones cuando no es owner', async () => {
			render(CicloRow, { ...defaultProps, ciclo: { ...baseCiclo, isOwner: false } });
			await expect.element(page.getByText('Finalizar')).not.toBeInTheDocument();
			await expect.element(page.getByTitle('Eliminar ciclo')).not.toBeInTheDocument();
		});
	});

	describe('Indicador de otro usuario', () => {
		it('debería mostrar "Otro usuario" cuando canViewAll y no es owner', async () => {
			render(CicloRow, {
				...defaultProps,
				canViewAll: true,
				ciclo: { ...baseCiclo, isOwner: false }
			});
			await expect.element(page.getByText('Otro usuario')).toBeInTheDocument();
		});
	});
});
