import { MedicionesService, MedicionesExportService } from '../../services';
import prisma from '../../prisma';
import { logger } from '../../utils/logger';
import { registrarCambio } from '../../bitacora';

// Mock de Prisma
jest.mock('../../prisma', () => ({
  __esModule: true,
  default: {
    medicion: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    lugar: {
      findFirst: jest.fn(),
    },
    unidad: {
      findFirst: jest.fn(),
    },
    tipoRegistro: {
      findUnique: jest.fn(),
    },
    origenDato: {
      findFirst: jest.fn(),
    },
    ciclo: {
      findFirst: jest.fn(),
    },
  },
}));

// Mock de logger
jest.mock('../../utils/logger', () => ({
  __esModule: true,
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// El mock de bitácora ahora es global en jest.setup.js


describe('MedicionesService - findAll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe retornar lista de mediciones', async () => {
    const mockMediciones = [
      {
        id: 1,
        valor: 25.5,
        fecha_medicion: new Date('2024-01-15'),
        lugar_id: 1,
        unidad_id: 2,
        tipo_id: 3,
        registrado_por_id: 1,
        notas: 'Medición de prueba',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        lugar: { id: 1, nombre: 'Lugar 1' },
        unidad: { id: 2, nombre: 'Unidad 1' },
        tipo: { id: 3, codigo: 'TIPO1', descripcion: 'Tipo 1' },
        registrado_por: { id: 1, nombre: 'Usuario 1' },
      },
    ];

    (prisma.medicion.count as jest.Mock).mockResolvedValue(1);
    (prisma.medicion.findMany as jest.Mock).mockResolvedValue(mockMediciones);

    const result = await MedicionesService.findAll({}, 1, 20);

    expect(result.data).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(20);
    expect(result.data[0].valor).toBe(25.5);
  });

  it('debe aplicar filtros por lugar_id', async () => {
    const mockMediciones = [
      {
        id: 1,
        valor: 25.5,
        fecha_medicion: new Date('2024-01-15'),
        lugar_id: 5,
        unidad_id: 2,
        tipo_id: 3,
        registrado_por_id: 1,
        notas: 'Medición de prueba',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        lugar: { id: 5, nombre: 'Lugar 5' },
        unidad: { id: 2, nombre: 'Unidad 1' },
        tipo: { id: 3, codigo: 'TIPO1', descripcion: 'Tipo 1' },
        registrado_por: { id: 1, nombre: 'Usuario 1' },
      },
    ];

    (prisma.medicion.count as jest.Mock).mockResolvedValue(1);
    (prisma.medicion.findMany as jest.Mock).mockResolvedValue(mockMediciones);

    const result = await MedicionesService.findAll({ lugar_id: 5 }, 1, 20);

    expect(prisma.medicion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          lugar_id: 5,
          deleted_at: null,
        }),
      })
    );
  });

  it('debe aplicar filtros por tipo_id', async () => {
    (prisma.medicion.count as jest.Mock).mockResolvedValue(1);
    (prisma.medicion.findMany as jest.Mock).mockResolvedValue([]);

    await MedicionesService.findAll({ tipo_id: 2 }, 1, 20);

    expect(prisma.medicion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tipo_id: 2,
          deleted_at: null,
        }),
      })
    );
  });

  it('debe aplicar filtros por autor_id', async () => {
    (prisma.medicion.count as jest.Mock).mockResolvedValue(1);
    (prisma.medicion.findMany as jest.Mock).mockResolvedValue([]);

    await MedicionesService.findAll({ autor_id: 10 }, 1, 20);

    expect(prisma.medicion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          registrado_por_id: 10,
          deleted_at: null,
        }),
      })
    );
  });

  it('debe aplicar filtros por unidad_id', async () => {
    (prisma.medicion.count as jest.Mock).mockResolvedValue(1);
    (prisma.medicion.findMany as jest.Mock).mockResolvedValue([]);

    await MedicionesService.findAll({ unidad_id: 3 }, 1, 20);

    expect(prisma.medicion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          unidad_id: 3,
          deleted_at: null,
        }),
      })
    );
  });

  it('debe aplicar filtros por fecha_desde', async () => {
    const fechaDesde = new Date('2024-01-01');
    (prisma.medicion.count as jest.Mock).mockResolvedValue(1);
    (prisma.medicion.findMany as jest.Mock).mockResolvedValue([]);

    await MedicionesService.findAll({ fecha_desde: fechaDesde }, 1, 20);

    expect(prisma.medicion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          fecha_medicion: expect.objectContaining({
            gte: fechaDesde,
          }),
          deleted_at: null,
        }),
      })
    );
  });

  it('debe aplicar filtros por fecha_hasta', async () => {
    const fechaHasta = new Date('2024-12-31');
    (prisma.medicion.count as jest.Mock).mockResolvedValue(1);
    (prisma.medicion.findMany as jest.Mock).mockResolvedValue([]);

    await MedicionesService.findAll({ fecha_hasta: fechaHasta }, 1, 20);

    expect(prisma.medicion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          fecha_medicion: expect.objectContaining({
            lte: fechaHasta,
          }),
          deleted_at: null,
        }),
      })
    );
  });

  it('debe aplicar paginación correctamente', async () => {
    (prisma.medicion.count as jest.Mock).mockResolvedValue(50);
    (prisma.medicion.findMany as jest.Mock).mockResolvedValue([]);

    const result = await MedicionesService.findAll({}, 2, 10);

    expect(result.pagination.page).toBe(2);
    expect(result.pagination.limit).toBe(10);
    expect(result.pagination.total).toBe(50);
    expect(result.pagination.totalPages).toBe(5);
    expect(result.pagination.hasNext).toBe(true);
    expect(result.pagination.hasPrevious).toBe(true);

    expect(prisma.medicion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      })
    );
  });

  it('debe manejar errores de base de datos', async () => {
    (prisma.medicion.count as jest.Mock).mockRejectedValue(new Error('Database error'));

    await expect(MedicionesService.findAll({}, 1, 20)).rejects.toThrow();
  });
});

