import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, isAuthError } from "@/lib/middleware/auth";
import { MedicionesExportService } from "@/lib/services";
import { handleApiError } from "@/lib/utils/errors";

/**
 * GET /api/mediciones/export
 * Exportar todas las mediciones a CSV
 */
export async function GET(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const { searchParams } = new URL(request.url);

        // Extraer filtros de los query params
        const filters: Record<string, unknown> = {};

        const lugarId = searchParams.get("lugar_id");
        if (lugarId) {
            const id = parseInt(lugarId, 10);
            if (!isNaN(id)) filters.lugar_id = id;
        }

        const tipoId = searchParams.get("tipo_id");
        if (tipoId) {
            const id = parseInt(tipoId, 10);
            if (!isNaN(id)) filters.tipo_id = id;
        }

        const autorId = searchParams.get("autor_id");
        if (autorId) {
            const id = parseInt(autorId, 10);
            if (!isNaN(id)) filters.autor_id = id;
        }

        const unidadId = searchParams.get("unidad_id");
        if (unidadId) {
            const id = parseInt(unidadId, 10);
            if (!isNaN(id)) filters.unidad_id = id;
        }

        const fechaDesde = searchParams.get("fecha_desde");
        if (fechaDesde) {
            filters.fecha_desde = new Date(fechaDesde);
        }

        const fechaHasta = searchParams.get("fecha_hasta");
        if (fechaHasta) {
            filters.fecha_hasta = new Date(fechaHasta);
        }

        // Generar CSV usando el servicio de exportación
        const csvContent = await MedicionesExportService.exportToCSV(filters);

        // Retornar archivo CSV
        const filename = `mediciones_export_${new Date().toISOString().split("T")[0]}.csv`;
        return new NextResponse(csvContent, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        return handleApiError(error, {
            path: request.url,
            method: request.method,
        });
    }
}
