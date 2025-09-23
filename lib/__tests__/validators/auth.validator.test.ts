import {
  loginSchema,
  registroSchema,
  passwordStrengthSchema
} from '../../validators/auth.validator';

describe('loginSchema', () => {
  it('debe aceptar datos válidos (email correcto, password válido)', () => {
    const validData = {
      email: 'usuario@example.com',
      password: 'Password123'
    };

    const result = loginSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('usuario@example.com');
      expect(result.data.password).toBe('Password123');
    }
  });

  it('debe rechazar email inválido', () => {
    const invalidData = {
      email: 'email-invalido',
      password: 'Password123'
    };

    const result = loginSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues[0].message).toContain('válido');
    }
  });

  it('debe rechazar email vacío', () => {
    const invalidData = {
      email: '',
      password: 'Password123'
    };

    const result = loginSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues[0].message).toContain('requerido');
    }
  });

  it('debe rechazar password vacío', () => {
    const invalidData = {
      email: 'usuario@example.com',
      password: ''
    };

    const result = loginSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues[0].message).toContain('requerida');
    }
  });

  it('debe rechazar password muy corto (< 6 caracteres)', () => {
    const invalidData = {
      email: 'usuario@example.com',
      password: 'Pass1'
    };

    const result = loginSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues[0].message).toContain('6 caracteres');
    }
  });

  it('debe aceptar password con exactamente 6 caracteres', () => {
    const validData = {
      email: 'usuario@example.com',
      password: 'Pass12'
    };

    const result = loginSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it('debe aceptar password sin mayúsculas (loginSchema es más flexible)', () => {
    const validData = {
      email: 'usuario@example.com',
      password: 'password123'
    };

    const result = loginSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it('debe aceptar password sin minúsculas (loginSchema es más flexible)', () => {
    const validData = {
      email: 'usuario@example.com',
      password: 'PASSWORD123'
    };

    const result = loginSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it('debe aceptar password sin números (loginSchema es más flexible)', () => {
    const validData = {
      email: 'usuario@example.com',
      password: 'Password'
    };

    const result = loginSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it('debe aceptar password sin caracteres especiales (loginSchema es más flexible)', () => {
    const validData = {
      email: 'usuario@example.com',
      password: 'Password123'
    };

    const result = loginSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });
});

describe('registroSchema', () => {
  it('debe aceptar datos válidos (nombre, email, password)', () => {
    const validData = {
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'Password123'
    };

    const result = registroSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nombre).toBe('Juan Pérez');
      expect(result.data.email).toBe('juan@example.com');
      expect(result.data.password).toBe('Password123');
    }
  });

  it('debe rechazar nombre vacío', () => {
    const invalidData = {
      nombre: '',
      email: 'juan@example.com',
      password: 'Password123'
    };

    const result = registroSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues[0].message).toContain('requerido');
    }
  });

  it('debe rechazar nombre muy corto (< 2 caracteres)', () => {
    const invalidData = {
      nombre: 'J',
      email: 'juan@example.com',
      password: 'Password123'
    };

    const result = registroSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues[0].message).toContain('2 caracteres');
    }
  });

  it('debe aceptar nombre con exactamente 2 caracteres', () => {
    const validData = {
      nombre: 'JP',
      email: 'juan@example.com',
      password: 'Password123'
    };

    const result = registroSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it('debe rechazar nombre con más de 100 caracteres', () => {
    const longName = 'a'.repeat(101);

    const invalidData = {
      nombre: longName,
      email: 'juan@example.com',
      password: 'Password123'
    };

    const result = registroSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues[0].message).toContain('100');
    }
  });

  it('debe aceptar nombre con exactamente 100 caracteres', () => {
    const maxName = 'a'.repeat(100);

    const validData = {
      nombre: maxName,
      email: 'juan@example.com',
      password: 'Password123'
    };

    const result = registroSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it('debe rechazar email inválido', () => {
    const invalidData = {
      nombre: 'Juan Pérez',
      email: 'email-invalido',
      password: 'Password123'
    };

    const result = registroSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues[0].message).toContain('válido');
    }
  });

  it('debe rechazar email vacío', () => {
    const invalidData = {
      nombre: 'Juan Pérez',
      email: '',
      password: 'Password123'
    };

    const result = registroSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues[0].message).toContain('requerido');
    }
  });

  it('debe rechazar password que no cumple fortaleza (muy corto)', () => {
    const invalidData = {
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'Pass1'
    };

    const result = registroSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues[0].message).toContain('8 caracteres');
    }
  });

  it('debe rechazar password sin mayúsculas', () => {
    const invalidData = {
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'password123'
    };

    const result = registroSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues.some(issue => issue.message.includes('mayúscula'))).toBe(true);
    }
  });

  it('debe rechazar password sin minúsculas', () => {
    const invalidData = {
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'PASSWORD123'
    };

    const result = registroSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues.some(issue => issue.message.includes('minúscula'))).toBe(true);
    }
  });

  it('debe rechazar password sin números', () => {
    const invalidData = {
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'Password'
    };

    const result = registroSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues.some(issue => issue.message.includes('número'))).toBe(true);
    }
  });

  it('debe rechazar password vacío', () => {
    const invalidData = {
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      password: ''
    };

    const result = registroSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues[0].message).toContain('requerida');
    }
  });
});