describe('MedicionesService - findById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe retornar medición por ID', async () => {
    const mockMedicion = {
      id: 1,
      valor: 25.5,
      fecha_medicion: new Date('2024-01-15'),
      lugar_id: 1,
      unidad_id: 2,
      tipo_id: 3,
      registrado_por_id: 1,
      notas: 'Medición de prueba',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      lugar: { id: 1, nombre: 'Lugar 1' },
      unidad: { id: 2, nombre: 'Unidad 1' },
      tipo: { id: 3, codigo: 'TIPO1', descripcion: 'Tipo 1' },
      registrado_por: { id: 1, nombre: 'Usuario 1' },
    };

    (prisma.medicion.findUnique as jest.Mock).mockResolvedValue(mockMedicion);

    const result = await MedicionesService.findById(1);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(1);
    expect(result?.valor).toBe(25.5);
  });

  it('debe retornar null si no existe', async () => {
    (prisma.medicion.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await MedicionesService.findById(999);

    expect(result).toBeNull();
  });

  it('debe manejar errores de base de datos', async () => {
    (prisma.medicion.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

    await expect(MedicionesService.findById(1)).rejects.toThrow();
  });
});

describe('MedicionesService - create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe crear medición válida', async () => {
    const mockMedicion = {
      id: 1,
      valor: 25.5,
      fecha_medicion: new Date('2024-01-15'),
      lugar_id: 1,
      unidad_id: 2,
      tipo_id: 3,
      registrado_por_id: 1,
      notas: 'Medición de prueba',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      lugar: { id: 1, nombre: 'Lugar 1' },
      unidad: { id: 2, nombre: 'Unidad 1' },
      tipo: { id: 3, codigo: 'TIPO1', descripcion: 'Tipo 1' },
      registrado_por: { id: 1, nombre: 'Usuario 1' },
    };

    const createData = {
      valor: 25.5,
      fecha_medicion: new Date('2024-01-15'),
      lugar_id: 1,
      unidad_id: 2,
      tipo_id: 3,
      origen_id: 4,
      notas: 'Medición de prueba',
    };

    (prisma.lugar.findFirst as jest.Mock).mockResolvedValue({ id: 1, nombre: 'Lugar 1' });
    (prisma.unidad.findFirst as jest.Mock).mockResolvedValue({ id: 2, nombre: 'Unidad 1' });
    (prisma.tipoRegistro.findUnique as jest.Mock).mockResolvedValue({ id: 3, codigo: 'TIPO1' });
    (prisma.origenDato.findFirst as jest.Mock).mockResolvedValue({ id: 4, nombre: 'Origen 1' });
    (prisma.ciclo.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.medicion.create as jest.Mock).mockResolvedValue(mockMedicion);

    const result = await MedicionesService.create(createData, 1, '127.0.0.1');

    expect(result.id).toBe(1);
    expect(result.valor).toBe(25.5);
  });

  it('debe lanzar error si unidad no existe', async () => {
    const createData = {
      valor: 25.5,
      fecha_medicion: new Date('2024-01-15'),
      lugar_id: 1,
      unidad_id: 999,
      tipo_id: 3,
      origen_id: 4,
    };

    (prisma.lugar.findFirst as jest.Mock).mockResolvedValue({ id: 1, nombre: 'Lugar 1' });
    (prisma.unidad.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(MedicionesService.create(createData, 1, '127.0.0.1')).rejects.toThrow(
      'Unidad con ID 999 no encontrada o eliminada'
    );
  });

  it('debe lanzar error si lugar no existe', async () => {
    const createData = {
      valor: 25.5,
      fecha_medicion: new Date('2024-01-15'),
      lugar_id: 999,
      unidad_id: 2,
      tipo_id: 3,
      origen_id: 4,
    };

    (prisma.lugar.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(MedicionesService.create(createData, 1, '127.0.0.1')).rejects.toThrow(
      'Lugar con ID 999 no encontrado o eliminado'
    );
  });

  it('debe lanzar error si tipoRegistro no existe', async () => {
    const createData = {
      valor: 25.5,
      fecha_medicion: new Date('2024-01-15'),
      lugar_id: 1,
      unidad_id: 2,
      tipo_id: 999,
      origen_id: 4,
    };

    (prisma.lugar.findFirst as jest.Mock).mockResolvedValue({ id: 1, nombre: 'Lugar 1' });
    (prisma.unidad.findFirst as jest.Mock).mockResolvedValue({ id: 2, nombre: 'Unidad 1' });
    (prisma.tipoRegistro.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(MedicionesService.create(createData, 1, '127.0.0.1')).rejects.toThrow(
      'Tipo de registro con ID 999 no encontrado'
    );
  });

  it('debe lanzar error si autor no existe', async () => {
    const createData = {
      valor: 25.5,
      fecha_medicion: new Date('2024-01-15'),
      lugar_id: 1,
      unidad_id: 2,
      tipo_id: 3,
      origen_id: 4,
    };

    (prisma.lugar.findFirst as jest.Mock).mockResolvedValue({ id: 1, nombre: 'Lugar 1' });
    (prisma.unidad.findFirst as jest.Mock).mockResolvedValue({ id: 2, nombre: 'Unidad 1' });
    (prisma.tipoRegistro.findUnique as jest.Mock).mockResolvedValue({ id: 3, codigo: 'TIPO1' });
    (prisma.origenDato.findFirst as jest.Mock).mockResolvedValue({ id: 4, nombre: 'Origen 1' });
    (prisma.medicion.create as jest.Mock).mockRejectedValue(
      new Error('Foreign key constraint failed')
    );

    await expect(MedicionesService.create(createData, 999, '127.0.0.1')).rejects.toThrow();
  });
});

describe('MedicionesService - update', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe actualizar medición existente', async () => {
    const mockMedicionExistente = {
      id: 1,
      valor: 25.5,
      fecha_medicion: new Date('2024-01-15'),
      lugar_id: 1,
      unidad_id: 2,
      tipo_id: 3,
      registrado_por_id: 1,
      notas: 'Notas antiguas',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      lugar: { id: 1, nombre: 'Lugar 1' },
      unidad: { id: 2, nombre: 'Unidad 1' },
      tipo: { id: 3, codigo: 'TIPO1', descripcion: 'Tipo 1' },
      registrado_por: { id: 1, nombre: 'Usuario 1' },
    };

    const mockMedicionActualizada = {
      ...mockMedicionExistente,
      valor: 30.5,
      notas: 'Notas actualizadas',
    };

    const updateData = {
      valor: 30.5,
      notas: 'Notas actualizadas',
    };

    (prisma.medicion.findUnique as jest.Mock).mockResolvedValue(mockMedicionExistente);
    (prisma.medicion.update as jest.Mock).mockResolvedValue(mockMedicionActualizada);

    const result = await MedicionesService.update(1, updateData, 1, '127.0.0.1');

    expect(result.valor).toBe(30.5);
    expect(result.notas).toBe('Notas actualizadas');
  });

  it('debe lanzar error si medición no existe', async () => {
    const updateData = {
      valor: 30.5,
    };

    (prisma.medicion.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(MedicionesService.update(999, updateData, 1, '127.0.0.1')).rejects.toThrow(
      'Medición con ID 999 no encontrada'
    );
  });

  it('debe registrar cambios en bitácora', async () => {
    const mockMedicionExistente = {
      id: 1,
      valor: 25.5,
      fecha_medicion: new Date('2024-01-15'),
      lugar_id: 1,
      unidad_id: 2,
      tipo_id: 3,
      registrado_por_id: 1,
      notas: 'Notas antiguas',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      lugar: { id: 1, nombre: 'Lugar 1' },
      unidad: { id: 2, nombre: 'Unidad 1' },
      tipo: { id: 3, codigo: 'TIPO1', descripcion: 'Tipo 1' },
      registrado_por: { id: 1, nombre: 'Usuario 1' },
    };

    const mockMedicionActualizada = {
      ...mockMedicionExistente,
      valor: 30.5,
    };

    const updateData = {
      valor: 30.5,
    };

    (prisma.medicion.findUnique as jest.Mock).mockResolvedValue(mockMedicionExistente);
    (prisma.medicion.update as jest.Mock).mockResolvedValue(mockMedicionActualizada);
    (registrarCambio as jest.Mock).mockResolvedValue(undefined);

    await MedicionesService.update(1, updateData, 1, '127.0.0.1');

    expect(registrarCambio).toHaveBeenCalledWith(
      'mediciones',
      1,
      'UPDATE',
      expect.objectContaining({
        valor: expect.objectContaining({
          anterior: 25.5,
          nuevo: 30.5,
        }),
      }),
      1,
      '127.0.0.1'
    );
  });
});

