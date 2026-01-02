import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    // Aquí se pueden cargar datos reales de la BD, como cantidad de centros o ciclos
    return {
        stats: {
            centros: 0,
            ciclosActivos: 0,
            medicionesMes: 0
        }
    };
};
