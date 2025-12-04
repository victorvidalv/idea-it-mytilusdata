/** @jest-environment node */
import { NextRequest } from "next/server";

import { GET as v1UnidadesGet, POST as v1UnidadesPost } from "@/app/api/v1/unidades/route";
import {
    GET as v1UnidadIdGet,
    PUT as v1UnidadIdPut
} from "@/app/api/v1/unidades/[id]/route";
import prisma from "@/lib/prisma";
import { UnidadesService } from "@/lib/services/unidades";

// Mock de Prisma
jest.mock("@/lib/prisma", () => ({
    __esModule: true,
    default: {
        unidad: { findFirst: jest.fn(), update: jest.fn() },
    },
}));

// Mock de los servicios
jest.mock("@/lib/services/unidades", () => ({
    UnidadesService: {
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

describe("API v1 - Unidades Endpoints", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /api/v1/unidades", () => {
        it("debe listar unidades con paginación", async () => {
            const mockResult = {
                data: [{ id: 1, nombre: "Unidad 1", sigla: "U1" }],
                pagination: { total: 1, page: 1, limit: 50, totalPages: 1, hasNext: false, hasPrevious: false }
            };
            (UnidadesService.findAll as jest.Mock).mockResolvedValue(mockResult);

            const req = new NextRequest("http://localhost/api/v1/unidades?page=1&limit=50&q=");
            const response = await v1UnidadesGet(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data).toHaveLength(1);
        });

        it("debe filtrar por query string", async () => {
            const mockResult = {
                data: [{ id: 1, nombre: "Grados Celsius", sigla: "°C" }],
                pagination: { total: 1, page: 1, limit: 50, totalPages: 1, hasNext: false, hasPrevious: false }
            };
            (UnidadesService.findAll as jest.Mock).mockResolvedValue(mockResult);

            const req = new NextRequest("http://localhost/api/v1/unidades?q=Celsius");
            const response = await v1UnidadesGet(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });

        it("debe fallar con parámetros de filtro inválidos", async () => {
            const req = new NextRequest("http://localhost/api/v1/unidades?page=invalid");
            const response = await v1UnidadesGet(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });
    });

    describe("POST /api/v1/unidades", () => {
        it("debe crear una nueva unidad", async () => {
            const mockUnidad = { id: 1, nombre: "Grados Celsius", sigla: "°C" };
            (UnidadesService.create as jest.Mock).mockResolvedValue(mockUnidad);

            const req = new NextRequest("http://localhost/api/v1/unidades", {
                method: "POST",
                body: JSON.stringify({
                    nombre: "Grados Celsius",
                    sigla: "°C",
                }),
            });

            const response = await v1UnidadesPost(req);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.data.nombre).toBe("Grados Celsius");
        });

        it("debe fallar con datos inválidos", async () => {
            const req = new NextRequest("http://localhost/api/v1/unidades", {
                method: "POST",
                body: JSON.stringify({
                    nombre: "", // Nombre vacío
                }),
            });

            const response = await v1UnidadesPost(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });
    });

    describe("GET /api/v1/unidades/[id]", () => {
        it("debe obtener una unidad por ID", async () => {
            const mockUnidad = {
                id: 1,
                nombre: "Grados Celsius",
                sigla: "°C",
            };
            (prisma.unidad.findFirst as jest.Mock).mockResolvedValue(mockUnidad);

            const req = new NextRequest("http://localhost/api/v1/unidades/1");
            const response = await v1UnidadIdGet(req, { params: Promise.resolve({ id: "1" }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.id).toBe(1);
        });

        it("debe fallar con ID inválido", async () => {
            const req = new NextRequest("http://localhost/api/v1/unidades/invalid");
            const response = await v1UnidadIdGet(req, { params: Promise.resolve({ id: "invalid" }) });

            expect(response.status).toBe(400);
        });

        it("debe retornar 404 si la unidad no existe", async () => {
            (prisma.unidad.findFirst as jest.Mock).mockResolvedValue(null);

            const req = new NextRequest("http://localhost/api/v1/unidades/999");
            const response = await v1UnidadIdGet(req, { params: Promise.resolve({ id: "999" }) });

            expect(response.status).toBe(404);
        });
    });

    describe("PUT /api/v1/unidades/[id]", () => {
        it("debe actualizar una unidad", async () => {
            const mockUnidadExistente = {
                id: 1,
                nombre: "Grados Celsius",
                sigla: "°C",
            };
            const mockUnidadActualizada = {
                id: 1,
                nombre: "Grados Fahrenheit",
                sigla: "°F",
            };

            (prisma.unidad.findFirst as jest.Mock).mockResolvedValue(mockUnidadExistente);
            (prisma.unidad.update as jest.Mock).mockResolvedValue(mockUnidadActualizada);

            const req = new NextRequest("http://localhost/api/v1/unidades/1", {
                method: "PUT",
                body: JSON.stringify({
                    nombre: "Grados Fahrenheit",
                    sigla: "°F",
                }),
            });

            const response = await v1UnidadIdPut(req, { params: Promise.resolve({ id: "1" }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.nombre).toBe("Grados Fahrenheit");
        });

        it("debe fallar con ID inválido", async () => {
            const req = new NextRequest("http://localhost/api/v1/unidades/invalid", {
                method: "PUT",
                body: JSON.stringify({ nombre: "Test" }),
            });
            const response = await v1UnidadIdPut(req, { params: Promise.resolve({ id: "invalid" }) });

            expect(response.status).toBe(400);
        });

        it("debe fallar si la unidad no existe", async () => {
            (prisma.unidad.findFirst as jest.Mock).mockResolvedValue(null);

            const req = new NextRequest("http://localhost/api/v1/unidades/999", {
                method: "PUT",
                body: JSON.stringify({ nombre: "Test" }),
            });
            const response = await v1UnidadIdPut(req, { params: Promise.resolve({ id: "999" }) });

            expect(response.status).toBe(404);
        });

        it("debe fallar si el nombre está vacío", async () => {
            const mockUnidadExistente = {
                id: 1,
                nombre: "Grados Celsius",
                sigla: "°C",
            };
            (prisma.unidad.findFirst as jest.Mock).mockResolvedValue(mockUnidadExistente);

            const req = new NextRequest("http://localhost/api/v1/unidades/1", {
                method: "PUT",
                body: JSON.stringify({
                    nombre: "", // Nombre vacío
                }),
            });
            const response = await v1UnidadIdPut(req, { params: Promise.resolve({ id: "1" }) });

            expect(response.status).toBe(400);
        });

        it("debe fallar si la sigla está vacía", async () => {
            const mockUnidadExistente = {
                id: 1,
                nombre: "Grados Celsius",
                sigla: "°C",
            };
            (prisma.unidad.findFirst as jest.Mock).mockResolvedValue(mockUnidadExistente);

            const req = new NextRequest("http://localhost/api/v1/unidades/1", {
                method: "PUT",
                body: JSON.stringify({
                    sigla: "", // Sigla vacía
                }),
            });
            const response = await v1UnidadIdPut(req, { params: Promise.resolve({ id: "1" }) });

            expect(response.status).toBe(400);
        });

        it("debe fallar si no hay datos para actualizar", async () => {
            const mockUnidadExistente = {
                id: 1,
                nombre: "Grados Celsius",
                sigla: "°C",
            };
            (prisma.unidad.findFirst as jest.Mock).mockResolvedValue(mockUnidadExistente);

            const req = new NextRequest("http://localhost/api/v1/unidades/1", {
                method: "PUT",
                body: JSON.stringify({}), // Sin datos
            });
            const response = await v1UnidadIdPut(req, { params: Promise.resolve({ id: "1" }) });

            expect(response.status).toBe(400);
        });
    });
});
