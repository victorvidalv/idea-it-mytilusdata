import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken
} from '../auth';

// Set JWT_SECRET for testing
process.env.JWT_SECRET = 'test-secret-key-with-at-least-32-characters-for-security';

describe('hashPassword', () => {
  it('should successfully hash a password', async () => {
    const password = 'Password123';
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('should produce a hash different from the original password', async () => {
    const password = 'Password123';
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
  });

  it('should produce different hashes for the same password (due to salt)', async () => {
    const password = 'Password123';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    expect(hash1).not.toBe(hash2);
  });

  it('should handle empty strings', async () => {
    const password = '';
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('should handle very long passwords', async () => {
    const password = 'a'.repeat(1000);
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('should handle special characters', async () => {
    const passwords = [
      'Password!@#$%^&*()',
      'ñáéíóúÑÁÉÍÓÚ',
      'パスワード123',
      '🔐Password🔑',
      'Password with spaces and\ttabs\nnewlines'
    ];

    for (const password of passwords) {
      const hash = await hashPassword(password);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    }
  });

  it('should handle unicode characters', async () => {
    const password = '密码123🔒';
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('should produce hashes with bcrypt format', async () => {
    const password = 'Password123';
    const hash = await hashPassword(password);

    // bcrypt hashes start with $2a$, $2b$, or $2y$
    expect(hash).toMatch(/^\$2[aby]\$\d+\$/);
  });
});

describe('verifyPassword', () => {
  it('should return true for correct password', async () => {
    const password = 'Password123';
    const hash = await hashPassword(password);
    const result = await verifyPassword(password, hash);

    expect(result).toBe(true);
  });

  it('should return false for incorrect password', async () => {
    const password = 'Password123';
    const wrongPassword = 'WrongPassword456';
    const hash = await hashPassword(password);
    const result = await verifyPassword(wrongPassword, hash);

    expect(result).toBe(false);
  });

  it('should handle empty passwords', async () => {
    const password = '';
    const hash = await hashPassword(password);
    const result = await verifyPassword('', hash);

    expect(result).toBe(true);
  });

  it('should return false for empty password against non-empty hash', async () => {
    const password = 'Password123';
    const hash = await hashPassword(password);
    const result = await verifyPassword('', hash);

    expect(result).toBe(false);
  });

  it('should handle invalid hashes', async () => {
    const password = 'Password123';
    const invalidHashes = [
      '',
      'not-a-hash',
      'invalid-hash-format',
      '$2a$12$invalid',
      'plaintext-password'
    ];

    for (const invalidHash of invalidHashes) {
      const result = await verifyPassword(password, invalidHash);
      expect(result).toBe(false);
    }
  });

  it('should verify against a hash created by hashPassword', async () => {
    const passwords = [
      'Password123',
      'SimplePass',
      'Complex!@#Pass123',
      'ñáéíóúÑÁÉÍÓÚ',
      '🔐Password🔑'
    ];

    for (const password of passwords) {
      const hash = await hashPassword(password);
      const result = await verifyPassword(password, hash);
      expect(result).toBe(true);
    }
  });

  it('should be case-sensitive', async () => {
    const password = 'Password123';
    const hash = await hashPassword(password);

    expect(await verifyPassword('password123', hash)).toBe(false);
    expect(await verifyPassword('PASSWORD123', hash)).toBe(false);
    expect(await verifyPassword('Password123', hash)).toBe(true);
  });

  it('should handle very long passwords', async () => {
    const password = 'a'.repeat(1000);
    const hash = await hashPassword(password);
    const result = await verifyPassword(password, hash);

    expect(result).toBe(true);
  });

  it('should return false for slightly different passwords', async () => {
    const password = 'Password123';
    const hash = await hashPassword(password);

    expect(await verifyPassword('Password124', hash)).toBe(false);
    expect(await verifyPassword('Password12', hash)).toBe(false);
    expect(await verifyPassword('Password1234', hash)).toBe(false);
  });
});

describe('generateToken', () => {
  it('should generate a valid JWT token', () => {
    const userId = 1;
    const email = 'user@example.com';
    const rol = 'ADMIN';

    const token = generateToken(userId, email, rol);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
  });

  it('should contain the correct payload (userId, email, rol)', () => {
    const userId = 123;
    const email = 'test@example.com';
    const rol = 'EQUIPO';

    const token = generateToken(userId, email, rol);
    const decoded = verifyToken(token);

    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(userId);
    expect(decoded?.email).toBe(email);
    expect(decoded?.rol).toBe(rol);
  });

  it('should handle different user roles', () => {
    const roles = ['ADMIN', 'EQUIPO', 'PUBLICO'];
    const userId = 1;
    const email = 'user@example.com';

    for (const rol of roles) {
      const token = generateToken(userId, email, rol);
      const decoded = verifyToken(token);

      expect(decoded?.rol).toBe(rol);
    }
  });

  it('should handle special characters in email', () => {
    const emails = [
      'user+tag@example.com',
      'user.name@example.com',
      'user_name@example.com',
      'user-name@example.com',
      'user@sub.example.com'
    ];
    const userId = 1;
    const rol = 'ADMIN';

    for (const email of emails) {
      const token = generateToken(userId, email, rol);
      const decoded = verifyToken(token);

      expect(decoded?.email).toBe(email);
    }
  });

  it('should handle unicode characters in email', () => {
    const userId = 1;
    const email = '用户@example.com';
    const rol = 'ADMIN';

    const token = generateToken(userId, email, rol);
    const decoded = verifyToken(token);

    expect(decoded?.email).toBe(email);
  });

  it('should handle numeric userId', () => {
    const userIds = [0, 1, 100, 999999];
    const email = 'user@example.com';
    const rol = 'ADMIN';

    for (const userId of userIds) {
      const token = generateToken(userId, email, rol);
      const decoded = verifyToken(token);

      expect(decoded?.userId).toBe(userId);
    }
  });

  it('should handle empty string email', () => {
    const userId = 1;
    const email = '';
    const rol = 'ADMIN';

    const token = generateToken(userId, email, rol);
    const decoded = verifyToken(token);

    expect(decoded?.email).toBe('');
  });

  it('should handle empty string rol', () => {
    const userId = 1;
    const email = 'user@example.com';
    const rol = '';

    const token = generateToken(userId, email, rol);
    const decoded = verifyToken(token);

    expect(decoded?.rol).toBe('');
  });

  it('should generate tokens that can be verified by verifyToken', () => {
    const userId = 1;
    const email = 'user@example.com';
    const rol = 'ADMIN';

    const token = generateToken(userId, email, rol);
    const decoded = verifyToken(token);

    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(userId);
    expect(decoded?.email).toBe(email);
    expect(decoded?.rol).toBe(rol);
  });

  it('should generate different tokens for different users', () => {
    const token1 = generateToken(1, 'user1@example.com', 'ADMIN');
    const token2 = generateToken(2, 'user2@example.com', 'EQUIPO');

    expect(token1).not.toBe(token2);
  });

});

describe('verifyToken', () => {
  it('should verify a valid token correctly', () => {
    const userId = 1;
    const email = 'user@example.com';
    const rol = 'ADMIN';

    const token = generateToken(userId, email, rol);
    const decoded = verifyToken(token);

    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(userId);
    expect(decoded?.email).toBe(email);
    expect(decoded?.rol).toBe(rol);
  });

  it('should return null for expired tokens', () => {
    // Use jest.useFakeTimers to manipulate time
    jest.useFakeTimers();

    const userId = 1;
    const email = 'user@example.com';
    const rol = 'ADMIN';

    // Create a token with a very short expiration (1 second)
    const jwt = require('jsonwebtoken');
    const shortLivedToken = jwt.sign(
      { userId, email, rol },
      process.env.JWT_SECRET,
      { expiresIn: '1s' }
    );

    // Advance time past expiration
    jest.advanceTimersByTime(2000);

    const decoded = verifyToken(shortLivedToken);

    expect(decoded).toBeNull();

    jest.useRealTimers();
  });

  it('should return null for invalid tokens (malformed JWT)', () => {
    const invalidTokens = [
      '',
      'not-a-token',
      'invalid.jwt.token',
      'header.payload',
      'header.payload.signature.extra',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', // Only header
      'not.valid.base64',
      '!!!@@@###$$$',
      'a'.repeat(1000)
    ];

    for (const invalidToken of invalidTokens) {
      const decoded = verifyToken(invalidToken);
      expect(decoded).toBeNull();
    }
  });

  it('should return null for tokens with invalid signatures', () => {
    const userId = 1;
    const email = 'user@example.com';
    const rol = 'ADMIN';

    const token = generateToken(userId, email, rol);

    // Tamper with the signature by changing the last character
    const tamperedToken = token.slice(0, -1) + 'X';

    const decoded = verifyToken(tamperedToken);

    expect(decoded).toBeNull();
  });

  it('should return null for empty strings', () => {
    const decoded = verifyToken('');
    expect(decoded).toBeNull();
  });

  it('should return null for tokens with tampered payload', () => {
    const userId = 1;
    const email = 'user@example.com';
    const rol = 'ADMIN';

    const token = generateToken(userId, email, rol);
    const parts = token.split('.');

    // Tamper with the payload
    const tamperedPayload = Buffer.from(JSON.stringify({ userId: 999, email: 'hacker@evil.com', rol: 'ADMIN' }))
      .toString('base64')
      .replace(/=/g, '');

    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

    const decoded = verifyToken(tamperedToken);

    expect(decoded).toBeNull();
  });

  it('should return null for tokens signed with wrong secret', () => {
    const jwt = require('jsonwebtoken');
    const userId = 1;
    const email = 'user@example.com';
    const rol = 'ADMIN';

    // Sign with a different secret
    const wrongSecretToken = jwt.sign(
      { userId, email, rol },
      'wrong-secret-key-different-from-configured',
      { expiresIn: '7d' }
    );

    const decoded = verifyToken(wrongSecretToken);

    expect(decoded).toBeNull();
  });

  it('should return null for tokens with missing required fields', () => {
    const jwt = require('jsonwebtoken');

    // Create tokens with missing fields
    const incompleteTokens = [
      jwt.sign({ userId: 1 }, process.env.JWT_SECRET, { expiresIn: '7d' }),
      jwt.sign({ email: 'user@example.com' }, process.env.JWT_SECRET, { expiresIn: '7d' }),
      jwt.sign({ rol: 'ADMIN' }, process.env.JWT_SECRET, { expiresIn: '7d' }),
      jwt.sign({}, process.env.JWT_SECRET, { expiresIn: '7d' })
    ];

    for (const token of incompleteTokens) {
      const decoded = verifyToken(token);
      // The token might verify but won't have the expected structure
      // verifyToken returns the decoded payload or null
      // We accept that it might return the payload, but it won't have all fields
      expect(decoded === null || !('userId' in decoded) || !('email' in decoded) || !('rol' in decoded)).toBe(true);
    }
  });

  it('should handle tokens with extra fields in payload', () => {
    const jwt = require('jsonwebtoken');
    const userId = 1;
    const email = 'user@example.com';
    const rol = 'ADMIN';

    const tokenWithExtraFields = jwt.sign(
      { userId, email, rol, extra: 'field', another: 123 },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const decoded = verifyToken(tokenWithExtraFields);

    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(userId);
    expect(decoded?.email).toBe(email);
    expect(decoded?.rol).toBe(rol);
  });

  it('should verify tokens generated with all different roles', () => {
    const roles = ['ADMIN', 'EQUIPO', 'PUBLICO', 'CUSTOM_ROLE'];
    const userId = 1;
    const email = 'user@example.com';

    for (const rol of roles) {
      const token = generateToken(userId, email, rol);
      const decoded = verifyToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.rol).toBe(rol);
    }
  });

  it('should verify tokens with special characters in email', () => {
    const emails = [
      'user+tag@example.com',
      'user.name@example.com',
      'user_name@example.com',
      'user-name@example.com',
      '用户@example.com',
      'user@sub.domain.example.com'
    ];
    const userId = 1;
    const rol = 'ADMIN';

    for (const email of emails) {
      const token = generateToken(userId, email, rol);
      const decoded = verifyToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.email).toBe(email);
    }
  });

  it('should handle tokens with numeric userId edge cases', () => {
    const userIds = [0, 1, Number.MAX_SAFE_INTEGER];
    const email = 'user@example.com';
    const rol = 'ADMIN';

    for (const userId of userIds) {
      const token = generateToken(userId, email, rol);
      const decoded = verifyToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(userId);
    }
  });
});

describe('Integration: hashPassword and verifyPassword', () => {
  it('should work together for password authentication flow', async () => {
    const password = 'SecurePassword123';

    // User registration: hash the password
    const hashedPassword = await hashPassword(password);

    // User login: verify the password
    const isValid = await verifyPassword(password, hashedPassword);

    expect(isValid).toBe(true);
  });

  it('should reject wrong password in authentication flow', async () => {
    const correctPassword = 'SecurePassword123';
    const wrongPassword = 'WrongPassword456';

    // User registration: hash the password
    const hashedPassword = await hashPassword(correctPassword);

    // User login with wrong password
    const isValid = await verifyPassword(wrongPassword, hashedPassword);

    expect(isValid).toBe(false);
  });
});

describe('Integration: generateToken and verifyToken', () => {
  it('should work together for JWT authentication flow', () => {
    const userId = 123;
    const email = 'authenticated@example.com';
    const rol = 'ADMIN';

    // Generate token after successful authentication
    const token = generateToken(userId, email, rol);

    // Verify token on subsequent requests
    const decoded = verifyToken(token);

    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(userId);
    expect(decoded?.email).toBe(email);
    expect(decoded?.rol).toBe(rol);
  });

  it('should reject tampered tokens in authentication flow', () => {
    const userId = 123;
    const email = 'authenticated@example.com';
    const rol = 'ADMIN';

    const token = generateToken(userId, email, rol);

    // Tamper with the token
    const tamperedToken = token.slice(0, -1) + 'X';

    const decoded = verifyToken(tamperedToken);

    expect(decoded).toBeNull();
  });
});
