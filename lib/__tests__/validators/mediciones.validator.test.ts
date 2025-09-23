import {
  createMedicionSchema,
  updateMedicionSchema,
  filterMedicionesSchema,
  medicionIdSchema
} from '../../validators/mediciones.validator';

describe('createMedicionSchema', () => {
  it('debe validar datos válidos correctamente', () => {
    const validData = {
      valor: 25.5,
      fecha_medicion: '2024-01-15',
      lugar_id: 1,
      unidad_id: 2,
      tipo_id: 3,
      notas: 'Medición de prueba'
    };

    const result = createMedicionSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.valor).toBe(25.5);
      expect(result.data.notas).toBe('Medición de prueba');
    }
  });

  it('debe aceptar notas opcionales', () => {
    const validData = {
      valor: 25.5,
      fecha_medicion: '2024-01-15',
      lugar_id: 1,
      unidad_id: 2,
      tipo_id: 3
    };

    const result = createMedicionSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it('debe rechazar valor negativo', () => {
    const invalidData = {
      valor: -10,
      fecha_medicion: '2024-01-15',
      lugar_id: 1,
      unidad_id: 2,
      tipo_id: 3
    };

    const result = createMedicionSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues[0].message).toContain('positivo');
    }
  });

  it('debe rechazar valor cero', () => {
    const invalidData = {
      valor: 0,
      fecha_medicion: '2024-01-15',
      lugar_id: 1,
      unidad_id: 2,
      tipo_id: 3
    };

    const result = createMedicionSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
  });

  it('debe rechazar fecha futura', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    const invalidData = {
      valor: 25.5,
      fecha_medicion: futureDate.toISOString(),
      lugar_id: 1,
      unidad_id: 2,
      tipo_id: 3
    };

    const result = createMedicionSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues[0].message).toContain('futura');
    }
  });

  it('debe rechazar lugar_id negativo', () => {
    const invalidData = {
      valor: 25.5,
      fecha_medicion: '2024-01-15',
      lugar_id: -1,
      unidad_id: 2,
      tipo_id: 3
    };

    const result = createMedicionSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
  });

  it('debe rechazar unidad_id no entero', () => {
    const invalidData = {
      valor: 25.5,
      fecha_medicion: '2024-01-15',
      lugar_id: 1,
      unidad_id: 2.5,
      tipo_id: 3
    };

    const result = createMedicionSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
  });

  it('debe rechazar tipo_id cero', () => {
    const invalidData = {
      valor: 25.5,
      fecha_medicion: '2024-01-15',
      lugar_id: 1,
      unidad_id: 2,
      tipo_id: 0
    };

    const result = createMedicionSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
  });

  it('debe rechazar notas con más de 1000 caracteres', () => {
    const longNotes = 'a'.repeat(1001);

    const invalidData = {
      valor: 25.5,
      fecha_medicion: '2024-01-15',
      lugar_id: 1,
      unidad_id: 2,
      tipo_id: 3,
      notas: longNotes
    };

    const result = createMedicionSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues[0].message).toContain('1000');
    }
  });

  it('debe aceptar notas con exactamente 1000 caracteres', () => {
    const maxNotes = 'a'.repeat(1000);

    const validData = {
      valor: 25.5,
      fecha_medicion: '2024-01-15',
      lugar_id: 1,
      unidad_id: 2,
      tipo_id: 3,
      notas: maxNotes
    };

    const result = createMedicionSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });
});

describe('updateMedicionSchema', () => {
  it('debe aceptar actualización parcial con valor', () => {
    const updateData = {
      valor: 30.5
    };

    const result = updateMedicionSchema.safeParse(updateData);

    expect(result.success).toBe(true);
  });

  it('debe aceptar actualización parcial con fecha', () => {
    const updateData = {
      fecha_medicion: '2024-02-01'
    };

    const result = updateMedicionSchema.safeParse(updateData);

    expect(result.success).toBe(true);
  });

  it('debe aceptar actualización parcial con notas', () => {
    const updateData = {
      notas: 'Notas actualizadas'
    };

    const result = updateMedicionSchema.safeParse(updateData);

    expect(result.success).toBe(true);
  });

  it('debe aceptar actualización con múltiples campos', () => {
    const updateData = {
      valor: 30.5,
      notas: 'Notas actualizadas'
    };

    const result = updateMedicionSchema.safeParse(updateData);

    expect(result.success).toBe(true);
  });

  it('debe aceptar objeto vacío', () => {
    const updateData = {};

    const result = updateMedicionSchema.safeParse(updateData);

    expect(result.success).toBe(true);
  });

  it('debe rechazar actualización con valor negativo', () => {
    const updateData = {
      valor: -10
    };

    const result = updateMedicionSchema.safeParse(updateData);

    expect(result.success).toBe(false);
  });

  it('debe rechazar actualización con fecha futura', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    const updateData = {
      fecha_medicion: futureDate.toISOString()
    };

    const result = updateMedicionSchema.safeParse(updateData);

    expect(result.success).toBe(false);
  });
});

