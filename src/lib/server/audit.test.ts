import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { AccionAuditoria, AuditLogParams } from './audit';

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;

// Use vi.hoisted to create mocks before module import
const mockInsert = vi.hoisted(() => vi.fn());
const mockValues = vi.hoisted(() => vi.fn());

vi.mock('./db', () => ({
	db: {
		insert: mockInsert.mockReturnValue({
			values: mockValues.mockResolvedValue(undefined)
		})
	}
}));

vi.mock('./db/schema', () => ({
	auditLogs: { symbol: Symbol('auditLogs') }
}));

// Import after mocks are set up
import {
	logAuditEvent,
	logLoginSuccess,
	logLoginFailed,
	logMagicLinkSent,
	logLogout,
	logApiKeyGenerated,
	logApiKeyRevoked,
	logApiAccess,
	logDataExport,
	logUserCreated,
	logRoleChange
} from './audit';

describe('Audit Module', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockInsert.mockReturnValue({
			values: mockValues.mockResolvedValue(undefined)
		});
		console.error = vi.fn();
	});

	afterEach(() => {
		console.error = originalConsoleError;
	});

	describe('logAuditEvent', () => {
		it('should log an audit event with all parameters', async () => {
			const params: AuditLogParams = {
				userId: 1,
				accion: 'LOGIN_SUCCESS',
				entidad: 'usuario',
				entidadId: 1,
				ip: '192.168.1.1',
				userAgent: 'Mozilla/5.0',
				detalles: { extra: 'info' }
			};

			await logAuditEvent(params);

			expect(mockInsert).toHaveBeenCalled();
			expect(mockValues).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: 1,
					accion: 'LOGIN_SUCCESS',
					entidad: 'usuario',
					entidadId: 1,
					ip: '192.168.1.1',
					userAgent: 'Mozilla/5.0',
					detalles: JSON.stringify({ extra: 'info' })
				})
			);
		});

		it('should log an audit event with minimal parameters', async () => {
			await logAuditEvent({ accion: 'LOGOUT' });

			expect(mockInsert).toHaveBeenCalled();
			expect(mockValues).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: null,
					accion: 'LOGOUT',
					entidad: null,
					entidadId: null,
					ip: null,
					userAgent: null,
					detalles: null
				})
			);
		});

		it('should handle database errors gracefully', async () => {
			mockInsert.mockReturnValue({
				values: mockValues.mockRejectedValue(new Error('DB Error'))
			});

			await logAuditEvent({ accion: 'LOGIN_FAILED' });

			expect(console.error).toHaveBeenCalledWith(
				'Error registrando evento de auditoría:',
				expect.any(Error)
			);
		});

		it('should not throw when database fails', async () => {
			mockInsert.mockReturnValue({
				values: mockValues.mockRejectedValue(new Error('DB Error'))
			});

			await expect(logAuditEvent({ accion: 'LOGOUT' })).resolves.not.toThrow();
		});
	});

	describe('logLoginSuccess', () => {
		it('should log a successful login', async () => {
			await logLoginSuccess({
				userId: 1,
				ip: '192.168.1.1',
				userAgent: 'TestAgent'
			});

			expect(mockValues).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: 1,
					accion: 'LOGIN_SUCCESS',
					entidad: 'usuario',
					entidadId: 1,
					ip: '192.168.1.1',
					userAgent: 'TestAgent'
				})
			);
		});

		it('should work with minimal params', async () => {
			await logLoginSuccess({ userId: 1 });

			expect(mockValues).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: 1,
					accion: 'LOGIN_SUCCESS'
				})
			);
		});
	});

	describe('logLoginFailed', () => {
		it('should log a failed login with reason', async () => {
			await logLoginFailed({
				email: 'test@example.com',
				ip: '192.168.1.1',
				userAgent: 'TestAgent',
				reason: 'Invalid credentials'
			});

			expect(mockValues).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: null,
					accion: 'LOGIN_FAILED',
					entidad: 'usuario',
					ip: '192.168.1.1',
					userAgent: 'TestAgent',
					detalles: JSON.stringify({
						email: 'test@example.com',
						reason: 'Invalid credentials'
					})
				})
			);
		});

		it('should work without reason', async () => {
			await logLoginFailed({ email: 'test@example.com' });

			expect(mockValues).toHaveBeenCalledWith(
				expect.objectContaining({
					accion: 'LOGIN_FAILED',
					detalles: JSON.stringify({
						email: 'test@example.com',
						reason: undefined
					})
				})
			);
		});
	});

	describe('logMagicLinkSent', () => {
		it('should log magic link sent with userId', async () => {
			await logMagicLinkSent({
				userId: 1,
				email: 'test@example.com',
				ip: '192.168.1.1'
			});

			expect(mockValues).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: 1,
					accion: 'MAGIC_LINK_SENT',
					entidad: 'usuario',
					ip: '192.168.1.1',
					detalles: JSON.stringify({ email: 'test@example.com' })
				})
			);
		});

		it('should work without userId', async () => {
			await logMagicLinkSent({ email: 'test@example.com' });

			expect(mockValues).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: null,
					accion: 'MAGIC_LINK_SENT'
				})
			);
		});
	});

	describe('logLogout', () => {
		it('should log a logout event', async () => {
			await logLogout({
				userId: 1,
				ip: '192.168.1.1',
				userAgent: 'TestAgent'
			});

			expect(mockValues).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: 1,
					accion: 'LOGOUT',
					entidad: 'usuario',
					entidadId: 1,
					ip: '192.168.1.1',
					userAgent: 'TestAgent'
				})
			);
		});
	});

	describe('logApiKeyGenerated', () => {
		it('should log API key generation', async () => {
			await logApiKeyGenerated({
				userId: 1,
				ip: '192.168.1.1',
				userAgent: 'TestAgent'
			});

			expect(mockValues).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: 1,
					accion: 'API_KEY_GENERATED',
					entidad: 'api_key',
					entidadId: 1,
					ip: '192.168.1.1',
					userAgent: 'TestAgent'
				})
			);
		});
	});

	describe('logApiKeyRevoked', () => {
		it('should log API key revocation', async () => {
			await logApiKeyRevoked({
				userId: 1,
				ip: '192.168.1.1',
				userAgent: 'TestAgent'
			});

			expect(mockValues).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: 1,
					accion: 'API_KEY_REVOKED',
					entidad: 'api_key',
					entidadId: 1,
					ip: '192.168.1.1',
					userAgent: 'TestAgent'
				})
			);
		});
	});

	describe('logApiAccess', () => {
		it('should log API access with endpoint and method', async () => {
			await logApiAccess({
				userId: 1,
				endpoint: '/api/registros',
				method: 'GET',
				ip: '192.168.1.1',
				userAgent: 'TestAgent'
			});

			expect(mockValues).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: 1,
					accion: 'API_ACCESS',
					entidad: 'api',
					ip: '192.168.1.1',
					userAgent: 'TestAgent',
					detalles: JSON.stringify({
						endpoint: '/api/registros',
						method: 'GET'
					})
				})
			);
		});
	});

	describe('logDataExport', () => {
		it('should log data export with format', async () => {
			await logDataExport({
				userId: 1,
				format: 'CSV',
				ip: '192.168.1.1',
				userAgent: 'TestAgent'
			});

			expect(mockValues).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: 1,
					accion: 'DATA_EXPORT',
					entidad: 'export',
					entidadId: 1,
					ip: '192.168.1.1',
					userAgent: 'TestAgent',
					detalles: JSON.stringify({ format: 'CSV' })
				})
			);
		});
	});

	describe('logUserCreated', () => {
		it('should log user creation', async () => {
			await logUserCreated({
				userId: 1,
				email: 'newuser@example.com',
				ip: '192.168.1.1',
				userAgent: 'TestAgent'
			});

			expect(mockValues).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: 1,
					accion: 'USER_CREATED',
					entidad: 'usuario',
					entidadId: 1,
					ip: '192.168.1.1',
					userAgent: 'TestAgent',
					detalles: JSON.stringify({ email: 'newuser@example.com' })
				})
			);
		});
	});

	describe('logRoleChange', () => {
		it('should log role change with details', async () => {
			await logRoleChange({
				userId: 2,
				oldRole: 'investigador',
				newRole: 'admin',
				changedBy: 1,
				ip: '192.168.1.1'
			});

			expect(mockValues).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: 1, // changedBy is the actor
					accion: 'ROLE_CHANGE',
					entidad: 'usuario',
					entidadId: 2, // userId is the target
					ip: '192.168.1.1',
					detalles: JSON.stringify({
						oldRole: 'investigador',
						newRole: 'admin'
					})
				})
			);
		});
	});

	describe('AccionAuditoria Type', () => {
		it('should accept all valid action types', () => {
			const validActions: AccionAuditoria[] = [
				'LOGIN_SUCCESS',
				'LOGIN_FAILED',
				'LOGOUT',
				'MAGIC_LINK_SENT',
				'API_KEY_GENERATED',
				'API_KEY_REVOKED',
				'API_ACCESS',
				'DATA_EXPORT',
				'ROLE_CHANGE',
				'USER_CREATED'
			];

			// This test just verifies the type compiles correctly
			expect(validActions.length).toBe(10);
		});
	});
});
