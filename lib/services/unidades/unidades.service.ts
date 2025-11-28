/**
 * Servicio para la lógica de negocio de Unidades
 */

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { logger } from '@/lib/utils/logger';
import { buildWhereClause, getIncludes } from './queries/unidades-queries';

export interface UnidadesPaginados {
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

export class UnidadesService {
    /**
     * Listar unidades con filtros y paginación
     */
    static async findAll(
        filters: any,
        page: number = 1,
        limit: number = 20,
        includeAll: boolean = true
    ): Promise<UnidadesPaginados> {
        logger.info('Iniciando búsqueda de unidades', { filters, page, limit });

        const validatedPage = Math.max(1, page);
        const validatedLimit = Math.min(Math.max(1, limit), 100);

        const where = buildWhereClause(filters);
        const skip = (validatedPage - 1) * validatedLimit;

        const [total, data] = await Promise.all([
            prisma.unidad.count({ where }),
            prisma.unidad.findMany({
                where,
                skip,
                take: validatedLimit,
                include: getIncludes(includeAll),
                orderBy: {
                    nombre: 'asc',
                },
            }),
        ]);

        const totalPages = Math.ceil(total / validatedLimit);

        return {
            data,
            pagination: {
                page: validatedPage,
                limit: validatedLimit,
                total,
                totalPages,
                hasNext: validatedPage < totalPages,
                hasPrevious: validatedPage > 1,
            },
        };
    }

    /**
     * Obtener una unidad por ID
     */
    static async findById(id: number, includeAll: boolean = true) {
        logger.info('Buscando unidad por ID', { id });

        const unidad = await prisma.unidad.findUnique({
            where: { id, deleted_at: null },
            include: getIncludes(includeAll),
        });

        if (unidad) {
            logger.info('Unidad encontrada', { id });
        } else {
            logger.warn('Unidad no encontrada', { id });
        }

        return unidad;
    }

    /**
     * Crear una nueva unidad
     */
    static async create(data: any, userId: number) {
        logger.info('Creando nueva unidad', { data, userId });

        // Validaciones básicas
        if (!data.nombre || typeof data.nombre !== 'string' || data.nombre.trim().length === 0) {
            throw new Error('El nombre es requerido');
        }

        if (!data.sigla || typeof data.sigla !== 'string' || data.sigla.trim().length === 0) {
            throw new Error('La sigla es requerida');
        }

        const unidad = await prisma.unidad.create({
            data: {
                nombre: data.nombre.trim(),
                sigla: data.sigla.trim(),
                creado_por_id: userId,
            },
            include: getIncludes(true),
        });

        logger.info('Unidad creada exitosamente', { id: unidad.id });
        return unidad;
    }

    /**
     * Actualizar una unidad
     */
    static async update(id: number, data: any, userId: number) {
        logger.info('Actualizando unidad', { id, data, userId });

        // Buscar unidad existente
        const unidadExistente = await prisma.unidad.findUnique({
            where: { id, deleted_at: null },
        });

        if (!unidadExistente) {
            throw new Error(`Unidad con ID ${id} no encontrada`);
        }

        // Validar nombre si se actualiza
        if (data.nombre !== undefined) {
            if (typeof data.nombre !== 'string' || data.nombre.trim().length === 0) {
                throw new Error('El nombre es requerido');
            }
        }

        // Validar sigla si se actualiza
        if (data.sigla !== undefined) {
            if (typeof data.sigla !== 'string' || data.sigla.trim().length === 0) {
                throw new Error('La sigla es requerida');
            }
        }

        const unidad = await prisma.unidad.update({
            where: { id },
            data: {
                ...(data.nombre !== undefined && { nombre: data.nombre.trim() }),
                ...(data.sigla !== undefined && { sigla: data.sigla.trim() }),
            },
            include: getIncludes(true),
        });

        logger.info('Unidad actualizada exitosamente', { id: unidad.id });
        return unidad;
    }

    /**
     * Borrado lógico de una unidad
     */
    static async softDelete(id: number) {
        logger.info('Eliminando unidad (soft delete)', { id });

        // Verificar si tiene mediciones asociadas
        const countMediciones = await prisma.medicion.count({
            where: { unidad_id: id, deleted_at: null }
        });

        if (countMediciones > 0) {
            throw new Error("No se puede eliminar una unidad que tiene mediciones asociadas.");
        }

        return prisma.unidad.update({
            where: { id },
            data: { deleted_at: new Date() }
        });
    }
}
