/**
 * Bitácora para registrar cambios en el sistema
 */

export interface CambioBitacora {
  tabla: string;
  registro_id: number;
  accion: 'CREATE' | 'UPDATE' | 'SOFT_DELETE' | 'RESTORE';
  valor_anterior?: any;
  valor_nuevo?: any;
  usuario_id: number;
  ip?: string;
}

/**
 * Registra un cambio en la bitácora
 */
export async function registrarCambio(
  tabla: string,
  registro_id: number,
  accion: 'CREATE' | 'UPDATE' | 'SOFT_DELETE' | 'RESTORE',
  datos: any,
  usuario_id: number,
  ip?: string
): Promise<void> {
  // Implementación futura: guardar en base de datos
  console.log(`[BITÁCORA] ${accion} en ${tabla}#${registro_id} por usuario ${usuario_id}`);
}

/**
 * Crea un registro de cambio para bitácora
 */
export function cambiosCreate(valor: any): any {
  return { valor };
}

/**
 * Actualiza un registro de cambio en bitácora
 */
export function cambiosUpdate(valor: any): any {
  return {};
}

/**
 * Soft delete de un registro de cambio en bitácora
 */
export function cambiosSoftDelete(valor: any): any {
  return {};
}
