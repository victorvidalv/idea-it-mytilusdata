import prisma from "@/lib/prisma";

/**
 * Tipos de acciones para la bitácora
 */
export type AccionBitacora = "CREATE" | "UPDATE" | "SOFT_DELETE";

/**
 * Registrar cambio en la bitácora
 * @param tablaAfectada - Nombre de la tabla modificada
 * @param registroId - ID del registro afectado
 * @param accion - Tipo de acción realizada
 * @param cambios - Objeto con los cambios realizados
 * @param usuarioId - ID del usuario que realizó el cambio
 * @param ipOrigen - IP del cliente
 */
export async function registrarCambio(
    tablaAfectada: string,
    registroId: number,
    accion: AccionBitacora,
    cambios: Record<string, { anterior: unknown; nuevo: unknown }>,
    usuarioId: number,
    ipOrigen: string
): Promise<void> {
    await prisma.bitacoraCambio.create({
        data: {
            tabla_afectada: tablaAfectada,
            registro_id: registroId,
            accion,
            cambios: JSON.stringify(cambios),
            usuario_id: usuarioId,
            ip_origen: ipOrigen,
        },
    });
}

/**
 * Generar objeto de cambios para CREATE
 */
export function cambiosCreate<T extends Record<string, unknown>>(
    datos: T
): Record<string, { anterior: null; nuevo: unknown }> {
    const cambios: Record<string, { anterior: null; nuevo: unknown }> = {};
    for (const [key, value] of Object.entries(datos)) {
        cambios[key] = { anterior: null, nuevo: value };
    }
    return cambios;
}

/**
 * Generar objeto de cambios para UPDATE
 */
export function cambiosUpdate<T extends Record<string, unknown>>(
    anterior: T,
    nuevo: Partial<T>
): Record<string, { anterior: unknown; nuevo: unknown }> {
    const cambios: Record<string, { anterior: unknown; nuevo: unknown }> = {};
    for (const [key, value] of Object.entries(nuevo)) {
        if (anterior[key] !== value) {
            cambios[key] = { anterior: anterior[key], nuevo: value };
        }
    }
    return cambios;
}

/**
 * Generar objeto de cambios para SOFT_DELETE
 */
export function cambiosSoftDelete(): Record<
    string,
    { anterior: null; nuevo: string }
> {
    return {
        deleted_at: { anterior: null, nuevo: new Date().toISOString() },
    };
}
