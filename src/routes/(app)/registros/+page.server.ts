import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { mediciones, lugares, ciclos, tiposRegistro, origenDatos } from '$lib/server/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { hasMinRole, ROLES, type Rol } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
    const userRol = locals.user?.rol as Rol;
    const userId = locals.user?.userId as number;

    // Obtener los datos base para el formulario
    // Centros: todos si es ADMIN/INVESTIGADOR, solo propios si es USUARIO
    const misCentros = hasMinRole(userRol, ROLES.INVESTIGADOR)
        ? await db.select().from(lugares).all()
        : await db.select().from(lugares).where(eq(lugares.userId, userId)).all();

    const misCiclos = hasMinRole(userRol, ROLES.INVESTIGADOR)
        ? await db.select().from(ciclos).all()
        : await db.select().from(ciclos).where(eq(ciclos.userId, userId)).all();

    const tipos = await db.select().from(tiposRegistro).all();

    // Semillas iniciales origen de datos si está vacío
    let origenes = await db.select().from(origenDatos).all();
    if (origenes.length === 0) {
        await db.insert(origenDatos).values([
            { nombre: 'Manual / Terreno' },
            { nombre: 'Laboratorio' },
            { nombre: 'Satelital' },
            { nombre: 'Sensor IoT' },
            { nombre: 'PSMB' }
        ]);
        origenes = await db.select().from(origenDatos).all();
    }

    // Cargar los últimos registros (join con tablas relacionadas para los nombres)
    let registrosBase = db.select({
        id: mediciones.id,
        valor: mediciones.valor,
        fechaMedicion: mediciones.fechaMedicion,
        notas: mediciones.notas,
        centroId: lugares.id,
        centroNombre: lugares.nombre,
        cicloId: ciclos.id,
        cicloNombre: ciclos.nombre,
        tipoId: tiposRegistro.id,
        tipoNombre: tiposRegistro.codigo,
        unidad: tiposRegistro.unidadBase,
        origenNombre: origenDatos.nombre,
        userId: mediciones.userId
    })
        .from(mediciones)
        .innerJoin(lugares, eq(mediciones.lugarId, lugares.id))
        .innerJoin(tiposRegistro, eq(mediciones.tipoId, tiposRegistro.id))
        .innerJoin(origenDatos, eq(mediciones.origenId, origenDatos.id))
        .leftJoin(ciclos, eq(mediciones.cicloId, ciclos.id));

    // Filtrar si es usuario normal
    if (!hasMinRole(userRol, ROLES.INVESTIGADOR)) {
        registrosBase = registrosBase.where(eq(mediciones.userId, userId)) as any;
    }

    const registros = await registrosBase.orderBy(desc(mediciones.fechaMedicion)).limit(5000).all();

    // Agregar campo `isOwner` para controlar edición/borrado
    const registrosConPermisos = registros.map(r => ({
        ...r,
        isOwner: r.userId === userId || userRol === ROLES.ADMIN
    }));

    return {
        centros: misCentros,
        ciclos: misCiclos,
        tipos,
        origenes,
        registros: registrosConPermisos
    };
};

export const actions = {
    create: async ({ request, locals }) => {
        const userId = locals.user?.userId as number;
        if (!userId) return fail(401, { error: true, message: 'No autenticado' });

        const data = await request.formData();
        const lugarId = Number(data.get('lugarId'));
        const cicloId = data.get('cicloId') ? Number(data.get('cicloId')) : null;
        const tipoId = Number(data.get('tipoId'));
        const origenId = Number(data.get('origenId'));
        const valor = Number(data.get('valor'));
        const fechaString = data.get('fechaMedicion') as string;
        const notas = data.get('notas') as string;

        if (!lugarId || !tipoId || !origenId || isNaN(valor) || !fechaString) {
            return fail(400, { error: true, message: 'Faltan campos requeridos o valor no válido' });
        }

        try {
            await db.insert(mediciones).values({
                valor,
                fechaMedicion: new Date(fechaString),
                lugarId,
                cicloId, // puede ser null si es un dato ambiental no anclado al ciclo productivo
                tipoId,
                origenId,
                notas,
                userId
            });
            return { success: true, message: 'Registro guardado exitosamente' };
        } catch (e: any) {
            return fail(500, { error: true, message: 'Error interno guardando la medición' });
        }
    },

    update: async ({ request, locals }) => {
        const userId = locals.user?.userId as number;
        const userRol = locals.user?.rol as Rol;
        if (!userId) return fail(401, { error: true, message: 'No autenticado' });

        const data = await request.formData();
        const id = Number(data.get('id'));
        const lugarId = Number(data.get('lugarId'));
        const cicloId = data.get('cicloId') ? Number(data.get('cicloId')) : null;
        const tipoId = Number(data.get('tipoId'));
        const origenId = Number(data.get('origenId'));
        const valor = Number(data.get('valor'));
        const fechaString = data.get('fechaMedicion') as string;
        const notas = data.get('notas') as string;

        if (!id || !lugarId || !tipoId || !origenId || isNaN(valor) || !fechaString) {
            return fail(400, { error: true, message: 'Faltan campos requeridos o valor no válido' });
        }

        try {
            const updateData = {
                valor,
                fechaMedicion: new Date(fechaString),
                lugarId,
                cicloId,
                tipoId,
                origenId,
                notas
            };

            if (userRol === ROLES.ADMIN) {
                await db.update(mediciones).set(updateData).where(eq(mediciones.id, id));
            } else {
                await db.update(mediciones).set(updateData).where(and(eq(mediciones.id, id), eq(mediciones.userId, userId)));
            }
            return { success: true, message: 'Registro actualizado exitosamente' };
        } catch (e: any) {
            return fail(500, { error: true, message: 'Error interno al actualizar' });
        }
    },

    delete: async ({ request, locals }) => {
        const userId = locals.user?.userId as number;
        const userRol = locals.user?.rol as Rol;
        if (!userId) return fail(401, { error: true, message: 'No autenticado' });

        const data = await request.formData();
        const id = Number(data.get('id'));

        if (!id) return fail(400, { error: true, message: 'ID no proporcionado' });

        try {
            if (userRol === ROLES.ADMIN) {
                // Admin puede borrar cualquiera
                await db.delete(mediciones).where(eq(mediciones.id, id));
            } else {
                // Usuario solo los suyos
                await db.delete(mediciones).where(and(eq(mediciones.id, id), eq(mediciones.userId, userId)));
            }
            return { success: true, message: 'Registro eliminado' };
        } catch (e: any) {
            return fail(500, { error: true, message: 'Error interno al eliminar' });
        }
    }
} satisfies Actions;
