import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { mediciones, lugares, ciclos, tiposRegistro } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import { hasMinRole, ROLES, type Rol } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
    const userRol = locals.user?.rol as Rol;
    const userId = locals.user?.userId as number;
    const canViewAll = hasMinRole(userRol, ROLES.INVESTIGADOR);

    // Cargar centros del usuario
    const misCentros = canViewAll
        ? await db.select().from(lugares)
        : await db.select().from(lugares).where(eq(lugares.userId, userId));

    // Cargar ciclos del usuario
    const misCiclos = canViewAll
        ? await db.select().from(ciclos)
        : await db.select().from(ciclos).where(eq(ciclos.userId, userId));

    // Cargar tipos de registro
    const tipos = await db.select().from(tiposRegistro);

    // Cargar todas las mediciones con joins
    let registrosBase = db
        .select({
            id: mediciones.id,
            valor: mediciones.valor,
            fechaMedicion: mediciones.fechaMedicion,
            cicloId: mediciones.cicloId,
            lugarId: mediciones.lugarId,
            tipoId: mediciones.tipoId,
            tipoCodigo: tiposRegistro.codigo,
            tipoUnidad: tiposRegistro.unidadBase,
            centroNombre: lugares.nombre,
            cicloNombre: ciclos.nombre
        })
        .from(mediciones)
        .innerJoin(lugares, eq(mediciones.lugarId, lugares.id))
        .innerJoin(tiposRegistro, eq(mediciones.tipoId, tiposRegistro.id))
        .leftJoin(ciclos, eq(mediciones.cicloId, ciclos.id));

    if (!canViewAll) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        registrosBase = registrosBase.where(eq(mediciones.userId, userId)) as any;
    }

    const registros = await registrosBase.orderBy(asc(mediciones.fechaMedicion));

    // Serializar fechas para el cliente
    const registrosSerializados = registros.map((r) => ({
        ...r,
        fechaMedicion: r.fechaMedicion.toISOString()
    }));

    return {
        centros: misCentros,
        ciclos: misCiclos,
        tipos,
        registros: registrosSerializados
    };
};
