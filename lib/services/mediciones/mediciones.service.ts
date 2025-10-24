/**
 * Servicio para la lógica de negocio de mediciones
 * Encapsula todas las operaciones CRUD y lógica relacionada con mediciones
 */

import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
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
  validarRelacionesBatch,
} from './validators/mediciones-relations.validator';
import { buildWhereClause, getIncludes } from './queries/mediciones-queries';

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
    const where = buildWhereClause(validatedFilters);

    // Calcular paginación
    const skip = (validatedFilters.page! - 1) * validatedFilters.limit!;

    // Obtener total y datos en paralelo
    const [total, data] = await Promise.all([
      prisma.medicion.count({ where }),
      prisma.medicion.findMany({
        where,
        skip,
        take: validatedFilters.limit,
        include: getIncludes(),
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
      include: getIncludes(),
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

    // Validar relaciones en lote
    await validarRelacionesBatch({
      lugar_id: validatedData.lugar_id,
      unidad_id: validatedData.unidad_id,
      tipo_id: validatedData.tipo_id,
      origen_id: validatedData.origen_id,
    });

    // Crear medición
    const medicion = await prisma.medicion.create({
      data: {
        valor: validatedData.valor,
        fecha_medicion: validatedData.fecha_medicion,
        lugar_id: validatedData.lugar_id,
        unidad_id: validatedData.unidad_id,
        tipo_id: validatedData.tipo_id,
        origen_id: validatedData.origen_id,
        registrado_por_id: userId,
        notas: validatedData.notas,
      },
      include: getIncludes(),
    });



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
      include: getIncludes(),
    });

    if (!medicionExistente) {
      logger.error('Medición no encontrada para actualizar');
      throw new Error(`Medición con ID ${id} no encontrada`);
    }

    // Validar relaciones si se actualizan
    if (validatedData.lugar_id !== undefined) {
      await validarLugar(validatedData.lugar_id);
    }

    if (validatedData.unidad_id !== undefined) {
      await validarUnidad(validatedData.unidad_id);
    }

    if (validatedData.tipo_id !== undefined) {
      await validarTipo(validatedData.tipo_id);
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
      include: getIncludes(),
    });



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
      include: getIncludes(),
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
      include: getIncludes(),
    });



    logger.info('Medición eliminada exitosamente (soft delete)', { id: medicion.id });

    return medicion;
  }
}
