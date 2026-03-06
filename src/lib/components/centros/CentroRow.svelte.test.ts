import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CentroRow from './CentroRow.svelte';

vi.mock('$app/forms', () => ({
	enhance: vi.fn(() => ({}))
}));

vi.mock('$app/environment', () => ({
	browser: false
}));

describe('CentroRow', () => {
	const baseCentro = {
		id: 1,
		nombre: 'Centro Calbuco',
		latitud: -41.4689,
		longitud: -72.9411,
		totalCiclos: 3,
		isOwner: true,
		createdAt: '2025-01-15T00:00:00Z'
	};

	const defaultProps = {
		centro: baseCentro,
		editingId: null,
		canViewAll: false,
		onEdit: vi.fn(),
		onCancel: vi.fn(),
		onSuccess: vi.fn(),
		onError: vi.fn()
	};

	describe('Modo visualización', () => {
		it('debería mostrar el nombre del centro', async () => {
			render(CentroRow, defaultProps);
			await expect.element(page.getByText('Centro Calbuco')).toBeInTheDocument();
		});

		it('debería mostrar la latitud formateada', async () => {
			render(CentroRow, defaultProps);
			await expect.element(page.getByText('-41.4689')).toBeInTheDocument();
		});

		it('debería mostrar la longitud formateada', async () => {
			render(CentroRow, defaultProps);
			await expect.element(page.getByText('-72.9411')).toBeInTheDocument();
		});

		it('debería mostrar el total de ciclos', async () => {
			render(CentroRow, defaultProps);
			await expect.element(page.getByText('3')).toBeInTheDocument();
		});

		it('debería mostrar guión cuando no hay latitud', async () => {
			render(CentroRow, { ...defaultProps, centro: { ...baseCentro, latitud: null } });
			await expect.element(page.getByText('—').first()).toBeInTheDocument();
		});
	});

	describe('Permisos del propietario', () => {
		it('debería mostrar botón Editar cuando isOwner es true', async () => {
			render(CentroRow, defaultProps);
			await expect.element(page.getByTitle('Editar')).toBeInTheDocument();
		});

		it('no debería mostrar botón Editar cuando isOwner es false', async () => {
			render(CentroRow, { ...defaultProps, centro: { ...baseCentro, isOwner: false } });
			await expect.element(page.getByTitle('Editar')).not.toBeInTheDocument();
		});

		it('debería mostrar botón Eliminar cuando isOwner y totalCiclos=0', async () => {
			render(CentroRow, { ...defaultProps, centro: { ...baseCentro, totalCiclos: 0 } });
			await expect.element(page.getByTitle('Eliminar')).toBeInTheDocument();
		});

		it('no debería mostrar botón Eliminar cuando hay ciclos', async () => {
			render(CentroRow, defaultProps);
			await expect.element(page.getByTitle('Eliminar')).not.toBeInTheDocument();
		});
	});

	describe('Indicador de propiedad', () => {
		it('debería mostrar "otro" cuando canViewAll y no es owner', async () => {
			render(CentroRow, {
				...defaultProps,
				canViewAll: true,
				centro: { ...baseCentro, isOwner: false }
			});
			await expect.element(page.getByText('otro')).toBeInTheDocument();
		});

		it('no debería mostrar "otro" cuando es owner', async () => {
			render(CentroRow, { ...defaultProps, canViewAll: true });
			await expect.element(page.getByText('otro')).not.toBeInTheDocument();
		});
	});

	describe('Modo edición', () => {
		it('debería mostrar formulario de edición cuando editingId coincide', async () => {
			render(CentroRow, { ...defaultProps, editingId: 1 });
			await expect.element(page.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
			await expect.element(page.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
		});

		it('no debería mostrar formulario cuando editingId no coincide', async () => {
			render(CentroRow, { ...defaultProps, editingId: 99 });
			await expect.element(page.getByRole('button', { name: 'Guardar' })).not.toBeInTheDocument();
		});
	});
});
