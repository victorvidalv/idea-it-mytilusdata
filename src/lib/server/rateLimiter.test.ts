import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Use vi.hoisted to create mocks before module import
const mockSelect = vi.hoisted(() => vi.fn());
const mockFrom = vi.hoisted(() => vi.fn());
const mockWhere = vi.hoisted(() => vi.fn());
const mockLimit = vi.hoisted(() => vi.fn());
const mockDelete = vi.hoisted(() => vi.fn());
const mockInsert = vi.hoisted(() => vi.fn());
const mockValues = vi.hoisted(() => vi.fn());
const mockUpdate = vi.hoisted(() => vi.fn());
const mockSet = vi.hoisted(() => vi.fn());

vi.mock('./db', () => ({
	db: {
		select: mockSelect,
		delete: mockDelete,
		insert: mockInsert,
		update: mockUpdate
	}
}));

vi.mock('./db/schema', () => ({
	rateLimitLogs: { symbol: Symbol('rateLimitLogs') },
	emailCooldowns: { symbol: Symbol('emailCooldowns') }
}));

vi.mock('drizzle-orm', () => ({
	eq: vi.fn((_, value) => ({ eq: value })),
	and: vi.fn((...args) => ({ and: args })),
	gt: vi.fn((_, value) => ({ gt: value })),
	lt: vi.fn((_, value) => ({ lt: value }))
}));

// Import after mocks are set up
import {
	checkRateLimit,
	logRateLimitAttempt,
	checkEmailCooldown,
	updateEmailCooldown,
	cleanupOldRateLimits
} from './rateLimiter';

