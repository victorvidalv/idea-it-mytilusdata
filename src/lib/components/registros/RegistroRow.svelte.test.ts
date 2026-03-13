import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import RegistroRow from './RegistroRow.svelte';

vi.mock('$app/forms', () => ({
	enhance: vi.fn(() => ({}))
}));

vi.mock('$app/environment', () => ({
	browser: false
}));

describe('RegistroRow', () => {
	const formatDateTime = (d: string | Date | null) =>
		d ? new Date(d).toLocaleString('es-CL') : '—';

	const baseReg = {
		id: 1,
		centroId: 1,
		centroNombre: 'Centro Calbuco',
		cicloId: 1,
		cicloNombre: 'Primavera 2025',
		tipoId: 1,
		tipoNombre: 'TALLA_LONGITUD',
		origenNombre: 'Manual / Terreno',
		valor: 42.5,
		unidad: 'mm',
		fechaMedicion: '2025-03-01T10:00:00Z',
		notas: null,
		isOwner: true
	};

	const baseData = {
		centros: [{ id: 1, nombre: 'Centro Calbuco' }],
		ciclos: [{ id: 1, nombre: 'Primavera 2025', lugarId: 1 }],
		tipos: [{ id: 1, codigo: 'TALLA_LONGITUD', unidadBase: 'mm' }],
		origenes: [{ id: 1, nombre: 'Manual / Terreno' }]
	};

	const defaultProps = {
		reg: baseReg,
		data: baseData,
		editState: {
			editingId: null,
			onEdit: vi.fn(),
			onCancel: vi.fn()
		},
		handleAction: vi.fn(),
		formatDateTime
	};

	describe('Modo visualización', () => {
		it('debería mostrar el nombre del centro', async () => {
			render(RegistroRow, defaultProps);
			await expect.element(page.getByText('Centro Calbuco')).toBeInTheDocument();
		});

		it('debería mostrar el nombre del ciclo', async () => {
			render(RegistroRow, defaultProps);
			await expect.element(page.getByText('Primavera 2025')).toBeInTheDocument();
		});

		it('debería mostrar el código del tipo', async () => {
			render(RegistroRow, defaultProps);
			await expect.element(page.getByText('TALLA_LONGITUD')).toBeInTheDocument();
		});

		it('debería mostrar la unidad', async () => {
			render(RegistroRow, defaultProps);
			await expect.element(page.getByText('mm')).toBeInTheDocument();
		});

		it('debería mostrar el origen', async () => {
			render(RegistroRow, defaultProps);
			await expect.element(page.getByText('Manual / Terreno')).toBeInTheDocument();
		});

		it('debería mostrar "Solo Centro" cuando no hay ciclo', async () => {
			render(RegistroRow, {
				...defaultProps,
				reg: { ...baseReg, cicloNombre: null }
			});
			await expect.element(page.getByText('Solo Centro')).toBeInTheDocument();
		});

		it('debería mostrar indicador de nota cuando hay notas', async () => {
			render(RegistroRow, {
				...defaultProps,
				reg: { ...baseReg, notas: 'Medición hecha en marea baja' }
			});
			await expect.element(page.getByText('Tiene nota')).toBeInTheDocument();
		});
	});

	describe('Permisos del propietario', () => {
		it('debería mostrar botón Editar cuando isOwner es true', async () => {
			render(RegistroRow, defaultProps);
			await expect.element(page.getByTitle('Editar registro')).toBeInTheDocument();
		});

		it('debería mostrar botón Eliminar cuando isOwner es true', async () => {
			render(RegistroRow, defaultProps);
			await expect.element(page.getByTitle('Eliminar registro')).toBeInTheDocument();
		});

		it('no debería mostrar botones de acción cuando no es owner', async () => {
			render(RegistroRow, {
				...defaultProps,
				reg: { ...baseReg, isOwner: false }
			});
			await expect.element(page.getByTitle('Editar registro')).not.toBeInTheDocument();
			await expect.element(page.getByTitle('Eliminar registro')).not.toBeInTheDocument();
		});
	});

	describe('Modo edición', () => {
		it('debería mostrar formulario de edición cuando editingId coincide', async () => {
			render(RegistroRow, {
				...defaultProps,
				editState: { ...defaultProps.editState, editingId: 1 }
			});
			await expect.element(page.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
			await expect.element(page.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
		});

		it('no debería mostrar formulario cuando editingId no coincide', async () => {
			render(RegistroRow, {
				...defaultProps,
				editState: { ...defaultProps.editState, editingId: 99 }
			});
			await expect.element(page.getByRole('button', { name: 'Guardar' })).not.toBeInTheDocument();
		});
	});
});
