import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CentroCreateForm from './CentroCreateForm.svelte';

// Mock de los módulos de SvelteKit
vi.mock('$app/forms', () => ({
	enhance: vi.fn(() => ({}))
}));

vi.mock('$app/environment', () => ({
	browser: false
}));

describe('CentroCreateForm', () => {
	const mockOnCancel = vi.fn();
	const mockOnSuccess = vi.fn();
	const mockOnError = vi.fn();

	describe('Renderizado básico', () => {
		it('debería renderizar el formulario con todos los campos', async () => {
			render(CentroCreateForm, {
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess,
				onError: mockOnError
			});

			// Verificar que los campos están presentes usando placeholders
			await expect.element(page.getByPlaceholder('Ej: Centro Calbuco Norte')).toBeInTheDocument();
			await expect.element(page.getByPlaceholder('-41.4689')).toBeInTheDocument();
			await expect.element(page.getByPlaceholder('-72.9411')).toBeInTheDocument();
		});

		it('debería renderizar los botones de acción', async () => {
			render(CentroCreateForm, {
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess,
				onError: mockOnError
			});

			await expect.element(page.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
			await expect.element(page.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
		});

		it('debería mostrar el botón para seleccionar desde mapa', async () => {
			render(CentroCreateForm, {
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess,
				onError: mockOnError
			});

			await expect.element(page.getByText('Seleccionar desde mapa')).toBeInTheDocument();
		});
	});

	describe('Campo Nombre', () => {
		it('debería permitir escribir en el campo nombre', async () => {
			render(CentroCreateForm, {
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess,
				onError: mockOnError
			});

			const nombreInput = page.getByPlaceholder('Ej: Centro Calbuco Norte');
			await nombreInput.fill('Centro Nuevo');

			await expect.element(nombreInput).toHaveValue('Centro Nuevo');
		});

		it('debería ser requerido', async () => {
			render(CentroCreateForm, {
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess,
				onError: mockOnError
			});

			const nombreInput = page.getByPlaceholder('Ej: Centro Calbuco Norte');
			await expect.element(nombreInput).toHaveAttribute('required');
		});
	});

	describe('Campos de coordenadas', () => {
		it('debería permitir escribir latitud', async () => {
			render(CentroCreateForm, {
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess,
				onError: mockOnError
			});

			const latInput = page.getByPlaceholder('-41.4689');
			await latInput.fill('-41.4689');

			await expect.element(latInput).toHaveValue('-41.4689');
		});

		it('debería permitir escribir longitud', async () => {
			render(CentroCreateForm, {
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess,
				onError: mockOnError
			});

			const lngInput = page.getByPlaceholder('-72.9411');
			await lngInput.fill('-72.9411');

			await expect.element(lngInput).toHaveValue('-72.9411');
		});
	});

	describe('Botón Cancelar', () => {
		it('debería llamar onCancel al hacer clic', async () => {
			render(CentroCreateForm, {
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess,
				onError: mockOnError
			});

			const cancelButton = page.getByRole('button', { name: 'Cancelar' });
			await cancelButton.click();

			expect(mockOnCancel).toHaveBeenCalledTimes(1);
		});
	});

	describe('Botón Guardar', () => {
		it('debería estar deshabilitado cuando el nombre está vacío', async () => {
			render(CentroCreateForm, {
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess,
				onError: mockOnError
			});

			const submitButton = page.getByRole('button', { name: 'Guardar' });
			await expect.element(submitButton).toBeDisabled();
		});

		it('debería habilitarse cuando el nombre tiene contenido', async () => {
			render(CentroCreateForm, {
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess,
				onError: mockOnError
			});

			const nombreInput = page.getByPlaceholder('Ej: Centro Calbuco Norte');
			await nombreInput.fill('Centro Nuevo');

			const submitButton = page.getByRole('button', { name: 'Guardar' });
			await expect.element(submitButton).not.toBeDisabled();
		});

		it('debería estar deshabilitado cuando el nombre solo tiene espacios', async () => {
			render(CentroCreateForm, {
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess,
				onError: mockOnError
			});

			const nombreInput = page.getByPlaceholder('Ej: Centro Calbuco Norte');
			await nombreInput.fill('   ');

			const submitButton = page.getByRole('button', { name: 'Guardar' });
			await expect.element(submitButton).toBeDisabled();
		});
	});

	describe('Toggle del mapa', () => {
		it('debería mostrar "Ocultar mapa" después de hacer clic', async () => {
			render(CentroCreateForm, {
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess,
				onError: mockOnError
			});

			const mapButton = page.getByText('Seleccionar desde mapa');
			await mapButton.click();

			await expect.element(page.getByText('Ocultar mapa')).toBeInTheDocument();
		});

		it('debería alternar entre mostrar y ocultar mapa', async () => {
			render(CentroCreateForm, {
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess,
				onError: mockOnError
			});

			const mapButton = page.getByText('Seleccionar desde mapa');
			await mapButton.click();

			await expect.element(page.getByText('Ocultar mapa')).toBeInTheDocument();

			const hideButton = page.getByText('Ocultar mapa');
			await hideButton.click();

			await expect.element(page.getByText('Seleccionar desde mapa')).toBeInTheDocument();
		});
	});

	describe('Estructura del formulario', () => {
		it('debería tener los names correctos para los inputs', async () => {
			render(CentroCreateForm, {
				onCancel: mockOnCancel,
				onSuccess: mockOnSuccess,
				onError: mockOnError
			});

			const nombreInput = page.getByPlaceholder('Ej: Centro Calbuco Norte');
			const latInput = page.getByPlaceholder('-41.4689');
			const lngInput = page.getByPlaceholder('-72.9411');

			await expect.element(nombreInput).toHaveAttribute('name', 'nombre');
			await expect.element(latInput).toHaveAttribute('name', 'latitud');
			await expect.element(lngInput).toHaveAttribute('name', 'longitud');
		});
	});
});
