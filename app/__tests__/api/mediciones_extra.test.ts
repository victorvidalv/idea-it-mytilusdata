/** @jest-environment node */
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

// Mock de Prisma
jest.mock("@/lib/prisma", () => ({
    __esModule: true,
    default: {
        medicion: { findMany: jest.fn(), count: jest.fn() },
    },
}));

// Mock de autenticación
jest.mock("@/lib/middleware/auth", () => ({
    verifyAuth: jest.fn().mockResolvedValue({ id: 1, email: "admin@example.com", rol: "ADMIN" }),
    isAuthError: jest.fn().mockReturnValue(false),
}));

// Mock del servicio de exportación
jest.mock("@/lib/services", () => ({
    MedicionesExportService: {
        exportToCSVStream: jest.fn().mockReturnValue("csv,data,stream"),
    },
}));

describe("Mediciones Extra API Endpoints", () => {
    describe("GET /api/mediciones/export", () => {
        const { GET } = require("@/app/api/mediciones/export/route");

        it("debe retornar un stream CSV", async () => {
            const req = new NextRequest("http://localhost/api/mediciones/export");
            const res = await GET(req);

            expect(res.status).toBe(200);
            expect(res.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");
        });
    });

    describe("GET /api/public/mediciones", () => {
        const { GET } = require("@/app/api/public/mediciones/route");

        it("debe retornar mediciones con token válido", async () => {
            process.env.API_PUBLIC_TOKEN = "test-token";
            (prisma.medicion.findMany as jest.Mock).mockResolvedValue([
                {
                    id: 1, valor: 10, fecha_medicion: new Date(),
                    created_at: new Date(), updated_at: new Date(),
                    lugar: { id: 1, nombre: "L1" },
                    unidad: { id: 1, nombre: "U1", sigla: "U" },
                    tipo: { id: 1, codigo: "T1", descripcion: "D" },
                    registrado_por: { id: 1, nombre: "N", email: "E" }
                }
            ]);
            (prisma.medicion.count as jest.Mock).mockResolvedValue(1);

            const req = new NextRequest("http://localhost/api/public/mediciones", {
                headers: { "Authorization": "Bearer test-token" }
            });
            const res = await GET(req);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data).toHaveLength(1);
        });

        it("debe fallar con token inválido", async () => {
            process.env.API_PUBLIC_TOKEN = "correct-token";
            const req = new NextRequest("http://localhost/api/public/mediciones", {
                headers: { "Authorization": "Bearer wrong-token" }
            });
            const res = await GET(req);
            expect(res.status).toBe(401);
        });
    });
});