describe('RateLimiter Module', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('checkRateLimit', () => {
		it('should allow request when under rate limit', async () => {
			mockSelect.mockReturnValue({
				from: mockFrom.mockReturnValue({
					where: mockWhere.mockResolvedValue([])
				})
			});

			const result = await checkRateLimit('192.168.1.1', 'IP');

			expect(result.allowed).toBe(true);
			expect(result.remainingAttempts).toBe(5);
		});

		it('should allow request when at limit - 1', async () => {
			mockSelect.mockReturnValue({
				from: mockFrom.mockReturnValue({
					where: mockWhere.mockResolvedValue([{ createdAt: new Date() }])
				})
			});

			const result = await checkRateLimit('192.168.1.1', 'IP');

			expect(result.allowed).toBe(true);
			expect(result.remainingAttempts).toBe(4);
		});

		it('should deny request when at limit (IP)', async () => {
			// 5 attempts = limit reached
			mockSelect.mockReturnValue({
				from: mockFrom.mockReturnValue({
					where: mockWhere.mockResolvedValue([
						{ createdAt: new Date() },
						{ createdAt: new Date() },
						{ createdAt: new Date() },
						{ createdAt: new Date() },
						{ createdAt: new Date() }
					])
				})
			});

			const result = await checkRateLimit('192.168.1.1', 'IP');

			expect(result.allowed).toBe(false);
			expect(result.remainingAttempts).toBe(0);
			expect(result.resetIn).toBeDefined();
			expect(result.message).toContain('Demasiados intentos');
		});

		it('should deny request when at limit (EMAIL)', async () => {
			// 3 attempts = limit reached for email
			mockSelect.mockReturnValue({
				from: mockFrom.mockReturnValue({
					where: mockWhere.mockResolvedValue([
						{ createdAt: new Date() },
						{ createdAt: new Date() },
						{ createdAt: new Date() }
					])
				})
			});

			const result = await checkRateLimit('test@example.com', 'EMAIL');

			expect(result.allowed).toBe(false);
			expect(result.remainingAttempts).toBe(0);
			expect(result.message).toContain('Demasiados intentos para este correo');
		});

		it('should return resetIn when limit exceeded', async () => {
			const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
			mockSelect.mockReturnValue({
				from: mockFrom.mockReturnValue({
					where: mockWhere.mockResolvedValue([
						{ createdAt: tenMinutesAgo },
						{ createdAt: tenMinutesAgo },
						{ createdAt: tenMinutesAgo },
						{ createdAt: tenMinutesAgo },
						{ createdAt: tenMinutesAgo }
					])
				})
			});

			const result = await checkRateLimit('192.168.1.1', 'IP');

			expect(result.allowed).toBe(false);
			expect(result.resetIn).toBeGreaterThan(0);
		});

		it('should handle database errors gracefully', async () => {
			mockSelect.mockReturnValue({
				from: mockFrom.mockReturnValue({
					where: mockWhere.mockRejectedValue(new Error('DB Error'))
				})
			});

			const result = await checkRateLimit('192.168.1.1', 'IP');

			// Should allow on error (fail open)
			expect(result.allowed).toBe(true);
			expect(result.remainingAttempts).toBe(5);
		});
	});

	describe('logRateLimitAttempt', () => {
		it('should log a rate limit attempt for IP', async () => {
			mockInsert.mockReturnValue({
				values: mockValues.mockResolvedValue(undefined)
			});

			await logRateLimitAttempt('192.168.1.1', 'IP');

			expect(mockInsert).toHaveBeenCalled();
			expect(mockValues).toHaveBeenCalledWith(
				expect.objectContaining({
					identifier: '192.168.1.1',
					tipo: 'IP'
				})
			);
		});

		it('should log a rate limit attempt for EMAIL', async () => {
			mockInsert.mockReturnValue({
				values: mockValues.mockResolvedValue(undefined)
			});

			await logRateLimitAttempt('test@example.com', 'EMAIL');

			expect(mockInsert).toHaveBeenCalled();
			expect(mockValues).toHaveBeenCalledWith(
				expect.objectContaining({
					identifier: 'test@example.com',
					tipo: 'EMAIL'
				})
			);
		});

		it('should not throw on database error', async () => {
			mockInsert.mockReturnValue({
				values: mockValues.mockRejectedValue(new Error('DB Error'))
			});

			await expect(logRateLimitAttempt('192.168.1.1', 'IP')).resolves.not.toThrow();
		});
	});

	describe('checkEmailCooldown', () => {
		it('should return allowed when no cooldown exists', async () => {
			mockSelect.mockReturnValue({
				from: mockFrom.mockReturnValue({
					where: mockWhere.mockReturnValue({
						limit: mockLimit.mockResolvedValue([])
					})
				})
			});

			const result = await checkEmailCooldown('test@example.com');

			expect(result.allowed).toBe(true);
			expect(result.remainingSeconds).toBe(0);
		});

		it('should return allowed when cooldown has expired', async () => {
			const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
			mockSelect.mockReturnValue({
				from: mockFrom.mockReturnValue({
					where: mockWhere.mockReturnValue({
						limit: mockLimit.mockResolvedValue([{ email: 'test@example.com', lastSentAt: twoMinutesAgo }])
					})
				})
			});

			const result = await checkEmailCooldown('test@example.com');

			expect(result.allowed).toBe(true);
			expect(result.remainingSeconds).toBe(0);
		});

		it('should return not allowed when cooldown is active', async () => {
			const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
			mockSelect.mockReturnValue({
				from: mockFrom.mockReturnValue({
					where: mockWhere.mockReturnValue({
						limit: mockLimit.mockResolvedValue([{ email: 'test@example.com', lastSentAt: thirtySecondsAgo }])
					})
				})
			});

			const result = await checkEmailCooldown('test@example.com');

			expect(result.allowed).toBe(false);
			expect(result.remainingSeconds).toBeGreaterThan(0);
			expect(result.message).toContain('Por favor espera');
		});

		it('should handle database errors gracefully', async () => {
			mockSelect.mockReturnValue({
				from: mockFrom.mockReturnValue({
					where: mockWhere.mockReturnValue({
						limit: mockLimit.mockRejectedValue(new Error('DB Error'))
					})
				})
			});

			const result = await checkEmailCooldown('test@example.com');

			// Should allow on error (fail open)
			expect(result.allowed).toBe(true);
			expect(result.remainingSeconds).toBe(0);
		});
	});

	describe('updateEmailCooldown', () => {
		it('should create new cooldown entry when none exists', async () => {
			mockSelect.mockReturnValue({
				from: mockFrom.mockReturnValue({
					where: mockWhere.mockReturnValue({
						limit: mockLimit.mockResolvedValue([])
					})
				})
			});
			mockInsert.mockReturnValue({
				values: mockValues.mockResolvedValue(undefined)
			});

			await updateEmailCooldown('test@example.com');

			expect(mockInsert).toHaveBeenCalled();
		});

		it('should update existing cooldown', async () => {
			const oldDate = new Date(Date.now() - 60 * 1000);
			
			// Configure mocks
			const mockLimitFn = vi.fn().mockResolvedValue([{ email: 'test@example.com', lastSentAt: oldDate }]);
			const mockWhereFn = vi.fn().mockReturnValue({ limit: mockLimitFn });
			const mockFromFn = vi.fn().mockReturnValue({ where: mockWhereFn });
			mockSelect.mockReturnValue({ from: mockFromFn });
			
			const mockUpdateWhereFn = vi.fn().mockResolvedValue(undefined);
			const mockSetFn = vi.fn().mockReturnValue({ where: mockUpdateWhereFn });
			mockUpdate.mockReturnValue({ set: mockSetFn });

			await updateEmailCooldown('test@example.com');

			expect(mockUpdate).toHaveBeenCalled();
			expect(mockSetFn).toHaveBeenCalledWith({ lastSentAt: expect.any(Date) });
		});

		it('should not throw on database error', async () => {
			mockSelect.mockReturnValue({
				from: mockFrom.mockReturnValue({
					where: mockWhere.mockReturnValue({
						limit: mockLimit.mockRejectedValue(new Error('DB Error'))
					})
				})
			});

			await expect(updateEmailCooldown('test@example.com')).resolves.not.toThrow();
		});
	});

	describe('cleanupOldRateLimits', () => {
		it('should delete old rate limit logs and cooldowns', async () => {
			mockDelete.mockReturnValue({
				where: mockWhere.mockResolvedValue(undefined)
			});

			await cleanupOldRateLimits();

			expect(mockDelete).toHaveBeenCalledTimes(2); // rateLimitLogs and emailCooldowns
		});

		it('should not throw on database error', async () => {
			mockDelete.mockReturnValue({
				where: mockWhere.mockRejectedValue(new Error('DB Error'))
			});

			await expect(cleanupOldRateLimits()).resolves.not.toThrow();
		});
	});

	describe('Rate Limit Constants', () => {
		it('should have correct IP rate limit (5 per 15 minutes)', async () => {
			mockSelect.mockReturnValue({
				from: mockFrom.mockReturnValue({
					where: mockWhere.mockResolvedValue([
						{ createdAt: new Date() },
						{ createdAt: new Date() },
						{ createdAt: new Date() },
						{ createdAt: new Date() },
						{ createdAt: new Date() }
					])
				})
			});

			const result = await checkRateLimit('192.168.1.1', 'IP');

			expect(result.allowed).toBe(false);
			expect(result.remainingAttempts).toBe(0);
		});

		it('should have correct EMAIL rate limit (3 per hour)', async () => {
			mockSelect.mockReturnValue({
				from: mockFrom.mockReturnValue({
					where: mockWhere.mockResolvedValue([
						{ createdAt: new Date() },
						{ createdAt: new Date() },
						{ createdAt: new Date() }
					])
				})
			});

			const result = await checkRateLimit('test@example.com', 'EMAIL');

			expect(result.allowed).toBe(false);
			expect(result.remainingAttempts).toBe(0);
		});
	});
});
