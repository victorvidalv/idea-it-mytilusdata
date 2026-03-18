/**
 * Utilidades para el componente SearchableSelect
 * Extraídas para reducir complejidad ciclomática del componente principal.
 */

/** Determinar si una opción está seleccionada comparando valores como string */
export function isSelected(optValue: string | number | null | undefined, currentValue: string | number | null | undefined): boolean {
	return optValue?.toString() === currentValue?.toString();
}

/** Clases base comunes para el botón del select */
const BUTTON_BASE_CLASSES = 'flex h-11 w-full items-center justify-between rounded-lg border px-3 py-2 font-body text-sm transition-all';

/** Clases del botón cuando está deshabilitado */
const BUTTON_DISABLED_CLASSES = 'cursor-not-allowed border-border/40 bg-secondary/30 text-muted-foreground opacity-50';

/** Clases del botón cuando está abierto */
const BUTTON_OPEN_CLASSES = 'border-ocean-light bg-background text-foreground ring-2 ring-ocean-light/20';

/** Clases del botón en estado normal */
const BUTTON_NORMAL_CLASSES = 'border-border/60 bg-background text-foreground hover:border-ocean-light/50 focus:ring-2 focus:ring-ocean-light/20 focus:outline-none';

/** Obtener clases CSS del botón según su estado */
export function getButtonClasses(disabled: boolean, open: boolean): string {
	if (disabled) return `${BUTTON_BASE_CLASSES} ${BUTTON_DISABLED_CLASSES}`;
	if (open) return `${BUTTON_BASE_CLASSES} ${BUTTON_OPEN_CLASSES}`;
	return `${BUTTON_BASE_CLASSES} ${BUTTON_NORMAL_CLASSES}`;
}

/** Clases base para las opciones del dropdown */
const OPTION_BASE_CLASSES = 'flex w-full items-center justify-between rounded-sm px-3 py-2 text-left font-body text-sm transition-colors hover:bg-ocean-light/10 hover:text-ocean-light';

/** Clases para opción seleccionada */
const OPTION_SELECTED_CLASSES = 'bg-ocean-light/15 font-medium text-ocean-light';

/** Obtener clases CSS de una opción según si está seleccionada */
export function getOptionClasses(isSelectedOption: boolean): string {
	return isSelectedOption 
		? `${OPTION_BASE_CLASSES} ${OPTION_SELECTED_CLASSES}` 
		: `${OPTION_BASE_CLASSES} text-foreground`;
}