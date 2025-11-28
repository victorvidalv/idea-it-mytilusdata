/**
 * Queries de Prisma para Unidades
 */

import type { Prisma } from '@prisma/client';

export function buildWhereClause(filters: any): Prisma.UnidadWhereInput {
    const where: Prisma.UnidadWhereInput = {
        deleted_at: null,
    };

    if (filters.q || filters.busqueda) {
        where.nombre = { contains: filters.q || filters.busqueda, mode: 'insensitive' };
    }

    return where;
}

export function getIncludes(includeAll = false) {
    if (!includeAll) return {};

    return {
        creador: { select: { id: true, nombre: true, email: true } },
        _count: {
            select: { mediciones: true }
        }
    };
}