describe('filterMedicionesSchema', () => {
  it('debe aceptar filtros válidos con paginación', () => {
    const validFilters = {
      page: 1,
      limit: 20
    };

    const result = filterMedicionesSchema.safeParse(validFilters);

    expect(result.success).toBe(true);
  });

  it('debe aceptar filtros con lugar_id', () => {
    const validFilters = {
      lugar_id: 5
    };

    const result = filterMedicionesSchema.safeParse(validFilters);

    expect(result.success).toBe(true);
  });

  it('debe aceptar filtros con unidad_id', () => {
    const validFilters = {
      unidad_id: 3
    };

    const result = filterMedicionesSchema.safeParse(validFilters);

    expect(result.success).toBe(true);
  });

  it('debe aceptar filtros con tipo_id', () => {
    const validFilters = {
      tipo_id: 2
    };

    const result = filterMedicionesSchema.safeParse(validFilters);

    expect(result.success).toBe(true);
  });

  it('debe aceptar filtros con autor_id', () => {
    const validFilters = {
      autor_id: 10
    };

    const result = filterMedicionesSchema.safeParse(validFilters);

    expect(result.success).toBe(true);
  });

  it('debe aceptar filtros con rango de fechas válido', () => {
    const validFilters = {
      fecha_desde: '2024-01-01',
      fecha_hasta: '2024-12-31'
    };

    const result = filterMedicionesSchema.safeParse(validFilters);

    expect(result.success).toBe(true);
  });

  it('debe aceptar filtros con fecha_desde solamente', () => {
    const validFilters = {
      fecha_desde: '2024-01-01'
    };

    const result = filterMedicionesSchema.safeParse(validFilters);

    expect(result.success).toBe(true);
  });

  it('debe aceptar filtros con fecha_hasta solamente', () => {
    const validFilters = {
      fecha_hasta: '2024-12-31'
    };

    const result = filterMedicionesSchema.safeParse(validFilters);

    expect(result.success).toBe(true);
  });

  it('debe aceptar filtros combinados', () => {
    const validFilters = {
      page: 2,
      limit: 10,
      lugar_id: 5,
      unidad_id: 3,
      tipo_id: 2,
      autor_id: 10,
      fecha_desde: '2024-01-01',
      fecha_hasta: '2024-12-31'
    };

    const result = filterMedicionesSchema.safeParse(validFilters);

    expect(result.success).toBe(true);
  });

  it('debe aceptar objeto vacío', () => {
    const validFilters = {};

    const result = filterMedicionesSchema.safeParse(validFilters);

    expect(result.success).toBe(true);
  });

  it('debe rechazar page menor a 1', () => {
    const invalidFilters = {
      page: 0
    };

    const result = filterMedicionesSchema.safeParse(invalidFilters);

    expect(result.success).toBe(false);
  });

  it('debe rechazar limit menor a 1', () => {
    const invalidFilters = {
      limit: 0
    };

    const result = filterMedicionesSchema.safeParse(invalidFilters);

    expect(result.success).toBe(false);
  });

  it('debe rechazar limit mayor a 100', () => {
    const invalidFilters = {
      limit: 101
    };

    const result = filterMedicionesSchema.safeParse(invalidFilters);

    expect(result.success).toBe(false);
  });

  it('debe aceptar limit de 100', () => {
    const validFilters = {
      limit: 100
    };

    const result = filterMedicionesSchema.safeParse(validFilters);

    expect(result.success).toBe(true);
  });

  it('debe rechazar lugar_id negativo', () => {
    const invalidFilters = {
      lugar_id: -1
    };

    const result = filterMedicionesSchema.safeParse(invalidFilters);

    expect(result.success).toBe(false);
  });

  it('debe rechazar unidad_id no entero', () => {
    const invalidFilters = {
      unidad_id: 2.5
    };

    const result = filterMedicionesSchema.safeParse(invalidFilters);

    expect(result.success).toBe(false);
  });

  it('debe rechazar rango de fechas invertido', () => {
    const invalidFilters = {
      fecha_desde: '2024-12-31',
      fecha_hasta: '2024-01-01'
    };

    const result = filterMedicionesSchema.safeParse(invalidFilters);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues[0].message).toContain('posterior');
    }
  });

  it('debe aceptar fechas iguales', () => {
    const validFilters = {
      fecha_desde: '2024-01-01',
      fecha_hasta: '2024-01-01'
    };

    const result = filterMedicionesSchema.safeParse(validFilters);

    expect(result.success).toBe(true);
  });
});

describe('medicionIdSchema', () => {
  it('debe validar ID válido', () => {
    const validId = {
      id: 1
    };

    const result = medicionIdSchema.safeParse(validId);

    expect(result.success).toBe(true);
  });

  it('debe aceptar ID como string numérico', () => {
    const validId = {
      id: '5'
    };

    const result = medicionIdSchema.safeParse(validId);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(5);
    }
  });

  it('debe rechazar ID negativo', () => {
    const invalidId = {
      id: -1
    };

    const result = medicionIdSchema.safeParse(invalidId);

    expect(result.success).toBe(false);
  });

  it('debe rechazar ID cero', () => {
    const invalidId = {
      id: 0
    };

    const result = medicionIdSchema.safeParse(invalidId);

    expect(result.success).toBe(false);
  });

  it('debe rechazar ID no entero', () => {
    const invalidId = {
      id: 1.5
    };

    const result = medicionIdSchema.safeParse(invalidId);

    expect(result.success).toBe(false);
  });

  it('debe rechazar string no numérico', () => {
    const invalidId = {
      id: 'abc'
    };

    const result = medicionIdSchema.safeParse(invalidId);

    expect(result.success).toBe(false);
  });
});
