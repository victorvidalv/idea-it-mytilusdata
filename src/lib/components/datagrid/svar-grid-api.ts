/**
 * Inicialización de API de wx-svelte-grid y handlers de edición.
 */
import type { IApi, IRow } from 'wx-svelte-grid';
import type { RowData } from './datagrid-types';

/** Handlers para eventos de edición del grid */
export interface GridEditHandlers {
	onCellEdit: ((row: RowData, column: string, value: unknown) => void | Promise<void>) | null;
	onCellEditEnd: ((row: RowData, column: string, value: unknown) => void | Promise<void>) | null;
}

/**
 * Inicializa la API del grid y registra los handlers de edición.
 */
export function initGridApi(
	api: IApi,
	originalData: RowData[],
	handlers: GridEditHandlers
): void {
	api.on('after-edit', (ev: { row: IRow; column: { id: string }; value: unknown }) => {
		if (handlers.onCellEdit) {
			const originalRow = originalData.find(r => r.id === ev.row.id) as RowData | undefined;
			if (originalRow) {
				handlers.onCellEdit(originalRow, ev.column.id, ev.value);
			}
		}
	});

	api.on('after-edit-end', (ev: { row: IRow; column: { id: string }; value: unknown }) => {
		if (handlers.onCellEditEnd) {
			const originalRow = originalData.find(r => r.id === ev.row.id) as RowData | undefined;
			if (originalRow) {
				handlers.onCellEditEnd(originalRow, ev.column.id, ev.value);
			}
		}
	});
}