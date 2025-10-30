import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/health
 * Endpoint de monitoreo de estado para el despliegue en Vercel
 */
export async function GET() {
    try {
        // Verificar conexión a base de datos
        await prisma.$queryRaw`SELECT 1`;

        return NextResponse.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            database: "connected",
            version: process.env.npm_package_version || "1.0.0",
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: "unhealthy",
                timestamp: new Date().toISOString(),
                database: "disconnected",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 503 }
        );
    }
}
