/** Aplica headers de seguridad a respuestas de API */
export function applyApiSecurityHeaders(response: Response): void {
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-XSS-Protection', '1; mode=block');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
	response.headers.set('Pragma', 'no-cache');
	response.headers.set('Expires', '0');
}

/** Template de meta tags de seguridad para HTML */
export const SECURITY_META_TAGS = `
	<meta http-equiv="X-Content-Type-Options" content="nosniff">
	<meta http-equiv="X-Frame-Options" content="DENY">
	<meta http-equiv="X-XSS-Protection" content="1; mode=block">
	<meta name="referrer" content="strict-origin-when-cross-origin">
`;

/** Transforma el HTML para incluir meta tags de seguridad */
export function transformPageWithSecurityMeta(html: string): string {
	return html.replace('<head>', `<head>\n\t\t\t${SECURITY_META_TAGS.trim()}`);
}