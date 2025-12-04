/** @jest-environment node */
import { NextRequest } from "next/server";

import { GET as ciclosGet, POST as ciclosPost } from "@/app/api/ciclos/route";
import {
    GET as cicloIdGet,
    PATCH as cicloIdPatch,
    DELETE as cicloIdDelete
} from "@/app/api/ciclos/[id]/route";
import { CiclosService } from "@/lib/services/ciclos";

// Mock de los servicios
jest.mock("@/lib/services/ciclos", () => ({
    CiclosService: {
        findAll: jest.fn(),
        create: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        softDelete: jest.fn(),
    },
}));

// Mock de middlewares
jest.mock("@/lib/middleware", () => ({
    withRole: (handler: any) => (req: any, ctx: any) => {
        req.user = { userId: 1, email: "admin@example.com", rol: "ADMIN" };
        return handler(req, ctx);
    },
}));

// Mock de logger
jest.mock("@/lib/utils/logger", () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        getRequestId: jest.fn(() => "test-request-id"),
    },
}));

describe("Ciclos API Endpoints", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /api/ciclos", () => {
        it("debe listar ciclos con paginación", async () => {
            const mockResult = {
                data: [{ id: 1, nombre: "Ciclo 1", activo: true }],
                pagination: { total: 1, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrevious: false }
            };
            (CiclosService.findAll as jest.Mock).mockResolvedValue(mockResult);

            const req = new NextRequest("http://localhost/api/ciclos?page=1&limit=20");
            const response = await ciclosGet(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data).toHaveLength(1);
        });

        it("debe filtrar por lugar_id", async () => {
            const mockResult = {
                data: [{ id: 1, nombre: "Ciclo 1", lugar_id: 1 }],
                pagination: { total: 1, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrevious: false }
            };
            (CiclosService.findAll as jest.Mock).mockResolvedValue(mockResult);

            const req = new NextRequest("http://localhost/api/ciclos?lugar_id=1");
            const response = await ciclosGet(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });

        it("debe filtrar por activo", async () => {
            const mockResult = {
                data: [{ id: 1, nombre: "Ciclo 1", activo: true }],
                pagination: { total: 1, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrevious: false }
            };
            (CiclosService.findAll as jest.Mock).mockResolvedValue(mockResult);

            const req = new NextRequest("http://localhost/api/ciclos?activo=true");
            const response = await ciclosGet(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });
    });

    describe("POST /api/ciclos", () => {
        it("debe crear un nuevo ciclo", async () => {
            const mockCiclo = { id: 1, nombre: "Nuevo Ciclo", lugar_id: 1 };
            (CiclosService.create as jest.Mock).mockResolvedValue(mockCiclo);

            const req = new NextRequest("http://localhost/api/ciclos", {
                method: "POST",
                body: JSON.stringify({
                    nombre: "Nuevo Ciclo",
                    lugar_id: 1,
                    fecha_siembra: new Date().toISOString(),
                }),
            });

            const response = await ciclosPost(req);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.data.nombre).toBe("Nuevo Ciclo");
        });

        it("debe fallar con datos inválidos", async () => {
            const req = new NextRequest("http://localhost/api/ciclos", {
                method: "POST",
                body: JSON.stringify({
                    nombre: "", // Nombre vacío
                }),
            });

            const response = await ciclosPost(req);
            const data = await response.json();

            expect(response.status).toBe(422);
            expect(data.success).toBe(false);
        });
    });

    describe("GET /api/ciclos/[id]", () => {
        it("debe obtener un ciclo por ID", async () => {
            const mockCiclo = { id: 1, nombre: "Ciclo 1", activo: true };
            (CiclosService.findById as jest.Mock).mockResolvedValue(mockCiclo);

            const req = new NextRequest("http://localhost/api/ciclos/1");
            const response = await cicloIdGet(req, { params: Promise.resolve({ id: "1" }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.id).toBe(1);
        });

        it("debe retornar 404 si el ciclo no existe", async () => {
            (CiclosService.findById as jest.Mock).mockResolvedValue(null);

            const req = new NextRequest("http://localhost/api/ciclos/999");
            const response = await cicloIdGet(req, { params: Promise.resolve({ id: "999" }) });

            expect(response.status).toBe(404);
        });
    });

    describe("PATCH /api/ciclos/[id]", () => {
        it("debe actualizar un ciclo", async () => {
            const mockCiclo = { id: 1, nombre: "Ciclo Actualizado", activo: false };
            (CiclosService.update as jest.Mock).mockResolvedValue(mockCiclo);

            const req = new NextRequest("http://localhost/api/ciclos/1", {
                method: "PATCH",
                body: JSON.stringify({ nombre: "Ciclo Actualizado", activo: false }),
            });

            const response = await cicloIdPatch(req, { params: Promise.resolve({ id: "1" }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.nombre).toBe("Ciclo Actualizado");
        });
    });

    describe("DELETE /api/ciclos/[id]", () => {
        it("debe realizar un borrado lógico", async () => {
            (CiclosService.softDelete as jest.Mock).mockResolvedValue({ id: 1 });

            const req = new NextRequest("http://localhost/api/ciclos/1", {
                method: "DELETE",
            });

            const response = await cicloIdDelete(req, { params: Promise.resolve({ id: "1" }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });
    });
});
