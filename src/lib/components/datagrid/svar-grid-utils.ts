/**
 * Utilidades para conversión de columnas e inicialización de wx-svelte-grid.
 */
import type { IColumnConfig, IApi, IRow } from 'wx-svelte-grid';
import type { RowData, ColumnConfig } from './datagrid-utils';

/** Configuración extendida de columna para edición */
export interface EditableColumnConfig extends ColumnConfig {
	editable?: boolean;
	editorType?: 'text' | 'combo' | 'datepicker' | 'richselect';
	editorOptions?: { id: string | number; label: string }[];
	template?: (value: unknown, row: RowData, col: { key: string }) => string;
}

/**
 * Convierte columnas del DataGrid al formato de wx-svelte-grid.
 */
export function convertToSvarColumns(columns: EditableColumnConfig[]): IColumnConfig[] {
	return columns.map((col): IColumnConfig => {
		const result: IColumnConfig = {
			id: col.key,
			header: col.label,
			sort: col.sortable ?? false,
			width: 150,
			flexgrow: 1,
		};

		// Alineación
		if (col.align === 'center') {
			result.css = 'text-center';
		} else if (col.align === 'right') {
			result.css = 'text-right';
		}

		// Template personalizado
		if (col.template) {
			result.template = (value: unknown, row: IRow, _col: unknown) => {
				return col.template!(value, row as RowData, col);
			};
		}

		// Editor para celdas editables
		if (col.editable) {
			result.editor = createEditorConfig(col);
		}

		return result;
	});
}

/**
 * Crea la configuración de editor según el tipo.
 */
function createEditorConfig(col: EditableColumnConfig): IColumnConfig['editor'] {
	if (col.editorType === 'combo' && col.editorOptions) {
		return {
			type: 'combo',
			config: { options: col.editorOptions }
		};
	}

	if (col.editorType === 'richselect' && col.editorOptions) {
		return {
			type: 'richselect',
			config: { options: col.editorOptions }
		};
	}

	if (col.editorType === 'datepicker') {
		return { type: 'datepicker' };
	}

	return 'text';
}

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