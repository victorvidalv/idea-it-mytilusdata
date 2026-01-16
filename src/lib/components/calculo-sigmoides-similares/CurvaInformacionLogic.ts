import type { Ajuste } from './ProyeccionComponentTypes';

export function getCurvaInfoDerivados(codigo: string, parametros: any, mostrarParametros: boolean, ajustes: Ajuste[]) {
    const idAjuste = codigo.split('-').pop() ?? '1';
    const hasParametros = mostrarParametros && Object.keys(parametros || {}).length > 0;
    const ajustesVisibles = (ajustes || []).filter(a => a.visible);
    
    return { idAjuste, hasParametros, ajustesVisibles };
}
