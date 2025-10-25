/**
 * Validadores de relaciones para mediciones
 * Contiene funciones para validar las relaciones de una medición
 */

import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

/**
 * Validar que el lugar exista y no esté eliminado
 */
export async function validarLugar(lugar_id: number): Promise<void> {
  const lugar = await prisma.lugar.findFirst({
    where: { id: lugar_id, deleted_at: null },
    select: { id: true },
  });

  if (!lugar) {
    logger.error('Lugar no encontrado o eliminado', { lugar_id });
    throw new Error(`Lugar con ID ${lugar_id} no encontrado o eliminado`);
  }
}

/**
 * Validar que la unidad exista y no esté eliminada
 */
export async function validarUnidad(unidad_id: number): Promise<void> {
  const unidad = await prisma.unidad.findFirst({
    where: { id: unidad_id, deleted_at: null },
    select: { id: true },
  });

  if (!unidad) {
    logger.error('Unidad no encontrada o eliminada', { unidad_id });
    throw new Error(`Unidad con ID ${unidad_id} no encontrada o eliminada`);
  }
}

/**
 * Validar que el tipo de registro exista
 */
export async function validarTipo(tipo_id: number): Promise<void> {
  const tipo = await prisma.tipoRegistro.findUnique({
    where: { id: tipo_id },
    select: { id: true },
  });

  if (!tipo) {
    logger.error('Tipo de registro no encontrado', { tipo_id });
    throw new Error(`Tipo de registro con ID ${tipo_id} no encontrado`);
  }
}

/**
 * Validar que el origen de datos exista y no esté eliminado
 */
export async function validarOrigen(origen_id: number): Promise<void> {
  const origen = await prisma.origenDato.findFirst({
    where: { id: origen_id, deleted_at: null },
    select: { id: true },
  });

  if (!origen) {
    logger.error('Origen no encontrado o eliminado', { origen_id });
    throw new Error(`Origen con ID ${origen_id} no encontrado o eliminado`);
  }
}

/**
 * Validar relaciones en lote para optimizar rendimiento (Ultra-eficiente)
 */
export async function validarRelacionesBatch(ids: {
  lugar_id: number;
  unidad_id: number;
  tipo_id: number;
  origen_id: number;
}): Promise<void> {
  logger.info('Validando relaciones en lote (Minimal Fetch)', ids);

  // Ejecutar validaciones en paralelo con selección minimalista de campos
  await Promise.all([
    validarLugar(ids.lugar_id),
    validarUnidad(ids.unidad_id),
    validarTipo(ids.tipo_id),
    validarOrigen(ids.origen_id),
  ]);
}
