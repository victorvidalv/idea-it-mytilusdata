/**
 * Servicio para la lógica de negocio de mediciones
 * Encapsula todas las operaciones CRUD y lógica relacionada con mediciones
 */

import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { ApiError } from '@/lib/utils/errors';
import {
  createMedicionSchema,
  updateMedicionSchema,
  filterMedicionesSchema,
  medicionIdSchema,
  type CreateMedicionInput,
  type UpdateMedicionInput,
  type FilterMedicionesInput,
} from '@/lib/validators/mediciones.validator';
import {
  registrarCambio,
  cambiosCreate,
  cambiosUpdate,
  cambiosSoftDelete,
} from '@/lib/bitacora';
import type { Prisma } from '@prisma/client';

/**
 * Tipo para el resultado paginado de mediciones
 */
export interface MedicionesPaginadas {
  data: Prisma.MedicionGetPayload<{
    include: {
      lugar: true;
      unidad: true;
      tipo: true;
      registrado_por: true;
    };
  }>[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * Clase de servicio para mediciones
 * Contiene métodos estáticos para todas las operaciones de negocio
 */
export class MedicionesService {
  /**
   * Listar mediciones con filtros y paginación
   */
  static async findAll(
    filters: FilterMedicionesInput,
    page: number = 1,
    limit: number = 20
  ): Promise<MedicionesPaginadas> {
    logger.info('Iniciando búsqueda de mediciones', { filters, page, limit });

    // Validar filtros
    const validatedFilters = filterMedicionesSchema.parse({
      ...filters,
      page,
      limit,
    });

    // Construir cláusula where
    const where = this.buildWhereClause(validatedFilters);

    // Calcular paginación
    const skip = (validatedFilters.page! - 1) * validatedFilters.limit!;

    // Obtener total y datos en paralelo
    const [total, data] = await Promise.all([
      prisma.medicion.count({ where }),
      prisma.medicion.findMany({
        where,
        skip,
        take: validatedFilters.limit,
        include: this.getIncludes(),
        orderBy: {
          fecha_medicion: 'desc',
        },
      }),
    ]);

    const totalPages = Math.ceil(total / validatedFilters.limit!);

    const pagination = {
      page: validatedFilters.page!,
      limit: validatedFilters.limit!,
      total,
      totalPages,
      hasNext: validatedFilters.page! < totalPages,
      hasPrevious: validatedFilters.page! > 1,
    };

    logger.info('Búsqueda de mediciones completada', {
      total,
      page: pagination.page,
      totalPages,
    });

    return { data, pagination };
  }

  /**
   * Obtener medición por ID
   */
  static async findById(id: number): Promise<Prisma.MedicionGetPayload<{
    include: {
      lugar: true;
      unidad: true;
      tipo: true;
      registrado_por: true;
    };
  }> | null> {
    logger.info('Buscando medición por ID', { id });

    // Validar ID
    const validated = medicionIdSchema.parse({ id });

    const medicion = await prisma.medicion.findUnique({
      where: {
        id: validated.id,
        deleted_at: null,
      },
      include: this.getIncludes(),
    });

    if (medicion) {
      logger.info('Medición encontrada', { id });
    } else {
      logger.warn('Medición no encontrada', { id });
    }

    return medicion;
  }

  /**
   * Crear nueva medición
   */
  static async create(
    data: CreateMedicionInput,
    userId: number,
    clientIp: string
  ): Promise<Prisma.MedicionGetPayload<{
    include: {
      lugar: true;
      unidad: true;
      tipo: true;
      registrado_por: true;
    };
  }>> {
    logger.info('Creando nueva medición', { data, userId });

    // Validar datos
    const validatedData = createMedicionSchema.parse(data);

    // Validar que el lugar exista y no esté eliminado
    const lugar = await prisma.lugar.findFirst({
      where: {
        id: validatedData.lugar_id,
        deleted_at: null,
      },
    });

    if (!lugar) {
      logger.error('Lugar no encontrado o eliminado');
      throw new Error(
        `Lugar con ID ${validatedData.lugar_id} no encontrado o eliminado`
      );
    }

    // Validar que la unidad exista y no esté eliminada
    const unidad = await prisma.unidad.findFirst({
      where: {
        id: validatedData.unidad_id,
        deleted_at: null,
      },
    });

    if (!unidad) {
      logger.error('Unidad no encontrada o eliminada');
      throw new Error(
        `Unidad con ID ${validatedData.unidad_id} no encontrada o eliminada`
      );
    }

    // Validar que el tipo exista
    const tipo = await prisma.tipoRegistro.findUnique({
      where: {
        id: validatedData.tipo_id,
      },
    });

    if (!tipo) {
      logger.error('Tipo de registro no encontrado');
      throw new Error(
        `Tipo de registro con ID ${validatedData.tipo_id} no encontrado`
      );
    }

    // Crear medición
    const medicion = await prisma.medicion.create({
      data: {
        valor: validatedData.valor,
        fecha_medicion: validatedData.fecha_medicion,
        lugar_id: validatedData.lugar_id,
        unidad_id: validatedData.unidad_id,
        tipo_id: validatedData.tipo_id,
        registrado_por_id: userId,
        notas: validatedData.notas,
      },
      include: this.getIncludes(),
    });

    // Registrar en bitácora
    await registrarCambio(
      'mediciones',
      medicion.id,
      'CREATE',
      cambiosCreate(validatedData),
      userId,
      clientIp
    );

    logger.info('Medición creada exitosamente', { id: medicion.id });

    return medicion;
  }

  /**
   * Actualizar medición existente
   */
  static async update(
    id: number,
    data: UpdateMedicionInput,
    userId: number,
    clientIp: string
  ): Promise<Prisma.MedicionGetPayload<{
    include: {
      lugar: true;
      unidad: true;
      tipo: true;
      registrado_por: true;
    };
  }>> {
    logger.info('Actualizando medición', { id, data, userId });

    // Validar ID y datos
    const validatedId = medicionIdSchema.parse({ id });
    const validatedData = updateMedicionSchema.parse(data);

    // Buscar medición existente
    const medicionExistente = await prisma.medicion.findUnique({
      where: {
        id: validatedId.id,
        deleted_at: null,
      },
      include: this.getIncludes(),
    });

    if (!medicionExistente) {
      logger.error('Medición no encontrada para actualizar');
      throw new Error(`Medición con ID ${id} no encontrada`);
    }

    // Validar relaciones si se actualizan
    if (validatedData.lugar_id !== undefined) {
      const lugar = await prisma.lugar.findFirst({
        where: {
          id: validatedData.lugar_id,
          deleted_at: null,
        },
      });

      if (!lugar) {
        logger.error('Lugar no encontrado o eliminado');
        throw new Error(
          `Lugar con ID ${validatedData.lugar_id} no encontrado o eliminado`
        );
      }
    }

    if (validatedData.unidad_id !== undefined) {
      const unidad = await prisma.unidad.findFirst({
        where: {
          id: validatedData.unidad_id,
          deleted_at: null,
        },
      });

      if (!unidad) {
        logger.error('Unidad no encontrada o eliminada');
        throw new Error(
          `Unidad con ID ${validatedData.unidad_id} no encontrada o eliminada`
        );
      }
    }

    if (validatedData.tipo_id !== undefined) {
      const tipo = await prisma.tipoRegistro.findUnique({
        where: {
          id: validatedData.tipo_id,
        },
      });

      if (!tipo) {
        logger.error('Tipo de registro no encontrado');
        throw new Error(
          `Tipo de registro con ID ${validatedData.tipo_id} no encontrado`
        );
      }
    }

    // Calcular cambios - solo incluir campos que se están actualizando
    const cambios: Record<string, { anterior: unknown; nuevo: unknown }> = {};
    if (validatedData.valor !== undefined) {
      cambios.valor = { anterior: medicionExistente.valor, nuevo: validatedData.valor };
    }
    if (validatedData.fecha_medicion !== undefined) {
      cambios.fecha_medicion = { anterior: medicionExistente.fecha_medicion, nuevo: validatedData.fecha_medicion };
    }
    if (validatedData.lugar_id !== undefined) {
      cambios.lugar_id = { anterior: medicionExistente.lugar_id, nuevo: validatedData.lugar_id };
    }
    if (validatedData.unidad_id !== undefined) {
      cambios.unidad_id = { anterior: medicionExistente.unidad_id, nuevo: validatedData.unidad_id };
    }
    if (validatedData.tipo_id !== undefined) {
      cambios.tipo_id = { anterior: medicionExistente.tipo_id, nuevo: validatedData.tipo_id };
    }
    if (validatedData.notas !== undefined) {
      cambios.notas = { anterior: medicionExistente.notas, nuevo: validatedData.notas };
    }

    // Actualizar medición
    const medicion = await prisma.medicion.update({
      where: {
        id: validatedId.id,
      },
      data: {
        ...validatedData,
        updated_at: new Date(),
      },
      include: this.getIncludes(),
    });

    // Registrar en bitácora si hubo cambios
    if (Object.keys(cambios).length > 0) {
      await registrarCambio(
        'mediciones',
        medicion.id,
        'UPDATE',
        cambios,
        userId,
        clientIp
      );
    }

    logger.info('Medición actualizada exitosamente', { id: medicion.id });

    return medicion;
  }

  /**
   * Soft delete de medición
   */
  static async softDelete(
    id: number,
    userId: number,
    clientIp: string
  ): Promise<Prisma.MedicionGetPayload<{
    include: {
      lugar: true;
      unidad: true;
      tipo: true;
      registrado_por: true;
    };
  }>> {
    logger.info('Eliminando medición (soft delete)', { id, userId });

    // Validar ID
    const validatedId = medicionIdSchema.parse({ id });

    // Buscar medición existente
    const medicionExistente = await prisma.medicion.findUnique({
      where: {
        id: validatedId.id,
        deleted_at: null,
      },
      include: this.getIncludes(),
    });

    if (!medicionExistente) {
      logger.error('Medición no encontrada para eliminar');
      throw new Error(`Medición con ID ${id} no encontrada`);
    }

    // Actualizar deleted_at y updated_at
    const medicion = await prisma.medicion.update({
      where: {
        id: validatedId.id,
      },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
      include: this.getIncludes(),
    });

    // Registrar en bitácora
    await registrarCambio(
      'mediciones',
      medicion.id,
      'SOFT_DELETE',
      cambiosSoftDelete(),
      userId,
      clientIp
    );

    logger.info('Medición eliminada exitosamente (soft delete)', { id: medicion.id });

    return medicion;
  }

  /**
   * Exportar mediciones a CSV directamente en memoria (sin escribir a disco)
   */
  static async exportToCSV(
    filters: FilterMedicionesInput
  ): Promise<string> {
    logger.info('Exportando mediciones a CSV', { filters });

    try {
      // Validar filtros
      const validatedFilters = filterMedicionesSchema.parse(filters);

      // Construir cláusula where
      const where = this.buildWhereClause(validatedFilters);

      // Obtener todas las mediciones sin paginación
      const mediciones = await prisma.medicion.findMany({
        where,
        include: this.getIncludes(),
        orderBy: {
          fecha_medicion: 'desc',
        },
      });

      // Definir headers del CSV
      const headers = ['id', 'valor', 'fecha', 'unidad', 'lugar', 'tipoRegistro', 'observaciones', 'createdAt'];

      // Función para escapar valores CSV (manejar comas, comillas y saltos de línea)
      const escapeCSV = (value: string | number | null | undefined): string => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        // Escapar si contiene comas, comillas o saltos de línea
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      // Generar filas del CSV
      const rows = mediciones.map((m) => [
        escapeCSV(m.id),
        escapeCSV(m.valor.toString()),
        escapeCSV(m.fecha_medicion.toISOString()),
        escapeCSV(m.unidad.nombre),
        escapeCSV(m.lugar.nombre),
        escapeCSV(m.tipo.descripcion || m.tipo.codigo),
        escapeCSV(m.notas || ''),
        escapeCSV(m.created_at.toISOString()),
      ].join(','));

      // Combinar headers y filas
      const csvContent = [headers.join(','), ...rows].join('\n');

      // Agregar BOM para compatibilidad con Excel
      const csvContentWithBOM = '\uFEFF' + csvContent;

      logger.info('CSV generado exitosamente en memoria', {
        totalRegistros: mediciones.length,
      });

      return csvContentWithBOM;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      logger.error('Error al exportar mediciones a CSV', errorObj);
      throw ApiError.internal('Error al generar el archivo CSV');
    }
  }

  /**
   * Construir cláusula where de Prisma basado en filtros
   */
  private static buildWhereClause(
    filters: FilterMedicionesInput
  ): Prisma.MedicionWhereInput {
    const where: Prisma.MedicionWhereInput = {
      deleted_at: null, // Siempre filtrar registros eliminados
    };

    // Filtro por lugar
    if (filters.lugar_id) {
      where.lugar_id = filters.lugar_id;
    }

    // Filtro por unidad
    if (filters.unidad_id) {
      where.unidad_id = filters.unidad_id;
    }

    // Filtro por tipo
    if (filters.tipo_id) {
      where.tipo_id = filters.tipo_id;
    }

    // Filtro por autor
    if (filters.autor_id) {
      where.registrado_por_id = filters.autor_id;
    }

    // Filtro por rango de fechas
    if (filters.fecha_desde || filters.fecha_hasta) {
      where.fecha_medicion = {};
      if (filters.fecha_desde) {
        where.fecha_medicion.gte = filters.fecha_desde;
      }
      if (filters.fecha_hasta) {
        where.fecha_medicion.lte = filters.fecha_hasta;
      }
    }

    return where;
  }

  /**
   * Obtener objeto de includes para relaciones
   */
  private static getIncludes() {
    return {
      lugar: true,
      unidad: true,
      tipo: true,
      registrado_por: true,
    };
  }
}
