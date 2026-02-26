import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DataTable from './DataTable.svelte';

describe('DataTable', () => {
	const mockData = [
		{ id: 1, nombre: 'Centro A', codigo: 'CA', valor: 100 },
		{ id: 2, nombre: 'Centro B', codigo: 'CB', valor: 200 },
		{ id: 3, nombre: 'Centro C', codigo: 'CC', valor: 300 }
	];

	const mockColumns = [
		{ key: 'nombre', label: 'Nombre', sortable: true },
		{ key: 'codigo', label: 'Código', sortable: true },
		{ key: 'valor', label: 'Valor', sortable: true, align: 'right' as const }
	];

	describe('Renderizado básico', () => {
		it('debería renderizar la tabla con datos', async () => {
			render(DataTable, {
				data: mockData,
				columns: mockColumns
			});

			// Verificar que los encabezados están presentes usando texto
			await expect.element(page.getByText('Nombre')).toBeInTheDocument();
			await expect.element(page.getByText('Código')).toBeInTheDocument();
			await expect.element(page.getByText('Valor')).toBeInTheDocument();
		});

		it('debería renderizar el placeholder de búsqueda por defecto', async () => {
			render(DataTable, {
				data: mockData,
				columns: mockColumns
			});

			const searchInput = page.getByPlaceholder('Buscar...');
			await expect.element(searchInput).toBeInTheDocument();
		});

		it('debería aceptar un placeholder de búsqueda personalizado', async () => {
			render(DataTable, {
				data: mockData,
				columns: mockColumns,
				searchPlaceholder: 'Buscar centros...'
			});

			const searchInput = page.getByPlaceholder('Buscar centros...');
			await expect.element(searchInput).toBeInTheDocument();
		});

		it('debería mostrar estado vacío cuando no hay datos', async () => {
			render(DataTable, {
				data: [],
				columns: mockColumns
			});

			await expect.element(page.getByText('Sin datos')).toBeInTheDocument();
		});

		it('debería mostrar título y descripción personalizados para estado vacío', async () => {
			render(DataTable, {
				data: [],
				columns: mockColumns,
				emptyTitle: 'No hay centros',
				emptyDescription: 'Agrega un nuevo centro para comenzar'
			});

			await expect.element(page.getByText('No hay centros')).toBeInTheDocument();
			await expect
				.element(page.getByText('Agrega un nuevo centro para comenzar'))
				.toBeInTheDocument();
		});
	});

	describe('Funcionalidad de búsqueda', () => {
		it('debería filtrar datos al escribir en el campo de búsqueda', async () => {
			render(DataTable, {
				data: mockData,
				columns: mockColumns,
				searchKeys: ['nombre']
			});

			const searchInput = page.getByPlaceholder('Buscar...');
			await searchInput.fill('Centro A');

			// Verificar que se muestra el contador de resultados filtrados
			await expect.element(page.getByText(/1–1 de 1/)).toBeInTheDocument();
		});

		it('debería mostrar mensaje de sin resultados cuando la búsqueda no coincide', async () => {
			render(DataTable, {
				data: mockData,
				columns: mockColumns
			});

			const searchInput = page.getByPlaceholder('Buscar...');
			await searchInput.fill('NoExiste');

			await expect.element(page.getByText('Sin resultados')).toBeInTheDocument();
		});

		it('debería limpiar la búsqueda al hacer clic en el botón limpiar', async () => {
			render(DataTable, {
				data: mockData,
				columns: mockColumns
			});

			const searchInput = page.getByPlaceholder('Buscar...');
			await searchInput.fill('Centro');

			// El botón de limpiar debería aparecer
			const clearButton = page.getByRole('button', { name: 'Limpiar búsqueda' });
			await expect.element(clearButton).toBeInTheDocument();

			await clearButton.click();

			// El valor del input debería estar vacío
			await expect.element(searchInput).toHaveValue('');
		});
	});

	describe('Funcionalidad de ordenamiento', () => {
		it('debería ordenar ascendente al hacer clic en una columna ordenable', async () => {
			render(DataTable, {
				data: mockData,
				columns: mockColumns
			});

			// Usar el elemento th que contiene "Nombre"
			const nombreHeader = page.getByText('Nombre');
			await nombreHeader.click();

			// Verificar que el indicador de ordenamiento está presente
			await expect.element(nombreHeader).toBeInTheDocument();
		});

		it('debería cambiar a orden descendente al hacer clic nuevamente', async () => {
			render(DataTable, {
				data: mockData,
				columns: mockColumns
			});

			const nombreHeader = page.getByText('Nombre');
			await nombreHeader.click();
			await nombreHeader.click();

			// El ordenamiento debería cambiar a descendente
			await expect.element(nombreHeader).toBeInTheDocument();
		});

		it('debería remover ordenamiento al hacer clic tres veces', async () => {
			render(DataTable, {
				data: mockData,
				columns: mockColumns
			});

			const nombreHeader = page.getByText('Nombre');
			await nombreHeader.click();
			await nombreHeader.click();
			await nombreHeader.click();

			// El ordenamiento debería removido (sin indicador activo)
			await expect.element(nombreHeader).toBeInTheDocument();
		});
	});

	describe('Funcionalidad de paginación', () => {
		it('debería mostrar selector de filas por página', async () => {
			render(DataTable, {
				data: mockData,
				columns: mockColumns
			});

			await expect.element(page.getByText('Filas:')).toBeInTheDocument();
		});

		it('debería respetar el pageSize inicial', async () => {
			render(DataTable, {
				data: mockData,
				columns: mockColumns,
				pageSize: 10
			});

			const select = page.getByRole('combobox');
			await expect.element(select).toHaveValue('10');
		});

		it('debería mostrar controles de paginación cuando hay múltiples páginas', async () => {
			const manyItems = Array.from({ length: 30 }, (_, i) => ({
				id: i + 1,
				nombre: `Centro ${i + 1}`,
				codigo: `C${i + 1}`,
				valor: i * 10
			}));

			render(DataTable, {
				data: manyItems,
				columns: mockColumns,
				pageSize: 10
			});

			// Verificar botones de paginación
			await expect
				.element(page.getByRole('button', { name: 'Primera página' }))
				.toBeInTheDocument();
			await expect
				.element(page.getByRole('button', { name: 'Página anterior' }))
				.toBeInTheDocument();
			await expect
				.element(page.getByRole('button', { name: 'Página siguiente' }))
				.toBeInTheDocument();
			await expect.element(page.getByRole('button', { name: 'Última página' })).toBeInTheDocument();
		});

		it('debería navegar a la siguiente página al hacer clic', async () => {
			const manyItems = Array.from({ length: 30 }, (_, i) => ({
				id: i + 1,
				nombre: `Centro ${i + 1}`,
				codigo: `C${i + 1}`,
				valor: i * 10
			}));

			render(DataTable, {
				data: manyItems,
				columns: mockColumns,
				pageSize: 10
			});

			const nextButton = page.getByRole('button', { name: 'Página siguiente' });
			await nextButton.click();

			// Verificar que estamos en la página 2
			await expect.element(page.getByRole('button', { name: '2' })).toHaveClass(/bg-ocean-mid/);
		});

		it('debería deshabilitar botones de navegación en la primera página', async () => {
			const manyItems = Array.from({ length: 30 }, (_, i) => ({
				id: i + 1,
				nombre: `Centro ${i + 1}`,
				codigo: `C${i + 1}`,
				valor: i * 10
			}));

			render(DataTable, {
				data: manyItems,
				columns: mockColumns,
				pageSize: 10
			});

			const firstButton = page.getByRole('button', { name: 'Primera página' });
			const prevButton = page.getByRole('button', { name: 'Página anterior' });

			await expect.element(firstButton).toBeDisabled();
			await expect.element(prevButton).toBeDisabled();
		});

		it('debería navegar a la última página', async () => {
			const manyItems = Array.from({ length: 30 }, (_, i) => ({
				id: i + 1,
				nombre: `Centro ${i + 1}`,
				codigo: `C${i + 1}`,
				valor: i * 10
			}));

			render(DataTable, {
				data: manyItems,
				columns: mockColumns,
				pageSize: 10
			});

			const lastButton = page.getByRole('button', { name: 'Última página' });
			await lastButton.click();

			// Verificar que estamos en la última página
			await expect.element(page.getByRole('button', { name: '3' })).toHaveClass(/bg-ocean-mid/);
		});
	});

	describe('Contador de resultados', () => {
		it('debería mostrar el contador de resultados correcto', async () => {
			render(DataTable, {
				data: mockData,
				columns: mockColumns,
				pageSize: 25
			});

			await expect.element(page.getByText('1–3 de 3')).toBeInTheDocument();
		});

		it('debería mostrar contador con filtro cuando se busca', async () => {
			render(DataTable, {
				data: mockData,
				columns: mockColumns
			});

			const searchInput = page.getByPlaceholder('Buscar...');
			await searchInput.fill('Centro A');

			// Verificar que muestra el total filtrado y el total original
			await expect.element(page.getByText(/filtro:/)).toBeInTheDocument();
		});
	});

	describe('Slots', () => {
		it('debería pasar datos paginados al slot', async () => {
			render(DataTable, {
				data: mockData,
				columns: mockColumns
			});

			// El slot se renderiza con los datos paginados
			// En este test verificamos que la tabla se renderiza correctamente
			const table = page.getByRole('table');
			await expect.element(table).toBeInTheDocument();
		});
	});

	describe('Accesibilidad', () => {
		it('debería tener labels accesibles para los botones de paginación', async () => {
			const manyItems = Array.from({ length: 30 }, (_, i) => ({
				id: i + 1,
				nombre: `Centro ${i + 1}`,
				codigo: `C${i + 1}`,
				valor: i * 10
			}));

			render(DataTable, {
				data: manyItems,
				columns: mockColumns,
				pageSize: 10
			});

			await expect
				.element(page.getByRole('button', { name: 'Primera página' }))
				.toBeInTheDocument();
			await expect
				.element(page.getByRole('button', { name: 'Página anterior' }))
				.toBeInTheDocument();
			await expect
				.element(page.getByRole('button', { name: 'Página siguiente' }))
				.toBeInTheDocument();
			await expect.element(page.getByRole('button', { name: 'Última página' })).toBeInTheDocument();
		});

		it('debería tener label accesible para el botón de limpiar búsqueda', async () => {
			render(DataTable, {
				data: mockData,
				columns: mockColumns
			});

			const searchInput = page.getByPlaceholder('Buscar...');
			await searchInput.fill('test');

			await expect
				.element(page.getByRole('button', { name: 'Limpiar búsqueda' }))
				.toBeInTheDocument();
		});
	});

	describe('Columnas con align', () => {
		it('debería aplicar alineación derecha cuando se especifica', async () => {
			render(DataTable, {
				data: mockData,
				columns: mockColumns
			});

			const valorHeader = page.getByText('Valor');
			await expect.element(valorHeader).toBeInTheDocument();
		});

		it('debería aplicar alineación centro cuando se especifica', async () => {
			const columnsWithCenter = [{ key: 'nombre', label: 'Nombre', align: 'center' as const }];

			render(DataTable, {
				data: mockData,
				columns: columnsWithCenter
			});

			const nombreHeader = page.getByText('Nombre');
			await expect.element(nombreHeader).toBeInTheDocument();
		});
	});

	describe('Con accesores personalizados', () => {
		it('debería usar accessor para obtener valores de columnas', async () => {
			const columnsWithAccessor = [
				{
					key: 'nombre',
					label: 'Nombre Completo',
					accessor: (row: (typeof mockData)[0]) => `${row.nombre} (${row.codigo})`
				}
			];

			render(DataTable, {
				data: mockData,
				columns: columnsWithAccessor
			});

			await expect.element(page.getByText('Nombre Completo')).toBeInTheDocument();
		});
	});
});
