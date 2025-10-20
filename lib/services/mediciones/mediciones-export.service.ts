/**
 * Servicio de exportación de mediciones a CSV
 * Contiene la lógica para exportar mediciones a formato CSV en memoria
 */

import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { ApiError } from '@/lib/utils/errors';
import type { FilterMedicionesInput } from '@/lib/validators/mediciones.validator';
import { buildWhereClause, getIncludes } from './queries/mediciones-queries';

/**
 * Clase de servicio para exportación de mediciones
 * Contiene métodos estáticos para exportar mediciones a diferentes formatos
 */
export class MedicionesExportService {
  /**
   * Exportar mediciones a CSV directamente en memoria
   * @param filters - Filtros de búsqueda de mediciones
   * @returns Contenido del CSV como string con BOM para Excel
   */
  static async exportToCSV(
    filters: FilterMedicionesInput
  ): Promise<string> {
    logger.info('Exportando mediciones a CSV', { filters });

    try {
      // Construir cláusula where
      const where = buildWhereClause(filters);

      // Obtener todas las mediciones sin paginación
      const mediciones = await prisma.medicion.findMany({
        where,
        include: getIncludes(),
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
}
