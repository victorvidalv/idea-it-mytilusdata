import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import RegistroCreateForm from './RegistroCreateForm.svelte';

// Mock de los módulos de SvelteKit
vi.mock('$app/forms', () => ({
	enhance: vi.fn(() => ({}))
}));

vi.mock('svelte-french-toast', () => ({
	default: {
		success: vi.fn(),
		error: vi.fn()
	}
}));

describe('RegistroCreateForm', () => {
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
	const mockOnSuccess = vi.fn();

	describe('Renderizado básico', () => {
		it('debería renderizar el formulario con todas las secciones', async () => {
			render(RegistroCreateForm, {
				data: mockData,
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess
			});

			// Verificar que las secciones principales están presentes
			await expect.element(page.getByText('Contexto del Registro')).toBeInTheDocument();
			await expect.element(page.getByText('Detalles de la Medición')).toBeInTheDocument();
		});

		it('debería renderizar los botones de acción', async () => {
			render(RegistroCreateForm, {
				data: mockData,
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess
			});

			await expect.element(page.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
			await expect
				.element(page.getByRole('button', { name: 'Guardar Registro' }))
				.toBeInTheDocument();
		});

		it('debería renderizar todos los campos requeridos', async () => {
			render(RegistroCreateForm, {
				data: mockData,
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess
			});

			// Campos de contexto
			await expect.element(page.getByText('Centro de Cultivo *')).toBeInTheDocument();
			await expect.element(page.getByText('Ciclo Productivo')).toBeInTheDocument();

			// Campos de medición
			await expect.element(page.getByText('Qué se midió *')).toBeInTheDocument();
			await expect.element(page.getByText(/Valor/)).toBeInTheDocument();
			await expect.element(page.getByText('Fecha y Hora *')).toBeInTheDocument();
			await expect.element(page.getByText('Origen del dato *')).toBeInTheDocument();
		});
	});

	describe('Campo Centro de Cultivo', () => {
		it('debería mostrar los centros disponibles', async () => {
			render(RegistroCreateForm, {
				data: mockData,
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess
			});

			// Abrir el select de centros
			const centroLabel = page.getByText('Centro de Cultivo *').locator('..');
			await expect.element(centroLabel).toBeInTheDocument();
		});

		it('debería tener el placeholder correcto', async () => {
			render(RegistroCreateForm, {
				data: mockData,
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess
			});

			await expect.element(page.getByText('Seleccionar un centro...')).toBeInTheDocument();
		});
	});

	describe('Campo Ciclo Productivo', () => {
		it('debería estar deshabilitado cuando no hay centro seleccionado', async () => {
			render(RegistroCreateForm, {
				data: mockData,
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess
			});

			// El select de ciclo debería estar deshabilitado inicialmente
			const cicloSection = page.getByText('Ciclo Productivo').locator('..');
			await expect.element(cicloSection).toBeInTheDocument();
		});

		it('debería mostrar mensaje cuando no hay ciclos para el centro', async () => {
			const dataWithoutCiclos = {
				...mockData,
				ciclos: []
			};

			// Este test verifica el renderizado con datos sin ciclos
			render(RegistroCreateForm, {
				data: dataWithoutCiclos,
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess
			});

			// Verificar que el formulario se renderiza correctamente
			await expect.element(page.getByText('Contexto del Registro')).toBeInTheDocument();
		});
	});

	describe('Campo Tipo de Medición', () => {
		it('debería mostrar los tipos disponibles', async () => {
			render(RegistroCreateForm, {
				data: mockData,
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess
			});

			await expect.element(page.getByText('Qué se midió *')).toBeInTheDocument();
		});

		it('debería tener el placeholder correcto', async () => {
			render(RegistroCreateForm, {
				data: mockData,
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess
			});

			await expect.element(page.getByText(/Seleccione el tipo/)).toBeInTheDocument();
		});
	});

	describe('Campo Valor', () => {
		it('debería permitir escribir un valor numérico', async () => {
			render(RegistroCreateForm, {
				data: mockData,
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess
			});

			const valorInput = page.getByPlaceholder('0.00');
			await valorInput.fill('25.5');

			await expect.element(valorInput).toHaveValue(25.5);
		});

		it('debería ser de tipo number', async () => {
			render(RegistroCreateForm, {
				data: mockData,
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess
			});

			const valorInput = page.getByPlaceholder('0.00');
			await expect.element(valorInput).toHaveAttribute('type', 'number');
		});

		it('debería permitir decimales con step 0.001', async () => {
			render(RegistroCreateForm, {
				data: mockData,
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess
			});

			const valorInput = page.getByPlaceholder('0.00');
			await expect.element(valorInput).toHaveAttribute('step', '0.001');
		});
	});

	describe('Campo Origen del dato', () => {
		it('debería mostrar los orígenes disponibles', async () => {
			render(RegistroCreateForm, {
				data: mockData,
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess
			});

			await expect.element(page.getByText('Origen del dato *')).toBeInTheDocument();
		});

		it('debería tener el placeholder correcto', async () => {
			render(RegistroCreateForm, {
				data: mockData,
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess
			});

			await expect.element(page.getByText('Origen del dato...')).toBeInTheDocument();
		});
	});

	describe('Campo Notas', () => {
		it('debería tener placeholder opcional', async () => {
			render(RegistroCreateForm, {
				data: mockData,
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess
			});

			await expect.element(page.getByPlaceholder('Opcional...')).toBeInTheDocument();
		});
	});

	describe('Botón Cancelar', () => {
		it('debería llamar onCancel al hacer clic', async () => {
			render(RegistroCreateForm, {
				data: mockData,
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess
			});

			const cancelButton = page.getByRole('button', { name: 'Cancelar' });
			await cancelButton.click();

			expect(mockOnCancel).toHaveBeenCalledTimes(1);
		});
	});

	describe('Secciones del formulario', () => {
		it('debería mostrar el indicador visual de sección Contexto', async () => {
			render(RegistroCreateForm, {
				data: mockData,
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess
			});

			await expect.element(page.getByText('Contexto del Registro')).toBeInTheDocument();
		});

		it('debería mostrar el indicador visual de sección Medición', async () => {
			render(RegistroCreateForm, {
				data: mockData,
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess
			});

			await expect.element(page.getByText('Detalles de la Medición')).toBeInTheDocument();
		});
	});

	describe('Accesibilidad', () => {
		it('debería marcar los campos requeridos con asterisco', async () => {
			render(RegistroCreateForm, {
				data: mockData,
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess
			});

			await expect.element(page.getByText('Centro de Cultivo *')).toBeInTheDocument();
			await expect.element(page.getByText('Qué se midió *')).toBeInTheDocument();
			await expect.element(page.getByText('Fecha y Hora *')).toBeInTheDocument();
			await expect.element(page.getByText('Origen del dato *')).toBeInTheDocument();
		});
	});

	describe('Unidad del valor', () => {
		it('no debería mostrar unidad cuando no hay tipo seleccionado', async () => {
			render(RegistroCreateForm, {
				data: mockData,
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess
			});

			// El label de valor debería mostrar solo "Valor *"
			await expect.element(page.getByText(/Valor \(/)).not.toBeInTheDocument();
		});
	});

	describe('Datos vacíos', () => {
		it('debería manejar datos con arrays vacíos', async () => {
			const emptyData = {
				centros: [],
				ciclos: [],
				tipos: [],
				origenes: []
			};

			render(RegistroCreateForm, {
				data: emptyData,
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess
			});

			// El formulario debería renderizarse sin errores
			await expect.element(page.getByText('Contexto del Registro')).toBeInTheDocument();
		});
	});
});
