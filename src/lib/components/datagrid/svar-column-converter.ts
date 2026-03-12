/**
 * Utilidades para conversión de columnas al formato de wx-svelte-grid.
 */
import type { IColumnConfig, IRow } from 'wx-svelte-grid';
import type { RowData, ColumnConfig } from './datagrid-types';
import { createEditorConfig } from './svar-editor-config';

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