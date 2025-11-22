/**
 * Queries de Prisma para Ciclos
 */

import type { Prisma } from '@prisma/client';
import type { FilterCiclosInput } from '@/lib/validators/ciclos.validator';

export function buildWhereClause(filters: FilterCiclosInput): Prisma.CicloWhereInput {
    const where: Prisma.CicloWhereInput = {
        deleted_at: null,
    };

    if (filters.lugar_id) {
        where.lugar_id = filters.lugar_id;
    }

    if (filters.activo !== undefined) {
        where.activo = filters.activo;
    }

    return where;
}

export function getIncludes(includeAll = false) {
    if (!includeAll) return {
        lugar: { select: { id: true, nombre: true } }
    };

    return {
        lugar: { select: { id: true, nombre: true } },
        creador: { select: { id: true, nombre: true, email: true } },
        _count: {
            select: { mediciones: true }
        }
    };
}
