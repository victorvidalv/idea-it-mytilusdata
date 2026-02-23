import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SearchableSelect from './SearchableSelect.svelte';

describe('SearchableSelect', () => {
	const mockOptions = [
		{ value: 1, label: 'Centro Norte' },
		{ value: 2, label: 'Centro Sur' },
		{ value: 3, label: 'Centro Este' },
		{ value: 4, label: 'Centro Oeste' }
	];

	describe('Renderizado básico', () => {
		it('debería renderizar el botón del select', async () => {
			render(SearchableSelect, {
				options: mockOptions
			});

			const button = page.getByRole('button', { name: 'Seleccionar...' });
			await expect.element(button).toBeInTheDocument();
		});

		it('debería mostrar el placeholder por defecto', async () => {
			render(SearchableSelect, {
				options: mockOptions
			});

			await expect.element(page.getByText('Seleccionar...')).toBeInTheDocument();
		});

		it('debería aceptar un placeholder personalizado', async () => {
			render(SearchableSelect, {
				options: mockOptions,
				placeholder: 'Elige un centro...'
			});

			await expect.element(page.getByText('Elige un centro...')).toBeInTheDocument();
		});

		it('debería mostrar la opción seleccionada', async () => {
			render(SearchableSelect, {
				options: mockOptions,
				value: 1
			});

			await expect.element(page.getByText('Centro Norte')).toBeInTheDocument();
		});
	});

	describe('Apertura y cierre del dropdown', () => {
		it('debería abrir el dropdown al hacer clic', async () => {
			render(SearchableSelect, {
				options: mockOptions
			});

			const button = page.getByRole('button', { name: 'Seleccionar...' });
			await button.click();

			// Verificar que el dropdown está visible
			await expect.element(page.getByPlaceholder('Buscar...')).toBeInTheDocument();
		});
	});

	describe('Funcionalidad de búsqueda', () => {
		it('debería filtrar opciones al escribir', async () => {
			render(SearchableSelect, {
				options: mockOptions
			});

			const button = page.getByRole('button', { name: 'Seleccionar...' });
			await button.click();

			const searchInput = page.getByPlaceholder('Buscar...');
			await searchInput.fill('Norte');

			// Solo debería mostrar "Centro Norte"
			await expect.element(page.getByRole('list').getByText('Centro Norte')).toBeInTheDocument();
		});

		it('debería mostrar mensaje cuando no hay resultados', async () => {
			render(SearchableSelect, {
				options: mockOptions
			});

			const button = page.getByRole('button', { name: 'Seleccionar...' });
			await button.click();

			const searchInput = page.getByPlaceholder('Buscar...');
			await searchInput.fill('NoExiste');

			await expect.element(page.getByText('No hay resultados')).toBeInTheDocument();
		});
	});

	describe('Selección de opciones', () => {
		it('debería seleccionar una opción al hacer clic', async () => {
			render(SearchableSelect, {
				options: mockOptions
			});

			const button = page.getByRole('button', { name: 'Seleccionar...' });
			await button.click();

			// Seleccionar "Centro Sur" usando el texto dentro del dropdown
			await page.getByRole('list').getByText('Centro Sur').click();

			// Verificar que la opción está seleccionada (mostrada en el botón)
			await expect.element(page.getByRole('button', { name: 'Centro Sur' })).toBeInTheDocument();
		});
	});

	describe('Estado deshabilitado', () => {
		it('debería estar deshabilitado cuando disabled es true', async () => {
			render(SearchableSelect, {
				options: mockOptions,
				disabled: true
			});

			const button = page.getByRole('button', { name: 'Seleccionar...' });
			await expect.element(button).toBeDisabled();
		});
	});

	describe('Valores string y number', () => {
		it('debería manejar valores string', async () => {
			const stringOptions = [
				{ value: 'a', label: 'Opción A' },
				{ value: 'b', label: 'Opción B' }
			];

			render(SearchableSelect, {
				options: stringOptions,
				value: 'a'
			});

			await expect.element(page.getByText('Opción A')).toBeInTheDocument();
		});

		it('debería manejar valores number', async () => {
			render(SearchableSelect, {
				options: mockOptions,
				value: 1
			});

			await expect.element(page.getByText('Centro Norte')).toBeInTheDocument();
		});

		it('debería manejar valor null', async () => {
			render(SearchableSelect, {
				options: mockOptions,
				value: null
			});

			// Debería mostrar el placeholder
			await expect.element(page.getByText('Seleccionar...')).toBeInTheDocument();
		});
	});

	describe('Accesibilidad', () => {
		it('debería tener el rol de botón', async () => {
			render(SearchableSelect, {
				options: mockOptions
			});

			await expect.element(page.getByRole('button')).toBeInTheDocument();
		});
	});

	describe('Búsqueda case-insensitive', () => {
		it('debería encontrar opciones sin importar mayúsculas/minúsculas', async () => {
			render(SearchableSelect, {
				options: mockOptions
			});

			const button = page.getByRole('button', { name: 'Seleccionar...' });
			await button.click();

			const searchInput = page.getByPlaceholder('Buscar...');
			await searchInput.fill('norte'); // minúsculas

			// Debería encontrar "Centro Norte"
			await expect.element(page.getByRole('list').getByText('Centro Norte')).toBeInTheDocument();
		});

		it('debería encontrar opciones con búsqueda parcial', async () => {
			render(SearchableSelect, {
				options: mockOptions
			});

			const button = page.getByRole('button', { name: 'Seleccionar...' });
			await button.click();

			const searchInput = page.getByPlaceholder('Buscar...');
			await searchInput.fill('Centro');

			// Debería mostrar todas las opciones que contienen "Centro"
			await expect.element(page.getByRole('list').getByText('Centro Norte')).toBeInTheDocument();
			await expect.element(page.getByRole('list').getByText('Centro Sur')).toBeInTheDocument();
		});
	});
});
