// Re-exportación de todos los módulos de hooks
export {
	PROTECTED_ROUTES,
	isProtectedRoute,
	requiresAdminAccess,
	requiresInvestigadorAccess,
	isLoginRoute,
	isApiRoute
} from './routes';

export { authenticateApiRequest } from './apiAuth';

export { checkRoleAuthorization } from './authorization';

export { applyApiSecurityHeaders, SECURITY_META_TAGS, transformPageWithSecurityMeta } from './security';