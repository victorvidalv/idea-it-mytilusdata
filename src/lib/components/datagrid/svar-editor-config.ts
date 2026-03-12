/**
 * Configuración de editores para columnas de wx-svelte-grid.
 */
import type { IColumnConfig } from 'wx-svelte-grid';

/** Opciones de editor para combo y richselect */
interface EditorOptions {
	id: string | number;
	label: string;
}

/** Configuración mínima de columna para crear editor */
interface EditorColumnConfig {
	editorType?: 'text' | 'combo' | 'datepicker' | 'richselect';
	editorOptions?: EditorOptions[];
}

/**
 * Crea la configuración de editor según el tipo.
 */
export function createEditorConfig(col: EditorColumnConfig): IColumnConfig['editor'] {
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