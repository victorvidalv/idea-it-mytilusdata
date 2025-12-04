/** @jest-environment node */
import { NextRequest } from "next/server";

import { GET as v1CiclosGet, POST as v1CiclosPost } from "@/app/api/v1/ciclos/route";
import {
    GET as v1CicloIdGet,
    PUT as v1CicloIdPut
} from "@/app/api/v1/ciclos/[id]/route";
import prisma from "@/lib/prisma";
import { CiclosService } from "@/lib/services/ciclos";

// Mock de Prisma
jest.mock("@/lib/prisma", () => ({
    __esModule: true,
    default: {
        lugar: { findFirst: jest.fn() },
        ciclo: { findFirst: jest.fn(), update: jest.fn() },
    },
}));

// Mock de los servicios
jest.mock("@/lib/services/ciclos", () => ({
    CiclosService: {
        findAll: jest.fn(),
        create: jest.fn(),
    },
}));

// Mock de middlewares
jest.mock("@/lib/middleware", () => ({
    withApiKey: (handler: any, permissions: string[]) => (req: any, ctx: any) => {
        req.apiKey = { id: 1, creado_por_id: 1, permisos: permissions };
        return handler(req, ctx);
    },
}));

// Mock de logger
jest.mock("@/lib/utils/logger", () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

describe("API v1 - Ciclos Endpoints", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /api/v1/ciclos", () => {
        it("debe listar ciclos con paginación", async () => {
            const mockResult = {
                data: [{ id: 1, nombre: "Ciclo 1", activo: true }],
                pagination: { total: 1, page: 1, limit: 50, totalPages: 1, hasNext: false, hasPrevious: false }
            };
            (CiclosService.findAll as jest.Mock).mockResolvedValue(mockResult);

            const req = new NextRequest("http://localhost/api/v1/ciclos?page=1&limit=50");
            const response = await v1CiclosGet(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data).toHaveLength(1);
        });

        it("debe filtrar por lugar_id", async () => {
            const mockResult = {
                data: [{ id: 1, nombre: "Ciclo 1", lugar_id: 1 }],
                pagination: { total: 1, page: 1, limit: 50, totalPages: 1, hasNext: false, hasPrevious: false }
            };
            (CiclosService.findAll as jest.Mock).mockResolvedValue(mockResult);

            const req = new NextRequest("http://localhost/api/v1/ciclos?lugar_id=1");
            const response = await v1CiclosGet(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });

        it("debe fallar con parámetros de filtro inválidos", async () => {
            const req = new NextRequest("http://localhost/api/v1/ciclos?page=invalid");
            const response = await v1CiclosGet(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });
    });

    describe("POST /api/v1/ciclos", () => {
        it("debe crear un nuevo ciclo", async () => {
            const mockCiclo = { id: 1, nombre: "Nuevo Ciclo", lugar_id: 1 };
            (prisma.lugar.findFirst as jest.Mock).mockResolvedValue({ id: 1, nombre: "Lugar 1" });
            (CiclosService.create as jest.Mock).mockResolvedValue(mockCiclo);

            const req = new NextRequest("http://localhost/api/v1/ciclos", {
                method: "POST",
                body: JSON.stringify({
                    nombre: "Nuevo Ciclo",
                    lugar_id: 1,
                    fecha_siembra: new Date().toISOString(),
                }),
            });

            const response = await v1CiclosPost(req);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.data.nombre).toBe("Nuevo Ciclo");
        });

        it("debe fallar si el lugar no existe", async () => {
            (prisma.lugar.findFirst as jest.Mock).mockResolvedValue(null);

            const req = new NextRequest("http://localhost/api/v1/ciclos", {
                method: "POST",
                body: JSON.stringify({
                    nombre: "Nuevo Ciclo",
                    lugar_id: 999,
                    fecha_siembra: new Date().toISOString(),
                }),
            });

            const response = await v1CiclosPost(req);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.success).toBe(false);
            expect(data.message).toContain("Lugar no encontrado");
        });

        it("debe fallar con datos inválidos", async () => {
            const req = new NextRequest("http://localhost/api/v1/ciclos", {
                method: "POST",
                body: JSON.stringify({
                    nombre: "", // Nombre vacío
                }),
            });

            const response = await v1CiclosPost(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });
    });

    describe("GET /api/v1/ciclos/[id]", () => {
        it("debe obtener un ciclo por ID", async () => {
            const mockCiclo = {
                id: 1,
                nombre: "Ciclo 1",
                fecha_siembra: new Date(),
                fecha_finalizacion: null,
                activo: true,
                notas: null,
                created_at: new Date(),
                lugar: { id: 1, nombre: "Lugar 1" },
                _count: { mediciones: 0 }
            };
            (prisma.ciclo.findFirst as jest.Mock).mockResolvedValue(mockCiclo);

            const req = new NextRequest("http://localhost/api/v1/ciclos/1");
            const response = await v1CicloIdGet(req, { params: Promise.resolve({ id: "1" }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.id).toBe(1);
        });

        it("debe fallar con ID inválido", async () => {
            const req = new NextRequest("http://localhost/api/v1/ciclos/invalid");
            const response = await v1CicloIdGet(req, { params: Promise.resolve({ id: "invalid" }) });

            expect(response.status).toBe(400);
        });

        it("debe retornar 404 si el ciclo no existe", async () => {
            (prisma.ciclo.findFirst as jest.Mock).mockResolvedValue(null);

            const req = new NextRequest("http://localhost/api/v1/ciclos/999");
            const response = await v1CicloIdGet(req, { params: Promise.resolve({ id: "999" }) });

            expect(response.status).toBe(404);
        });
    });

    describe("PUT /api/v1/ciclos/[id]", () => {
        it("debe actualizar un ciclo", async () => {
            const mockCicloExistente = {
                id: 1,
                nombre: "Ciclo 1",
                fecha_siembra: new Date(),
                fecha_finalizacion: null,
                activo: true,
            };
            const mockCicloActualizado = {
                id: 1,
                nombre: "Ciclo Actualizado",
                fecha_siembra: new Date(),
                fecha_finalizacion: null,
                activo: false,
                created_at: new Date(),
                lugar: { id: 1, nombre: "Lugar 1" },
            };

            (prisma.ciclo.findFirst as jest.Mock).mockResolvedValue(mockCicloExistente);
            (prisma.ciclo.update as jest.Mock).mockResolvedValue(mockCicloActualizado);

            const req = new NextRequest("http://localhost/api/v1/ciclos/1", {
                method: "PUT",
                body: JSON.stringify({
                    nombre: "Ciclo Actualizado",
                    activo: false,
                }),
            });

            const response = await v1CicloIdPut(req, { params: Promise.resolve({ id: "1" }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.nombre).toBe("Ciclo Actualizado");
        });

        it("debe fallar con ID inválido", async () => {
            const req = new NextRequest("http://localhost/api/v1/ciclos/invalid", {
                method: "PUT",
                body: JSON.stringify({ nombre: "Test" }),
            });
            const response = await v1CicloIdPut(req, { params: Promise.resolve({ id: "invalid" }) });

            expect(response.status).toBe(400);
        });

        it("debe fallar si el ciclo no existe", async () => {
            (prisma.ciclo.findFirst as jest.Mock).mockResolvedValue(null);

            const req = new NextRequest("http://localhost/api/v1/ciclos/999", {
                method: "PUT",
                body: JSON.stringify({ nombre: "Test" }),
            });
            const response = await v1CicloIdPut(req, { params: Promise.resolve({ id: "999" }) });

            expect(response.status).toBe(404);
        });

        it("debe fallar si el nombre está vacío", async () => {
            const mockCicloExistente = {
                id: 1,
                nombre: "Ciclo 1",
                fecha_siembra: new Date(),
                fecha_finalizacion: null,
                activo: true,
            };
            (prisma.ciclo.findFirst as jest.Mock).mockResolvedValue(mockCicloExistente);

            const req = new NextRequest("http://localhost/api/v1/ciclos/1", {
                method: "PUT",
                body: JSON.stringify({
                    nombre: "", // Nombre vacío
                }),
            });
            const response = await v1CicloIdPut(req, { params: Promise.resolve({ id: "1" }) });

            expect(response.status).toBe(400);
        });

        it("debe fallar si no hay datos para actualizar", async () => {
            const mockCicloExistente = {
                id: 1,
                nombre: "Ciclo 1",
                fecha_siembra: new Date(),
                fecha_finalizacion: null,
                activo: true,
            };
            (prisma.ciclo.findFirst as jest.Mock).mockResolvedValue(mockCicloExistente);

            const req = new NextRequest("http://localhost/api/v1/ciclos/1", {
                method: "PUT",
                body: JSON.stringify({}), // Sin datos
            });
            const response = await v1CicloIdPut(req, { params: Promise.resolve({ id: "1" }) });

            expect(response.status).toBe(400);
        });
    });
});