describe('MedicionesService - softDelete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe hacer soft delete de medición', async () => {
    const mockMedicion = {
      id: 1,
      valor: 25.5,
      fecha_medicion: new Date('2024-01-15'),
      lugar_id: 1,
      unidad_id: 2,
      tipo_id: 3,
      registrado_por_id: 1,
      notas: 'Medición de prueba',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      lugar: { id: 1, nombre: 'Lugar 1' },
      unidad: { id: 2, nombre: 'Unidad 1' },
      tipo: { id: 3, codigo: 'TIPO1', descripcion: 'Tipo 1' },
      registrado_por: { id: 1, nombre: 'Usuario 1' },
    };

    const mockMedicionEliminada = {
      ...mockMedicion,
      deleted_at: new Date(),
    };

    (prisma.medicion.findUnique as jest.Mock).mockResolvedValue(mockMedicion);
    (prisma.medicion.update as jest.Mock).mockResolvedValue(mockMedicionEliminada);

    const result = await MedicionesService.softDelete(1, 1, '127.0.0.1');

    expect(result.deleted_at).not.toBeNull();
  });

  it('debe lanzar error si medición no existe', async () => {
    (prisma.medicion.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(MedicionesService.softDelete(999, 1, '127.0.0.1')).rejects.toThrow(
      'Medición con ID 999 no encontrada'
    );
  });

  it('debe registrar eliminación en bitácora', async () => {
    const mockMedicion = {
      id: 1,
      valor: 25.5,
      fecha_medicion: new Date('2024-01-15'),
      lugar_id: 1,
      unidad_id: 2,
      tipo_id: 3,
      registrado_por_id: 1,
      notas: 'Medición de prueba',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      lugar: { id: 1, nombre: 'Lugar 1' },
      unidad: { id: 2, nombre: 'Unidad 1' },
      tipo: { id: 3, codigo: 'TIPO1', descripcion: 'Tipo 1' },
      registrado_por: { id: 1, nombre: 'Usuario 1' },
    };

    const mockMedicionEliminada = {
      ...mockMedicion,
      deleted_at: new Date(),
    };

    (prisma.medicion.findUnique as jest.Mock).mockResolvedValue(mockMedicion);
    (prisma.medicion.update as jest.Mock).mockResolvedValue(mockMedicionEliminada);
    (registrarCambio as jest.Mock).mockResolvedValue(undefined);

    await MedicionesService.softDelete(1, 1, '127.0.0.1');

    expect(registrarCambio).toHaveBeenCalledWith(
      'mediciones',
      1,
      'SOFT_DELETE',
      expect.any(Object),
      1,
      '127.0.0.1'
    );
  });
});

