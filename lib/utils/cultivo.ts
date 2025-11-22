/**
 * Utilidades para la lógica de cultivo y gestión de ciclos.
 * Idioma: Español
 */

/**
 * Calcula los días transcurridos entre la fecha de siembra y la fecha de muestra.
 * 
 * @param fechaMuestra Fecha en que se tomó la muestra
 * @param fechaSiembra Fecha en que se inició el ciclo (siembra)
 * @returns Número de días transcurridos
 */
export function calcularDiasDesdeSiembra(fechaMuestra: Date | string, fechaSiembra: Date | string): number {
    const dMuestra = new Date(fechaMuestra);
    const dSiembra = new Date(fechaSiembra);

    // Normalizar a inicio del día (medianoche UTC) para cálculo exacto de días
    const muestra = Date.UTC(dMuestra.getFullYear(), dMuestra.getMonth(), dMuestra.getDate());
    const siembra = Date.UTC(dSiembra.getFullYear(), dSiembra.getMonth(), dSiembra.getDate());

    const diffMs = muestra - siembra;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Valida si una fecha de muestra es válida para un ciclo dado.
 * La fecha de muestra no puede ser anterior a la fecha de siembra.
 * 
 * @param fechaMuestra Fecha de la medición
 * @param fechaSiembra Fecha de inicio del ciclo
 * @returns Objeto con estado de validez y mensaje de error si aplica
 */
export function validarFechaCiclo(fechaMuestra: Date | string, fechaSiembra: Date | string): { valida: boolean; mensaje?: string } {
    const dias = calcularDiasDesdeSiembra(fechaMuestra, fechaSiembra);

    if (dias < 0) {
        return {
            valida: false,
            mensaje: "La fecha de muestra no puede ser anterior a la fecha de siembra del ciclo."
        };
    }

    return { valida: true };
}
