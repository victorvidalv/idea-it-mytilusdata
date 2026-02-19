import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';


// Use vi.hoisted to create mocks before module import
const mockSelect = vi.hoisted(() => vi.fn());
const mockFrom = vi.hoisted(() => vi.fn());
const mockWhere = vi.hoisted(() => vi.fn());
const mockInsert = vi.hoisted(() => vi.fn());
const mockValues = vi.hoisted(() => vi.fn());

vi.mock('./db', () => ({
	db: {
		select: mockSelect.mockReturnValue({
			from: mockFrom.mockReturnValue({
				where: mockWhere
			})
		}),
		insert: mockInsert.mockReturnValue({
			values: mockValues
		})
	}
}));

vi.mock('./db/schema', () => ({
	rateLimitLogs: { symbol: Symbol('rateLimitLogs') }
}));

vi.mock('drizzle-orm', () => ({
	eq: vi.fn((_, value) => ({ eq: value })),
	and: vi.fn((...args) => ({ and: args })),
	gt: vi.fn((_, value) => ({ gt: value }))
}));

// Import after mocks are set up
import {
	checkApiRateLimit,
	logApiRateLimit,
	getApiRateLimitIdentifier,
	formatResetTime
} from './apiRateLimiter';

describe('ApiRateLimiter Module', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Setup default mock chain for select
		mockSelect.mockReturnValue({
			from: mockFrom.mockReturnValue({
				where: mockWhere
			})
		});
		// Setup default mock chain for insert
		mockInsert.mockReturnValue({
			values: mockValues
		});
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('checkApiRateLimit', () => {
		it('should allow request when under DEFAULT rate limit', async () => {
			mockWhere.mockResolvedValue([]);

			const result = await checkApiRateLimit('test-api-key', 'DEFAULT');

			expect(result.allowed).toBe(true);
			expect(result.remaining).toBe(100);
			expect(result.limit).toBe(100);
			expect(result.resetIn).toBe(60000);
		});

		it('should allow request when at DEFAULT limit - 1', async () => {
			mockWhere.mockResolvedValue([{ createdAt: new Date() }]);

			const result = await checkApiRateLimit('test-api-key', 'DEFAULT');

			expect(result.allowed).toBe(true);
			expect(result.remaining).toBe(99);
		});

		it('should deny request when at DEFAULT limit', async () => {
			// 100 attempts = limit reached
			const attempts = Array(100).fill({ createdAt: new Date() });
			mockWhere.mockResolvedValue(attempts);

			const result = await checkApiRateLimit('test-api-key', 'DEFAULT');

			expect(result.allowed).toBe(false);
			expect(result.remaining).toBe(0);
		});

		it('should allow request when under EXPORT rate limit', async () => {
			mockWhere.mockResolvedValue([]);

			const result = await checkApiRateLimit('test-api-key', 'EXPORT');

			expect(result.allowed).toBe(true);
			expect(result.remaining).toBe(10);
			expect(result.limit).toBe(10);
		});

		it('should deny request when at EXPORT limit', async () => {
			// 10 attempts = limit reached for EXPORT
			const attempts = Array(10).fill({ createdAt: new Date() });
			mockWhere.mockResolvedValue(attempts);

			const result = await checkApiRateLimit('test-api-key', 'EXPORT');

			expect(result.allowed).toBe(false);
			expect(result.remaining).toBe(0);
			expect(result.limit).toBe(10);
		});

		it('should use DEFAULT endpoint type when not specified', async () => {
			mockWhere.mockResolvedValue([]);

			const result = await checkApiRateLimit('test-api-key');

			expect(result.limit).toBe(100); // DEFAULT limit
		});

		it('should return resetIn when limit exceeded', async () => {
			const tenSecondsAgo = new Date(Date.now() - 10 * 1000);
			const attempts = Array(100).fill({ createdAt: tenSecondsAgo });
			mockWhere.mockResolvedValue(attempts);

			const result = await checkApiRateLimit('test-api-key', 'DEFAULT');

			expect(result.allowed).toBe(false);
			expect(result.resetIn).toBeGreaterThan(0);
			expect(result.resetIn).toBeLessThanOrEqual(60000);
		});

		it('should handle database errors gracefully', async () => {
			mockWhere.mockRejectedValue(new Error('DB Error'));

			const result = await checkApiRateLimit('test-api-key', 'DEFAULT');

			// Should allow on error (fail open)
			expect(result.allowed).toBe(true);
			expect(result.remaining).toBe(100);
		});
	});

	describe('logApiRateLimit', () => {
		it('should log an API rate limit attempt', async () => {
			mockValues.mockResolvedValue(undefined);

			await logApiRateLimit('test-api-key');

			expect(mockInsert).toHaveBeenCalled();
			expect(mockValues).toHaveBeenCalledWith(
				expect.objectContaining({
					identifier: 'test-api-key',
					tipo: 'IP'
				})
			);
		});

		it('should not throw on database error', async () => {
			mockValues.mockRejectedValue(new Error('DB Error'));

			await expect(logApiRateLimit('test-api-key')).resolves.not.toThrow();
		});
	});

	describe('getApiRateLimitIdentifier', () => {
		it('should return API key identifier when API key is provided', () => {
			const apiKey = 'sk_test_1234567890abcdef';
			const ip = '192.168.1.1';

			const result = getApiRateLimitIdentifier(apiKey, ip);

			expect(result).toBe('apikey:sk_test_12345678...');
		});

		it('should return IP identifier when API key is null', () => {
			const ip = '192.168.1.1';

			const result = getApiRateLimitIdentifier(null, ip);

			expect(result).toBe('ip:192.168.1.1');
		});

		it('should return IP identifier when API key is empty string', () => {
			const ip = '192.168.1.1';

			// Empty string is falsy, so it should use IP
			const result = getApiRateLimitIdentifier('', ip);

			// Empty string is falsy, so this should return ip identifier
			expect(result).toBe('ip:192.168.1.1');
		});

		it('should truncate long API keys', () => {
			const apiKey = 'sk_test_1234567890abcdefghijklmnopqrstuvwxyz';
			const ip = '192.168.1.1';

			const result = getApiRateLimitIdentifier(apiKey, ip);

			expect(result).toBe('apikey:sk_test_12345678...');
		});
	});

	describe('formatResetTime', () => {
		it('should format seconds correctly (plural)', () => {
			const result = formatResetTime(5000);
			expect(result).toBe('5 segundos');
		});

		it('should format seconds correctly (singular)', () => {
			const result = formatResetTime(1000);
			expect(result).toBe('1 segundo');
		});

		it('should format minutes correctly (plural)', () => {
			const result = formatResetTime(120000);
			expect(result).toBe('2 minutos');
		});

		it('should format minutes correctly (singular)', () => {
			const result = formatResetTime(60000);
			expect(result).toBe('1 minuto');
		});

		it('should round up seconds', () => {
			const result = formatResetTime(1500);
			expect(result).toBe('2 segundos');
		});

		it('should handle values under 1 second', () => {
			const result = formatResetTime(500);
			expect(result).toBe('1 segundo');
		});
	});

	describe('Rate Limit Constants', () => {
		it('should have correct DEFAULT limit (100 per minute)', async () => {
			mockWhere.mockResolvedValue([]);

			const result = await checkApiRateLimit('test', 'DEFAULT');

			expect(result.limit).toBe(100);
		});

		it('should have correct EXPORT limit (10 per minute)', async () => {
			mockWhere.mockResolvedValue([]);

			const result = await checkApiRateLimit('test', 'EXPORT');

			expect(result.limit).toBe(10);
		});
	});
});
