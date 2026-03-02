import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CicloCreateForm from './CicloCreateForm.svelte';

vi.mock('$app/forms', () => ({
	enhance: vi.fn(() => ({}))
}));

vi.mock('$app/environment', () => ({
	browser: false
}));

describe('CicloCreateForm', () => {
	const defaultProps = {
		data: {
			centros: [
				{ id: 1, nombre: 'Centro Norte' },
				{ id: 2, nombre: 'Centro Sur' }
			]
		},
		onCancel: vi.fn()
	};

	describe('Renderizado básico', () => {
		it('debería renderizar el título del formulario', async () => {
			render(CicloCreateForm, defaultProps);
			await expect.element(page.getByText('Iniciar Ciclo Productivo')).toBeInTheDocument();
		});

		it('debería renderizar la descripción', async () => {
			render(CicloCreateForm, defaultProps);
			await expect.element(page.getByText('Vincule un nuevo ciclo a un centro de cultivo existente')).toBeInTheDocument();
		});

		it('debería renderizar el campo de nombre', async () => {
			render(CicloCreateForm, defaultProps);
			await expect.element(page.getByPlaceholder('Ej: Siembra Primavera 2025')).toBeInTheDocument();
		});

		it('debería renderizar el campo de fecha', async () => {
			render(CicloCreateForm, defaultProps);
			const dateInput = page.getByRole('textbox', { name: /fecha/i }).or(page.getByLabelText(/Fecha de Siembra/i));
			await expect.element(dateInput).toBeInTheDocument();
		});
	});

	describe('Campo Nombre', () => {
		it('debería ser requerido', async () => {
			render(CicloCreateForm, defaultProps);
			const input = page.getByPlaceholder('Ej: Siembra Primavera 2025');
			await expect.element(input).toHaveAttribute('required');
		});

		it('debería tener name="nombre"', async () => {
			render(CicloCreateForm, defaultProps);
			const input = page.getByPlaceholder('Ej: Siembra Primavera 2025');
			await expect.element(input).toHaveAttribute('name', 'nombre');
		});

		it('debería permitir escribir texto', async () => {
			render(CicloCreateForm, defaultProps);
			const input = page.getByPlaceholder('Ej: Siembra Primavera 2025');
			await input.fill('Ciclo Primavera');
			await expect.element(input).toHaveValue('Ciclo Primavera');
		});
	});

	describe('Botones', () => {
		it('debería renderizar botón Cancelar', async () => {
			render(CicloCreateForm, defaultProps);
			await expect.element(page.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
		});

		it('debería renderizar botón Iniciar Ciclo', async () => {
			render(CicloCreateForm, defaultProps);
			await expect.element(page.getByRole('button', { name: /Iniciar Ciclo/i })).toBeInTheDocument();
		});

		it('debería llamar onCancel al hacer clic en Cancelar', async () => {
			const onCancel = vi.fn();
			render(CicloCreateForm, { ...defaultProps, onCancel });

			await page.getByRole('button', { name: 'Cancelar' }).click();
			expect(onCancel).toHaveBeenCalledTimes(1);
		});
	});

	describe('Formulario', () => {
		it('debería tener action="?/create" y método POST', async () => {
			const { container } = render(CicloCreateForm, defaultProps);
			const form = container.querySelector('form');
			expect(form).not.toBeNull();
			expect(form?.getAttribute('action')).toBe('?/create');
			expect(form?.getAttribute('method')).toBe('POST');
		});
	});
});
