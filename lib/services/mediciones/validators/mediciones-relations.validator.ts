/**
 * Validadores de relaciones para mediciones
 * Contiene funciones para validar las relaciones de una medición
 */

import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

/**
 * Validar que el lugar exista y no esté eliminado
 * @param lugar_id - ID del lugar a validar
 * @throws Error si el lugar no existe o está eliminado
 */
export async function validarLugar(lugar_id: number): Promise<void> {
  const lugar = await prisma.lugar.findFirst({
    where: {
      id: lugar_id,
      deleted_at: null,
    },
  });

  if (!lugar) {
    logger.error('Lugar no encontrado o eliminado', { lugar_id });
    throw new Error(
      `Lugar con ID ${lugar_id} no encontrado o eliminado`
    );
  }
}

/**
 * Validar que la unidad exista y no esté eliminada
 * @param unidad_id - ID de la unidad a validar
 * @throws Error si la unidad no existe o está eliminada
 */
export async function validarUnidad(unidad_id: number): Promise<void> {
  const unidad = await prisma.unidad.findFirst({
    where: {
      id: unidad_id,
      deleted_at: null,
    },
  });

  if (!unidad) {
    logger.error('Unidad no encontrada o eliminada', { unidad_id });
    throw new Error(
      `Unidad con ID ${unidad_id} no encontrada o eliminada`
    );
  }
}

/**
 * Validar que el tipo de registro exista
 * @param tipo_id - ID del tipo de registro a validar
 * @throws Error si el tipo de registro no existe
 */
export async function validarTipo(tipo_id: number): Promise<void> {
  const tipo = await prisma.tipoRegistro.findUnique({
    where: {
      id: tipo_id,
    },
  });

  if (!tipo) {
    logger.error('Tipo de registro no encontrado', { tipo_id });
    throw new Error(
      `Tipo de registro con ID ${tipo_id} no encontrado`
    );
  }
}

/**
 * Validar que el origen de datos exista y no esté eliminado
 * @param origen_id - ID del origen de datos a validar
 * @throws Error si el origen no existe o está eliminado
 */
export async function validarOrigen(origen_id: number): Promise<void> {
  const origen = await prisma.origenDato.findFirst({
    where: {
      id: origen_id,
      deleted_at: null,
    },
  });

  if (!origen) {
    logger.error('Origen no encontrado o eliminado', { origen_id });
    throw new Error(
      `Origen con ID ${origen_id} no encontrado o eliminado`
    );
  }
}
