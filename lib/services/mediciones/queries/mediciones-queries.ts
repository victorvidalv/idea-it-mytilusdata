/**
 * Queries de Prisma para mediciones
 * Contiene funciones para construir cláusulas where y objetos de includes
 */

import type { Prisma } from '@prisma/client';
import type { FilterMedicionesInput } from '@/lib/validators/mediciones.validator';

/**
 * Construir cláusula where de Prisma basado en filtros
 * @param filters - Filtros de búsqueda de mediciones
 * @returns Objeto where para Prisma
 */
export function buildWhereClause(
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

  // Filtro por ciclo
  if (filters.ciclo_id) {
    where.ciclo_id = filters.ciclo_id;
  }

  return where;
}

/**
 * Obtener objeto de includes para relaciones (Dynamic Fetching)
 * @param includeAll - Si se deben incluir todas las relaciones
 * @returns Objeto de includes o vacío para carga liviana
 */
export function getIncludes(includeAll = false) {
  if (!includeAll) return {};

  return {
    lugar: { select: { id: true, nombre: true } },
    unidad: { select: { id: true, nombre: true, sigla: true } },
    tipo: { select: { id: true, codigo: true, descripcion: true } },
    origen: { select: { id: true, nombre: true } },
    registrado_por: { select: { id: true, nombre: true, email: true } },
    ciclo: { select: { id: true, nombre: true, fecha_siembra: true } },
  };
}
