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
   * Exportar mediciones a CSV usando streaming para eficiencia de memoria
   * @param filters - Filtros de búsqueda de mediciones
   * @returns ReadableStream que emite el contenido del CSV
   */
  static exportToCSVStream(
    filters: FilterMedicionesInput
  ): ReadableStream {
    logger.info('Iniciando exportación de mediciones a CSV vía stream', { filters });

    const encoder = new TextEncoder();
    const where = buildWhereClause(filters);
    const BATCH_SIZE = 1000;

    return new ReadableStream({
      async start(controller) {
        try {
          // Agregar BOM para compatibilidad con Excel (al inicio del stream)
          controller.enqueue(encoder.encode('\uFEFF'));

          // Definir headers del CSV
          const headers = ['id', 'valor', 'fecha', 'unidad', 'lugar', 'tipoRegistro', 'observaciones', 'createdAt'];
          controller.enqueue(encoder.encode(headers.join(',') + '\n'));

          let skip = 0;
          let hasMore = true;

          while (hasMore) {
            // Obtener lote de mediciones con fetching selectivo
            const mediciones = await prisma.medicion.findMany({
              where,
              include: getIncludes(true),
              orderBy: { fecha_medicion: 'desc' },
              skip,
              take: BATCH_SIZE,
            });

            if (mediciones.length === 0) {
              hasMore = false;
              break;
            }

            // Procesar lote y convertir a líneas CSV
            const csvLines = mediciones.map((m) => {
              const escapeCSV = (value: string | number | null | undefined): string => {
                if (value === null || value === undefined) return '';
                const stringValue = String(value);
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                  return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
              };

              // Safely access nested properties
              const unidadSigla = ('unidad' in m && m.unidad) ? (m.unidad as any).sigla : '';
              const lugarNombre = ('lugar' in m && m.lugar) ? (m.lugar as any).nombre : '';
              const tipoDesc = ('tipo' in m && m.tipo) ? ((m.tipo as any).descripcion || (m.tipo as any).codigo) : '';

              return [
                escapeCSV(m.id),
                escapeCSV(m.valor.toString()),
                escapeCSV(m.fecha_medicion.toISOString()),
                escapeCSV(unidadSigla),
                escapeCSV(lugarNombre),
                escapeCSV(tipoDesc),
                escapeCSV(m.notas || ''),
                escapeCSV(m.created_at.toISOString()),
              ].join(',');
            }).join('\n') + '\n';

            controller.enqueue(encoder.encode(csvLines));

            skip += BATCH_SIZE;
            if (mediciones.length < BATCH_SIZE) {
              hasMore = false;
            }
          }

          logger.info('Stream de CSV completado exitosamente');
          controller.close();
        } catch (error) {
          logger.error('Error durante el stream del CSV', error as Error);
          controller.error(error);
        }
      }
    });
  }
}
