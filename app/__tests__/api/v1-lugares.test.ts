/** @jest-environment node */
import { NextRequest } from "next/server";

import { GET as v1LugaresGet, POST as v1LugaresPost } from "@/app/api/v1/lugares/route";
import {
    GET as v1LugarIdGet,
    PUT as v1LugarIdPut
} from "@/app/api/v1/lugares/[id]/route";
import prisma from "@/lib/prisma";
import { LugaresService } from "@/lib/services/lugares";

// Mock de Prisma
jest.mock("@/lib/prisma", () => ({
    __esModule: true,
    default: {
        lugar: { findFirst: jest.fn(), update: jest.fn() },
    },
}));

// Mock de los servicios
jest.mock("@/lib/services/lugares", () => ({
    LugaresService: {
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

describe("API v1 - Lugares Endpoints", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /api/v1/lugares", () => {
        it("debe listar lugares con paginación", async () => {
            const mockResult = {
                data: [{ id: 1, nombre: "Lugar 1" }],
                pagination: { total: 1, page: 1, limit: 50, totalPages: 1, hasNext: false, hasPrevious: false }
            };
            (LugaresService.findAll as jest.Mock).mockResolvedValue(mockResult);

            const req = new NextRequest("http://localhost/api/v1/lugares?page=1&limit=50&q=");
            const response = await v1LugaresGet(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data).toHaveLength(1);
        });

        it("debe filtrar por query string", async () => {
            const mockResult = {
                data: [{ id: 1, nombre: "Playa Norte" }],
                pagination: { total: 1, page: 1, limit: 50, totalPages: 1, hasNext: false, hasPrevious: false }
            };
            (LugaresService.findAll as jest.Mock).mockResolvedValue(mockResult);

            const req = new NextRequest("http://localhost/api/v1/lugares?q=Playa");
            const response = await v1LugaresGet(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });

        it("debe fallar con parámetros de filtro inválidos", async () => {
            const req = new NextRequest("http://localhost/api/v1/lugares?page=invalid");
            const response = await v1LugaresGet(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });
    });

    describe("POST /api/v1/lugares", () => {
        it("debe crear un nuevo lugar", async () => {
            const mockLugar = { id: 1, nombre: "Nuevo Lugar", latitud: -33.45, longitud: -70.66 };
            (LugaresService.create as jest.Mock).mockResolvedValue(mockLugar);

            const req = new NextRequest("http://localhost/api/v1/lugares", {
                method: "POST",
                body: JSON.stringify({
                    nombre: "Nuevo Lugar",
                    latitud: -33.45,
                    longitud: -70.66,
                }),
            });

            const response = await v1LugaresPost(req);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.data.nombre).toBe("Nuevo Lugar");
        });

        it("debe fallar con datos inválidos", async () => {
            const req = new NextRequest("http://localhost/api/v1/lugares", {
                method: "POST",
                body: JSON.stringify({
                    nombre: "", // Nombre vacío
                }),
            });

            const response = await v1LugaresPost(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });
    });

    describe("GET /api/v1/lugares/[id]", () => {
        it("debe obtener un lugar por ID", async () => {
            const mockLugar = {
                id: 1,
                nombre: "Lugar 1",
                nota: "Nota de prueba",
                latitud: -33.45,
                longitud: -70.66,
                created_at: new Date(),
                _count: { mediciones: 0, ciclos: 0 }
            };
            (prisma.lugar.findFirst as jest.Mock).mockResolvedValue(mockLugar);

            const req = new NextRequest("http://localhost/api/v1/lugares/1");
            const response = await v1LugarIdGet(req, { params: Promise.resolve({ id: "1" }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.id).toBe(1);
        });

        it("debe fallar con ID inválido", async () => {
            const req = new NextRequest("http://localhost/api/v1/lugares/invalid");
            const response = await v1LugarIdGet(req, { params: Promise.resolve({ id: "invalid" }) });

            expect(response.status).toBe(400);
        });

        it("debe retornar 404 si el lugar no existe", async () => {
            (prisma.lugar.findFirst as jest.Mock).mockResolvedValue(null);

            const req = new NextRequest("http://localhost/api/v1/lugares/999");
            const response = await v1LugarIdGet(req, { params: Promise.resolve({ id: "999" }) });

            expect(response.status).toBe(404);
        });
    });

    describe("PUT /api/v1/lugares/[id]", () => {
        it("debe actualizar un lugar", async () => {
            const mockLugarExistente = {
                id: 1,
                nombre: "Lugar 1",
                nota: "Nota original",
                latitud: -33.45,
                longitud: -70.66,
            };
            const mockLugarActualizado = {
                id: 1,
                nombre: "Lugar Actualizado",
                nota: "Nota actualizada",
                latitud: -33.46,
                longitud: -70.67,
                created_at: new Date(),
            };

            (prisma.lugar.findFirst as jest.Mock).mockResolvedValue(mockLugarExistente);
            (prisma.lugar.update as jest.Mock).mockResolvedValue(mockLugarActualizado);

            const req = new NextRequest("http://localhost/api/v1/lugares/1", {
                method: "PUT",
                body: JSON.stringify({
                    nombre: "Lugar Actualizado",
                    nota: "Nota actualizada",
                    latitud: -33.46,
                    longitud: -70.67,
                }),
            });

            const response = await v1LugarIdPut(req, { params: Promise.resolve({ id: "1" }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.nombre).toBe("Lugar Actualizado");
        });

        it("debe fallar con ID inválido", async () => {
            const req = new NextRequest("http://localhost/api/v1/lugares/invalid", {
                method: "PUT",
                body: JSON.stringify({ nombre: "Test" }),
            });
            const response = await v1LugarIdPut(req, { params: Promise.resolve({ id: "invalid" }) });

            expect(response.status).toBe(400);
        });

        it("debe fallar si el lugar no existe", async () => {
            (prisma.lugar.findFirst as jest.Mock).mockResolvedValue(null);

            const req = new NextRequest("http://localhost/api/v1/lugares/999", {
                method: "PUT",
                body: JSON.stringify({ nombre: "Test" }),
            });
            const response = await v1LugarIdPut(req, { params: Promise.resolve({ id: "999" }) });

            expect(response.status).toBe(404);
        });

        it("debe fallar si el nombre está vacío", async () => {
            const mockLugarExistente = {
                id: 1,
                nombre: "Lugar 1",
                nota: "Nota original",
                latitud: -33.45,
                longitud: -70.66,
            };
            (prisma.lugar.findFirst as jest.Mock).mockResolvedValue(mockLugarExistente);

            const req = new NextRequest("http://localhost/api/v1/lugares/1", {
                method: "PUT",
                body: JSON.stringify({
                    nombre: "", // Nombre vacío
                }),
            });
            const response = await v1LugarIdPut(req, { params: Promise.resolve({ id: "1" }) });

            expect(response.status).toBe(400);
        });

        it("debe fallar si la latitud es inválida", async () => {
            const mockLugarExistente = {
                id: 1,
                nombre: "Lugar 1",
                nota: "Nota original",
                latitud: -33.45,
                longitud: -70.66,
            };
            (prisma.lugar.findFirst as jest.Mock).mockResolvedValue(mockLugarExistente);

            const req = new NextRequest("http://localhost/api/v1/lugares/1", {
                method: "PUT",
                body: JSON.stringify({
                    latitud: 100, // Fuera de rango (-90 a 90)
                }),
            });
            const response = await v1LugarIdPut(req, { params: Promise.resolve({ id: "1" }) });

            expect(response.status).toBe(400);
        });

        it("debe fallar si la longitud es inválida", async () => {
            const mockLugarExistente = {
                id: 1,
                nombre: "Lugar 1",
                nota: "Nota original",
                latitud: -33.45,
                longitud: -70.66,
            };
            (prisma.lugar.findFirst as jest.Mock).mockResolvedValue(mockLugarExistente);

            const req = new NextRequest("http://localhost/api/v1/lugares/1", {
                method: "PUT",
                body: JSON.stringify({
                    longitud: 200, // Fuera de rango (-180 a 180)
                }),
            });
            const response = await v1LugarIdPut(req, { params: Promise.resolve({ id: "1" }) });

            expect(response.status).toBe(400);
        });

        it("debe fallar si no hay datos para actualizar", async () => {
            const mockLugarExistente = {
                id: 1,
                nombre: "Lugar 1",
                nota: "Nota original",
                latitud: -33.45,
                longitud: -70.66,
            };
            (prisma.lugar.findFirst as jest.Mock).mockResolvedValue(mockLugarExistente);

            const req = new NextRequest("http://localhost/api/v1/lugares/1", {
                method: "PUT",
                body: JSON.stringify({}), // Sin datos
            });
            const response = await v1LugarIdPut(req, { params: Promise.resolve({ id: "1" }) });

            expect(response.status).toBe(400);
        });
    });
});
