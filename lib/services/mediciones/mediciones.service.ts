/**
 * Servicio para la lógica de negocio de mediciones
 * Encapsula todas las operaciones CRUD y lógica relacionada con mediciones
 */

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
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
import { CiclosService } from '../ciclos';
import { calcularDiasDesdeSiembra } from '@/lib/utils/cultivo';
import {
  validarRelacionesBatch,
  validarLugar,
  validarUnidad,
  validarTipo,
  validarOrigen,
} from './validators/mediciones-relations.validator';
import { buildWhereClause, getIncludes } from './queries/mediciones-queries';
import { registrarCambio, cambiosCreate, cambiosUpdate, cambiosSoftDelete } from '@/lib/bitacora';

/**
 * Tipo para el resultado paginado de mediciones
 */
export interface MedicionesPaginadas {
  data: any[];
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
    limit: number = 20,
    includeAll: boolean = true
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
    const [total, rawData] = await Promise.all([
      prisma.medicion.count({ where }),
      prisma.medicion.findMany({
        where,
        skip,
        take: validatedFilters.limit,
        include: getIncludes(includeAll),
        orderBy: {
          fecha_medicion: 'desc',
        },
      }),
    ]);

    // Enriquecer datos con cálculo de días desde siembra si hay ciclo asociado
    const data = rawData.map((medicion: any) => {
      let dias_desde_siembra = null;
      if (medicion.ciclo && medicion.ciclo.fecha_siembra) {
        dias_desde_siembra = calcularDiasDesdeSiembra(
          medicion.fecha_medicion,
          medicion.ciclo.fecha_siembra
        );
      }
      return {
        ...medicion,
        dias_desde_siembra,
      };
    });

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
  static async findById(id: number, minimal: boolean = false): Promise<Prisma.MedicionGetPayload<{
    include: ReturnType<typeof getIncludes>;
  }> | null> {
    logger.info('Buscando medición por ID', { id });

    // Validar ID
    const validated = medicionIdSchema.parse({ id });

    const medicion = await prisma.medicion.findUnique({
      where: {
        id: validated.id,
        deleted_at: null,
      },
      include: getIncludes(!minimal),
    }) as any;

    if (medicion) {
      logger.info('Medición encontrada', { id });

      // Enriquecer con cálculo de días
      let dias_desde_siembra = null;
      if (medicion.ciclo && medicion.ciclo.fecha_siembra) {
        dias_desde_siembra = calcularDiasDesdeSiembra(
          medicion.fecha_medicion,
          medicion.ciclo.fecha_siembra
        );
      }
      medicion.dias_desde_siembra = dias_desde_siembra;
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
    clientIp: string,
    includeAll: boolean = true
  ): Promise<Prisma.MedicionGetPayload<{
    include: ReturnType<typeof getIncludes>;
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

    // Si no se proporciona ciclo_id, buscar el ciclo activo del lugar
    let cicloIdEfectivo = validatedData.ciclo_id;
    if (!cicloIdEfectivo) {
      const cicloActivo = await CiclosService.findActiveByLugar(validatedData.lugar_id);
      if (cicloActivo) {
        cicloIdEfectivo = cicloActivo.id;
        logger.info('Asignando ciclo activo automáticamente', { cicloId: cicloIdEfectivo });
      }
    }

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
        ciclo_id: cicloIdEfectivo,
        notas: validatedData.notas,
      },
      include: getIncludes(includeAll),
    });

    // Registrar en bitácora
    await registrarCambio('mediciones', medicion.id, 'CREATE', cambiosCreate(medicion), userId, clientIp);



    const result = medicion as any;
    if (result.ciclo && result.ciclo.fecha_siembra) {
      result.dias_desde_siembra = calcularDiasDesdeSiembra(
        result.fecha_medicion,
        result.ciclo.fecha_siembra
      );
    }

    logger.info('Medición creada exitosamente', { id: medicion.id });

    return result;
  }

  /**
   * Actualizar medición existente
   */
  static async update(
    id: number,
    data: UpdateMedicionInput,
    userId: number,
    clientIp: string,
    includeAll: boolean = true
  ): Promise<Prisma.MedicionGetPayload<{
    include: ReturnType<typeof getIncludes>;
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
      include: getIncludes(false),
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

    if (validatedData.origen_id !== undefined) {
      await validarOrigen(validatedData.origen_id);
    }



    const medicion = await prisma.medicion.update({
      where: {
        id: validatedId.id,
      },
      data: {
        ...validatedData,
        updated_at: new Date(),
      },
      include: getIncludes(includeAll),
    });

    // Registrar en bitácora
    await registrarCambio(
      'mediciones',
      medicion.id,
      'UPDATE',
      cambiosUpdate({ valor: { anterior: medicionExistente.valor, nuevo: medicion.valor } }),
      userId,
      clientIp
    );



    const result = medicion as any;
    if (result.ciclo && result.ciclo.fecha_siembra) {
      result.dias_desde_siembra = calcularDiasDesdeSiembra(
        result.fecha_medicion,
        result.ciclo.fecha_siembra
      );
    }

    logger.info('Medición actualizada exitosamente', { id: medicion.id });

    return result;
  }

  /**
   * Soft delete de medición
   */
  static async softDelete(
    id: number,
    userId: number,
    clientIp: string,
    includeAll: boolean = true
  ): Promise<Prisma.MedicionGetPayload<{
    include: ReturnType<typeof getIncludes>;
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
      include: getIncludes(false),
    });

    if (!medicionExistente) {
      logger.error('Medición no encontrada para eliminar');
      throw new Error(`Medición con ID ${id} no encontrada`);
    }

    const medicion = await prisma.medicion.update({
      where: {
        id: validatedId.id,
      },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
      include: getIncludes(includeAll),
    });

    // Registrar en bitácora
    await registrarCambio('mediciones', medicion.id, 'SOFT_DELETE', cambiosSoftDelete(medicion), userId, clientIp);



    logger.info('Medición eliminada exitosamente (soft delete)', { id: medicion.id });

    return medicion;
  }
}
