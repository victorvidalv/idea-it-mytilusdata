/**
 * Servicio para la lógica de negocio de Lugares
 */

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { logger } from '@/lib/utils/logger';
import { buildWhereClause, getIncludes } from './queries/lugares-queries';

export interface LugaresPaginados {
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

export class LugaresService {
    /**
     * Listar lugares con filtros y paginación
     */
    static async findAll(
        filters: any,
        page: number = 1,
        limit: number = 20,
        includeAll: boolean = true
    ): Promise<LugaresPaginados> {
        logger.info('Iniciando búsqueda de lugares', { filters, page, limit });

        const validatedPage = Math.max(1, page);
        const validatedLimit = Math.min(Math.max(1, limit), 100);

        const where = buildWhereClause(filters);
        const skip = (validatedPage - 1) * validatedLimit;

        const [total, data] = await Promise.all([
            prisma.lugar.count({ where }),
            prisma.lugar.findMany({
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
     * Obtener un lugar por ID
     */
    static async findById(id: number, includeAll: boolean = true) {
        logger.info('Buscando lugar por ID', { id });

        const lugar = await prisma.lugar.findUnique({
            where: { id, deleted_at: null },
            include: getIncludes(includeAll),
        });

        if (lugar) {
            logger.info('Lugar encontrado', { id });
        } else {
            logger.warn('Lugar no encontrado', { id });
        }

        return lugar;
    }

    /**
     * Crear un nuevo lugar
     */
    static async create(data: any, userId: number) {
        logger.info('Creando nuevo lugar', { data, userId });

        // Validaciones básicas
        if (!data.nombre || typeof data.nombre !== 'string' || data.nombre.trim().length === 0) {
            throw new Error('El nombre es requerido');
        }

        // Validar coordenadas si se proporcionan
        if (data.latitud !== undefined && data.latitud !== null) {
            const lat = parseFloat(data.latitud);
            if (isNaN(lat) || lat < -90 || lat > 90) {
                throw new Error('Latitud inválida (debe estar entre -90 y 90)');
            }
        }

        if (data.longitud !== undefined && data.longitud !== null) {
            const lng = parseFloat(data.longitud);
            if (isNaN(lng) || lng < -180 || lng > 180) {
                throw new Error('Longitud inválida (debe estar entre -180 y 180)');
            }
        }

        const lugar = await prisma.lugar.create({
            data: {
                nombre: data.nombre.trim(),
                nota: data.nota?.trim() || null,
                latitud: data.latitud !== undefined && data.latitud !== null ? parseFloat(data.latitud) : null,
                longitud: data.longitud !== undefined && data.longitud !== null ? parseFloat(data.longitud) : null,
                creado_por_id: userId,
            },
            include: getIncludes(true),
        });

        logger.info('Lugar creado exitosamente', { id: lugar.id });
        return lugar;
    }

    /**
     * Actualizar un lugar
     */
    static async update(id: number, data: any, userId: number) {
        logger.info('Actualizando lugar', { id, data, userId });

        // Buscar lugar existente
        const lugarExistente = await prisma.lugar.findUnique({
            where: { id, deleted_at: null },
        });

        if (!lugarExistente) {
            throw new Error(`Lugar con ID ${id} no encontrado`);
        }

        // Validar nombre si se actualiza
        if (data.nombre !== undefined) {
            if (typeof data.nombre !== 'string' || data.nombre.trim().length === 0) {
                throw new Error('El nombre es requerido');
            }
        }

        // Validar coordenadas si se actualizan
        if (data.latitud !== undefined && data.latitud !== null) {
            const lat = parseFloat(data.latitud);
            if (isNaN(lat) || lat < -90 || lat > 90) {
                throw new Error('Latitud inválida (debe estar entre -90 y 90)');
            }
        }

        if (data.longitud !== undefined && data.longitud !== null) {
            const lng = parseFloat(data.longitud);
            if (isNaN(lng) || lng < -180 || lng > 180) {
                throw new Error('Longitud inválida (debe estar entre -180 y 180)');
            }
        }

        const lugar = await prisma.lugar.update({
            where: { id },
            data: {
                ...(data.nombre !== undefined && { nombre: data.nombre.trim() }),
                ...(data.nota !== undefined && { nota: data.nota?.trim() || null }),
                ...(data.latitud !== undefined && { latitud: data.latitud !== null ? parseFloat(data.latitud) : null }),
                ...(data.longitud !== undefined && { longitud: data.longitud !== null ? parseFloat(data.longitud) : null }),
            },
            include: getIncludes(true),
        });

        logger.info('Lugar actualizado exitosamente', { id: lugar.id });
        return lugar;
    }

    /**
     * Borrado lógico de un lugar
     */
    static async softDelete(id: number) {
        logger.info('Eliminando lugar (soft delete)', { id });

        // Verificar si tiene mediciones asociadas
        const countMediciones = await prisma.medicion.count({
            where: { lugar_id: id, deleted_at: null }
        });

        if (countMediciones > 0) {
            throw new Error("No se puede eliminar un lugar que tiene mediciones asociadas.");
        }

        // Verificar si tiene ciclos asociados
        const countCiclos = await prisma.ciclo.count({
            where: { lugar_id: id, deleted_at: null }
        });

        if (countCiclos > 0) {
            throw new Error("No se puede eliminar un lugar que tiene ciclos asociados.");
        }

        return prisma.lugar.update({
            where: { id },
            data: { deleted_at: new Date() }
        });
    }
}