describe('passwordStrengthSchema', () => {
  it('debe aceptar password fuerte', () => {
    const validPassword = 'Password123';

    const result = passwordStrengthSchema.safeParse(validPassword);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('Password123');
    }
  });

  it('debe aceptar password con caracteres especiales', () => {
    const validPassword = 'Password123!';

    const result = passwordStrengthSchema.safeParse(validPassword);

    expect(result.success).toBe(true);
  });

  it('debe rechazar password sin mayúsculas', () => {
    const invalidPassword = 'password123';

    const result = passwordStrengthSchema.safeParse(invalidPassword);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues.some(issue => issue.message.includes('mayúscula'))).toBe(true);
    }
  });

  it('debe rechazar password sin minúsculas', () => {
    const invalidPassword = 'PASSWORD123';

    const result = passwordStrengthSchema.safeParse(invalidPassword);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues.some(issue => issue.message.includes('minúscula'))).toBe(true);
    }
  });

  it('debe rechazar password sin números', () => {
    const invalidPassword = 'Password';

    const result = passwordStrengthSchema.safeParse(invalidPassword);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues.some(issue => issue.message.includes('número'))).toBe(true);
    }
  });

  it('debe rechazar password muy corto (< 8 caracteres)', () => {
    const invalidPassword = 'Pass1';

    const result = passwordStrengthSchema.safeParse(invalidPassword);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues[0].message).toContain('8 caracteres');
    }
  });

  it('debe aceptar password con exactamente 8 caracteres', () => {
    const validPassword = 'Pass1234';

    const result = passwordStrengthSchema.safeParse(validPassword);

    expect(result.success).toBe(true);
  });

  it('debe rechazar password vacío', () => {
    const invalidPassword = '';

    const result = passwordStrengthSchema.safeParse(invalidPassword);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues[0].message).toContain('requerida');
    }
  });

  it('debe rechazar password que no es string', () => {
    const invalidPassword = 12345678;

    const result = passwordStrengthSchema.safeParse(invalidPassword);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues[0].message).toContain('texto');
    }
  });

  it('debe aceptar password con mayúsculas, minúsculas, números y especiales', () => {
    const validPassword = 'Password123!@#';

    const result = passwordStrengthSchema.safeParse(validPassword);

    expect(result.success).toBe(true);
  });

  it('debe rechazar password con solo mayúsculas y números', () => {
    const invalidPassword = 'PASSWORD123';

    const result = passwordStrengthSchema.safeParse(invalidPassword);

    expect(result.success).toBe(false);
  });

  it('debe rechazar password con solo minúsculas y números', () => {
    const invalidPassword = 'password123';

    const result = passwordStrengthSchema.safeParse(invalidPassword);

    expect(result.success).toBe(false);
  });

  it('debe rechazar password con solo mayúsculas y minúsculas', () => {
    const invalidPassword = 'Password';

    const result = passwordStrengthSchema.safeParse(invalidPassword);

    expect(result.success).toBe(false);
  });
});
