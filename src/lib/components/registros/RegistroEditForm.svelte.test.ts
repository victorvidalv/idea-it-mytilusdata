import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import RegistroEditForm from './RegistroEditForm.svelte';

// Mock de los módulos de SvelteKit
vi.mock('$app/forms', () => ({
	enhance: vi.fn(() => ({}))
}));

describe('RegistroEditForm', () => {
	const mockReg = {
		id: 1,
		centroId: 1,
		cicloId: 1,
		tipoId: 1,
		origenNombre: 'Manual',
		valor: 25.5,
		fechaMedicion: '2024-01-15T10:30',
		notas: 'Nota de prueba'
	};

	const mockData = {
		centros: [
			{ id: 1, nombre: 'Centro Norte' },
			{ id: 2, nombre: 'Centro Sur' }
		],
		ciclos: [
			{ id: 1, nombre: 'Ciclo 2024', lugarId: 1 },
			{ id: 2, nombre: 'Ciclo 2023', lugarId: 2 }
		],
		tipos: [
			{ id: 1, codigo: 'TALLA', unidadBase: 'cm' },
			{ id: 2, codigo: 'TEMPERATURA', unidadBase: '°C' }
		],
		origenes: [
			{ id: 1, nombre: 'Manual' },
			{ id: 2, nombre: 'Automático' }
		]
	};

	const mockOnCancel = vi.fn();
	const mockHandleAction = vi.fn();

	describe('Renderizado básico', () => {
		it('debería renderizar el formulario con los datos del registro', async () => {
			render(RegistroEditForm, {
				reg: mockReg,
				data: mockData,
				onCancel: mockOnCancel,
				handleAction: mockHandleAction
			});

			// Verificar que los botones están presentes
			await expect.element(page.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
			await expect.element(page.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
		});
	});

	describe('Inicialización de valores', () => {
		it('debería inicializar el campo centro con el valor del registro', async () => {
			render(RegistroEditForm, {
				reg: mockReg,
				data: mockData,
				onCancel: mockOnCancel,
				handleAction: mockHandleAction
			});

			// Verificar que el centro está seleccionado
			await expect.element(page.getByText('Centro Norte')).toBeInTheDocument();
		});

		it('debería inicializar el campo tipo con el valor del registro', async () => {
			render(RegistroEditForm, {
				reg: mockReg,
				data: mockData,
				onCancel: mockOnCancel,
				handleAction: mockHandleAction
			});

			// Verificar que el tipo está seleccionado (muestra código y unidad)
			await expect.element(page.getByText(/TALLA/)).toBeInTheDocument();
		});

		it('debería inicializar el campo valor con el valor del registro', async () => {
			render(RegistroEditForm, {
				reg: mockReg,
				data: mockData,
				onCancel: mockOnCancel,
				handleAction: mockHandleAction
			});

			const valorInput = page.getByRole('spinbutton');
			await expect.element(valorInput).toHaveValue(25.5);
		});

		it('debería inicializar el campo origen con el valor del registro', async () => {
			render(RegistroEditForm, {
				reg: mockReg,
				data: mockData,
				onCancel: mockOnCancel,
				handleAction: mockHandleAction
			});

			await expect.element(page.getByText('Manual')).toBeInTheDocument();
		});

		it('debería manejar registro sin centroId', async () => {
			const regWithoutCentro = { ...mockReg, centroId: null };
			
			render(RegistroEditForm, {
				reg: regWithoutCentro,
				data: mockData,
				onCancel: mockOnCancel,
				handleAction: mockHandleAction
			});

			await expect.element(page.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
		});

		it('debería manejar registro sin cicloId', async () => {
			const regWithoutCiclo = { ...mockReg, cicloId: null };
			
			render(RegistroEditForm, {
				reg: regWithoutCiclo,
				data: mockData,
				onCancel: mockOnCancel,
				handleAction: mockHandleAction
			});

			await expect.element(page.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
		});

		it('debería manejar registro sin notas', async () => {
			const regWithoutNotas = { ...mockReg, notas: null };
			
			render(RegistroEditForm, {
				reg: regWithoutNotas,
				data: mockData,
				onCancel: mockOnCancel,
				handleAction: mockHandleAction
			});

			await expect.element(page.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
		});
	});

	describe('Unidad dinámica', () => {
		it('debería mostrar la unidad del tipo seleccionado', async () => {
			render(RegistroEditForm, {
				reg: mockReg,
				data: mockData,
				onCancel: mockOnCancel,
				handleAction: mockHandleAction
			});

			// El label de valor debería mostrar la unidad (cm)
			await expect.element(page.getByText(/Valor.*\(cm\)/)).toBeInTheDocument();
		});

		it('debería mostrar TEMPERATURA con °C', async () => {
			const regWithTemp = { ...mockReg, tipoId: 2 };
			
			render(RegistroEditForm, {
				reg: regWithTemp,
				data: mockData,
				onCancel: mockOnCancel,
				handleAction: mockHandleAction
			});

			await expect.element(page.getByText(/TEMPERATURA/)).toBeInTheDocument();
		});
	});

	describe('Filtro de ciclos por centro', () => {
		it('debería mostrar solo los ciclos del centro seleccionado', async () => {
			render(RegistroEditForm, {
				reg: mockReg,
				data: mockData,
				onCancel: mockOnCancel,
				handleAction: mockHandleAction
			});

			// El ciclo del centro 1 debería estar disponible
			await expect.element(page.getByText('Ciclo 2024')).toBeInTheDocument();
		});
	});

	describe('Botón Cancelar', () => {
		it('debería llamar onCancel al hacer clic', async () => {
			render(RegistroEditForm, {
				reg: mockReg,
				data: mockData,
				onCancel: mockOnCancel,
				handleAction: mockHandleAction
			});

			const cancelButton = page.getByRole('button', { name: 'Cancelar' });
			await cancelButton.click();

			expect(mockOnCancel).toHaveBeenCalledTimes(1);
		});
	});

	describe('Campos requeridos', () => {
		it('debería marcar Centro como requerido', async () => {
			render(RegistroEditForm, {
				reg: mockReg,
				data: mockData,
				onCancel: mockOnCancel,
				handleAction: mockHandleAction
			});

			await expect.element(page.getByText('Centro *')).toBeInTheDocument();
		});

		it('debería marcar Tipo como requerido', async () => {
			render(RegistroEditForm, {
				reg: mockReg,
				data: mockData,
				onCancel: mockOnCancel,
				handleAction: mockHandleAction
			});

			await expect.element(page.getByText('Tipo *')).toBeInTheDocument();
		});

		it('debería marcar Origen como requerido', async () => {
			render(RegistroEditForm, {
				reg: mockReg,
				data: mockData,
				onCancel: mockOnCancel,
				handleAction: mockHandleAction
			});

			await expect.element(page.getByText('Origen *')).toBeInTheDocument();
		});

		it('debería marcar Fecha como requerido', async () => {
			render(RegistroEditForm, {
				reg: mockReg,
				data: mockData,
				onCancel: mockOnCancel,
				handleAction: mockHandleAction
			});

			await expect.element(page.getByText('Fecha *')).toBeInTheDocument();
		});
	});

	describe('Campos del formulario', () => {
		it('debería tener campo de notas', async () => {
			render(RegistroEditForm, {
				reg: mockReg,
				data: mockData,
				onCancel: mockOnCancel,
				handleAction: mockHandleAction
			});

			await expect.element(page.getByText('Notas')).toBeInTheDocument();
		});

		it('debería tener campo de valor numérico', async () => {
			render(RegistroEditForm, {
				reg: mockReg,
				data: mockData,
				onCancel: mockOnCancel,
				handleAction: mockHandleAction
			});

			const valorInput = page.getByRole('spinbutton');
			await expect.element(valorInput).toBeInTheDocument();
		});
	});
});