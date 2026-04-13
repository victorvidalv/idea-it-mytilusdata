import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';

/**
 * Verifica si Turnstile está configurado
 */
export const turnstileEnabled = !!PUBLIC_TURNSTILE_SITE_KEY;

/**
 * Tipo para la API de Turnstile en window
 */
interface TurnstileAPI {
	render: (node: HTMLElement, config: { sitekey: string; theme: string }) => string;
	reset: (id: string) => void;
	remove: (id: string) => void;
}

declare global {
	interface Window {
		turnstile?: TurnstileAPI;
		onTurnstileLoad?: () => void;
	}
}

/**
 * Callback cuando Turnstile se carga
 */
function onTurnstileLoad(): void {
	// Se llama cuando el script de Turnstile está listo
}

/**
 * Inicializa el callback global de Turnstile
 */
export function initTurnstileCallback(): void {
	if (typeof window !== 'undefined') {
		window.onTurnstileLoad = onTurnstileLoad;
	}
}

/**
 * Svelte action para renderizar el widget de Turnstile
 * @returns ID del widget y función de limpieza
 */
export function createTurnstileAction(
	node: HTMLElement
): { destroy: () => void } | undefined {
	if (!turnstileEnabled) return;

	let widgetId: string | undefined;
	const interval = setInterval(() => {
		if (typeof window.turnstile !== 'undefined') {
			clearInterval(interval);
			widgetId = window.turnstile.render(node, {
				sitekey: PUBLIC_TURNSTILE_SITE_KEY,
				theme: 'light'
			});
		}
	}, 100);

	return {
		destroy() {
			clearInterval(interval);
			if (widgetId !== undefined && typeof window.turnstile !== 'undefined') {
				window.turnstile.remove(widgetId);
			}
		}
	};
}

/**
 * Resetea el widget de Turnstile si está disponible
 */
export function resetTurnstile(widgetId: string | undefined): void {
	if (
		typeof window !== 'undefined' &&
		typeof window.turnstile !== 'undefined' &&
		widgetId !== undefined
	) {
		window.turnstile.reset(widgetId);
	}
}