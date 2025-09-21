import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth, isAuthError } from "@/lib/middleware/auth";

/**
 * GET /api/mediciones/export
 * Exportar todas las mediciones a CSV
 */
export async function GET(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const { searchParams } = new URL(request.url);

        // Filtros (reutilizando la lógica de la ruta principal)
        const lugarId = searchParams.get("lugar_id");
        const tipoId = searchParams.get("tipo_id");
        const registradoPorId = searchParams.get("autor_id");

        const where: any = { deleted_at: null };

        if (lugarId) {
            const id = parseInt(lugarId, 10);
            if (!isNaN(id)) where.lugar_id = id;
        }

        if (tipoId) {
            const id = parseInt(tipoId, 10);
            if (!isNaN(id)) where.tipo_id = id;
        }

        if (registradoPorId) {
            const id = parseInt(registradoPorId, 10);
            if (!isNaN(id)) where.registrado_por_id = id;
        }

        // Obtener todas las mediciones sin paginación
        const mediciones = await prisma.medicion.findMany({
            where,
            include: {
                lugar: { select: { nombre: true } },
                unidad: { select: { sigla: true } },
                tipo: { select: { codigo: true } },
                registrado_por: { select: { nombre: true } },
            },
            orderBy: { fecha_medicion: "desc" },
        });

        // Generar contenido CSV
        // Encabezados
        const headers = ["ID", "Fecha", "Lugar", "Valor", "Unidad", "Tipo", "Autor", "Notas"];
        const rows = mediciones.map((m) => [
            m.id,
            new Date(m.fecha_medicion).toISOString().split("T")[0],
            `"${m.lugar.nombre.replace(/"/g, '""')}"`,
            m.valor.toString(),
            m.unidad.sigla,
            m.tipo.codigo,
            `"${m.registrado_por.nombre.replace(/"/g, '""')}"`,
            `"${(m.notas || "").replace(/"/g, '""')}"`,
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map((row) => row.join(",")),
        ].join("\n");

        // Retornar archivo CSV
        return new NextResponse(csvContent, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="mediciones_export_${new Date().toISOString().split("T")[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error("Error al exportar mediciones:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
