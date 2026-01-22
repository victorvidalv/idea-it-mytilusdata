import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import * as xlsx from 'xlsx';

export async function GET({ locals }) {
    if (!locals.user) {
        return new Response('No autorizado', { status: 401 });
    }

    const userId = locals.user.userId;

    try {
        // 1. Obtener Centros de Cultivo (Lugares)
        const lugaresData = await db
            .select({
                ID: table.lugares.id,
                Nombre: table.lugares.nombre,
                'Latitud': table.lugares.latitud,
                'Longitud': table.lugares.longitud,
                'Creado el': table.lugares.createdAt
            })
            .from(table.lugares)
            .where(eq(table.lugares.userId, userId));

        // 2. Obtener Ciclos Productivos
        const ciclosData = await db
            .select({
                ID: table.ciclos.id,
                Nombre: table.ciclos.nombre,
                'Centro de Cultivo': table.lugares.nombre,
                'Fecha Inicio': table.ciclos.fechaSiembra,
                'Fecha Fin Estimada': table.ciclos.fechaFinalizacion,
                Activo: table.ciclos.activo
            })
            .from(table.ciclos)
            .innerJoin(table.lugares, eq(table.ciclos.lugarId, table.lugares.id))
            .where(eq(table.ciclos.userId, userId));

        // 3. Obtener Registros (Mediciones)
        const registrosData = await db
            .select({
                ID: table.mediciones.id,
                'Centro de Cultivo': table.lugares.nombre,
                'Ciclo Productivo': table.ciclos.nombre,
                Tipo: table.tiposRegistro.codigo,
                Origen: table.origenDatos.nombre,
                Valor: table.mediciones.valor,
                Unidad: table.tiposRegistro.unidadBase,
                Texto: table.mediciones.notas,
                'Fecha Registro': table.mediciones.fechaMedicion,
                'Creado el': table.mediciones.createdAt
            })
            .from(table.mediciones)
            .innerJoin(table.lugares, eq(table.mediciones.lugarId, table.lugares.id))
            .leftJoin(table.ciclos, eq(table.mediciones.cicloId, table.ciclos.id))
            .innerJoin(table.tiposRegistro, eq(table.mediciones.tipoId, table.tiposRegistro.id))
            .innerJoin(table.origenDatos, eq(table.mediciones.origenId, table.origenDatos.id))
            .where(eq(table.mediciones.userId, userId));

        // Crear libro de Excel
        const workbook = xlsx.utils.book_new();

        // Convertir datos a hojas de Excel
        const lugaresSheet = xlsx.utils.json_to_sheet(lugaresData.length > 0 ? lugaresData : [{ Mensaje: 'No hay centros registrados' }]);
        const ciclosSheet = xlsx.utils.json_to_sheet(ciclosData.length > 0 ? ciclosData : [{ Mensaje: 'No hay ciclos registrados' }]);
        const registrosSheet = xlsx.utils.json_to_sheet(registrosData.length > 0 ? registrosData : [{ Mensaje: 'No hay registros' }]);

        // Añadir hojas al libro
        xlsx.utils.book_append_sheet(workbook, lugaresSheet, 'Centros de Cultivo');
        xlsx.utils.book_append_sheet(workbook, ciclosSheet, 'Ciclos Productivos');
        xlsx.utils.book_append_sheet(workbook, registrosSheet, 'Registros');

        // Generar buffer binario
        const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Configurar cabeceras para descarga
        const headers = new Headers();
        headers.append('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        headers.append('Content-Disposition', 'attachment; filename="Mis_Datos_PlataformaIdea.xlsx"');

        return new Response(excelBuffer, {
            status: 200,
            headers
        });

    } catch (error) {
        console.error('Error al generar Excel:', error);
        return new Response('Error al generar el archivo de exportación', { status: 500 });
    }
}