describe('MedicionesService - exportToCSV', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe generar CSV con datos', async () => {
    const mockMediciones = [
      {
        id: 1,
        valor: 25.5,
        fecha_medicion: new Date('2024-01-15'),
        lugar_id: 1,
        unidad_id: 2,
        tipo_id: 3,
        registrado_por_id: 1,
        notas: 'Medición de prueba',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        lugar: { id: 1, nombre: 'Lugar 1' },
        unidad: { id: 2, nombre: 'Unidad 1' },
        tipo: { id: 3, codigo: 'TIPO1', descripcion: 'Tipo 1' },
        origen: { id: 1, nombre: 'Origen 1' },
        registrado_por: { id: 1, nombre: 'Usuario 1' },
      },
    ];

    (prisma.medicion.findMany as jest.Mock).mockResolvedValue(mockMediciones);

    const result = await MedicionesExportService.exportToCSV({});

    expect(result).toContain('\uFEFF');
    expect(result).toContain('id,valor,fecha,unidad,lugar,tipoRegistro,observaciones,createdAt');
    expect(result).toContain('1,25.5');
  });

  it('debe incluir headers correctos', async () => {
    const mockMediciones: any[] = [];

    (prisma.medicion.findMany as jest.Mock).mockResolvedValue(mockMediciones);

    const result = await MedicionesExportService.exportToCSV({});

    expect(result).toContain('id,valor,fecha,unidad,lugar,tipoRegistro,observaciones,createdAt');
  });

  it('debe manejar lista vacía', async () => {
    const mockMediciones: any[] = [];

    (prisma.medicion.findMany as jest.Mock).mockResolvedValue(mockMediciones);

    const result = await MedicionesExportService.exportToCSV({});

    expect(result).toContain('\uFEFF');
    expect(result).toContain('id,valor,fecha,unidad,lugar,tipoRegistro,observaciones,createdAt');
  });

  it('debe manejar errores de escritura', async () => {
    (prisma.medicion.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

    await expect(MedicionesExportService.exportToCSV({})).rejects.toThrow('Error al generar el archivo CSV');
  });
});
