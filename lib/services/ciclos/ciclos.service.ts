/**
 * Servicio para la lógica de negocio de Ciclos
 */

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { logger } from '@/lib/utils/logger';
import {
    createCicloSchema,
    updateCicloSchema,
    filterCiclosSchema,
    cicloIdSchema,
    type CreateCicloInput,
    type UpdateCicloInput,
    type FilterCiclosInput,
} from '@/lib/validators/ciclos.validator';
import { buildWhereClause, getIncludes } from './queries/ciclos-queries';

export interface CiclosPaginados {
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

export class CiclosService {
    /**
     * Listar ciclos con filtros y paginación
     */
    static async findAll(
        filters: FilterCiclosInput,
        page: number = 1,
        limit: number = 20,
        includeAll: boolean = true
    ): Promise<CiclosPaginados> {
        logger.info('Iniciando búsqueda de ciclos', { filters, page, limit });

        const validatedFilters = filterCiclosSchema.parse({
            ...filters,
            page,
            limit,
        });

        const where = buildWhereClause(validatedFilters);
        const skip = (validatedFilters.page - 1) * validatedFilters.limit;

        const [total, data] = await Promise.all([
            prisma.ciclo.count({ where }),
            prisma.ciclo.findMany({
                where,
                skip,
                take: validatedFilters.limit,
                include: getIncludes(includeAll),
                orderBy: {
                    fecha_siembra: 'desc',
                },
            }),
        ]);

        const totalPages = Math.ceil(total / validatedFilters.limit);

        return {
            data,
            pagination: {
                page: validatedFilters.page,
                limit: validatedFilters.limit,
                total,
                totalPages,
                hasNext: validatedFilters.page < totalPages,
                hasPrevious: validatedFilters.page > 1,
            },
        };
    }

    /**
     * Obtener un ciclo por ID
     */
    static async findById(id: number, includeAll: boolean = true) {
        const validated = cicloIdSchema.parse({ id });
        return prisma.ciclo.findUnique({
            where: { id: validated.id, deleted_at: null },
            include: getIncludes(includeAll),
        });
    }

    /**
     * Crear un nuevo ciclo
     */
    static async create(data: CreateCicloInput, userId: number) {
        const validatedData = createCicloSchema.parse(data);

        // Si el nuevo ciclo está activo, desactivamos los otros ciclos del mismo lugar
        if (validatedData.activo) {
            await prisma.ciclo.updateMany({
                where: {
                    lugar_id: validatedData.lugar_id,
                    activo: true,
                    deleted_at: null,
                },
                data: {
                    activo: false,
                    fecha_finalizacion: new Date(),
                },
            });
        }

        const ciclo = await prisma.ciclo.create({
            data: {
                nombre: validatedData.nombre,
                fecha_siembra: validatedData.fecha_siembra,
                fecha_finalizacion: validatedData.fecha_finalizacion,
                lugar_id: validatedData.lugar_id,
                activo: validatedData.activo,
                notas: validatedData.notas,
                creado_por_id: userId,
            },
            include: getIncludes(true),
        });

        logger.info('Ciclo creado exitosamente', { id: ciclo.id, lugar_id: ciclo.lugar_id });
        return ciclo;
    }

    /**
     * Actualizar un ciclo
     */
    static async update(id: number, data: UpdateCicloInput, userId: number) {
        const validatedId = cicloIdSchema.parse({ id });
        const validatedData = updateCicloSchema.parse(data);

        // Si cambiamos a activo=true, desactivamos los otros
        if (validatedData.activo === true) {
            await prisma.ciclo.updateMany({
                where: {
                    lugar_id: validatedData.lugar_id, // Asumimos que viene o lo buscamos
                    id: { not: validatedId.id },
                    activo: true,
                    deleted_at: null,
                },
                data: {
                    activo: false,
                    fecha_finalizacion: new Date(),
                },
            });
        }

        const ciclo = await prisma.ciclo.update({
            where: { id: validatedId.id },
            data: {
                ...validatedData,
                // No permitimos cambiar lugar_id fácilmente si ya tiene datos
            },
            include: getIncludes(true),
        });

        logger.info('Ciclo actualizado exitosamente', { id: ciclo.id });
        return ciclo;
    }

    /**
     * Borrado lógico de un ciclo
     */
    static async softDelete(id: number) {
        const validatedId = cicloIdSchema.parse({ id });

        // Verificar si tiene mediciones asociadas
        const countMediciones = await prisma.medicion.count({
            where: { ciclo_id: validatedId.id, deleted_at: null }
        });

        if (countMediciones > 0) {
            throw new Error("No se puede eliminar un ciclo que tiene mediciones asociadas.");
        }

        return prisma.ciclo.update({
            where: { id: validatedId.id },
            data: { deleted_at: new Date(), activo: false }
        });
    }

    /**
     * Obtener el ciclo activo de un lugar
     */
    static async findActiveByLugar(lugarId: number) {
        return prisma.ciclo.findFirst({
            where: {
                lugar_id: lugarId,
                activo: true,
                deleted_at: null,
            },
        });
    }
}
