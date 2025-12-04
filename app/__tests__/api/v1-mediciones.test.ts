/** @jest-environment node */
import { NextRequest } from "next/server";

import { GET as v1MedicionesGet, POST as v1MedicionesPost } from "@/app/api/v1/mediciones/route";
import {
    GET as v1MedicionIdGet,
    PUT as v1MedicionIdPut
} from "@/app/api/v1/mediciones/[id]/route";
import prisma from "@/lib/prisma";
import { MedicionesService } from "@/lib/services/mediciones";

// Mock de Prisma
jest.mock("@/lib/prisma", () => ({
    __esModule: true,
    default: {
        lugar: { findFirst: jest.fn() },
        unidad: { findFirst: jest.fn() },
        tipoRegistro: { findUnique: jest.fn() },
        origenDato: { findFirst: jest.fn() },
        ciclo: { findFirst: jest.fn() },
        medicion: { findFirst: jest.fn(), update: jest.fn() },
    },
}));

// Mock de los servicios
jest.mock("@/lib/services/mediciones", () => ({
    MedicionesService: {
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

describe("API v1 - Mediciones Endpoints", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /api/v1/mediciones", () => {
        it("debe listar mediciones con paginación", async () => {
            const mockResult = {
                data: [{ id: 1, valor: 25.5 }],
                pagination: { total: 1, page: 1, limit: 50, totalPages: 1, hasNext: false, hasPrevious: false }
            };
            (MedicionesService.findAll as jest.Mock).mockResolvedValue(mockResult);

            const req = new NextRequest("http://localhost/api/v1/mediciones?page=1&limit=50");
            const response = await v1MedicionesGet(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data).toHaveLength(1);
        });

        it("debe filtrar por lugar_id", async () => {
            const mockResult = {
                data: [{ id: 1, valor: 25.5, lugar_id: 1 }],
                pagination: { total: 1, page: 1, limit: 50, totalPages: 1, hasNext: false, hasPrevious: false }
            };
            (MedicionesService.findAll as jest.Mock).mockResolvedValue(mockResult);

            const req = new NextRequest("http://localhost/api/v1/mediciones?lugar_id=1");
            const response = await v1MedicionesGet(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });

        it("debe filtrar por fecha", async () => {
            const mockResult = {
                data: [{ id: 1, valor: 25.5 }],
                pagination: { total: 1, page: 1, limit: 50, totalPages: 1, hasNext: false, hasPrevious: false }
            };
            (MedicionesService.findAll as jest.Mock).mockResolvedValue(mockResult);

            const req = new NextRequest("http://localhost/api/v1/mediciones?fecha_desde=2024-01-01&fecha_hasta=2024-12-31");
            const response = await v1MedicionesGet(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });

        it("debe fallar con parámetros de filtro inválidos", async () => {
            const req = new NextRequest("http://localhost/api/v1/mediciones?page=invalid");
            const response = await v1MedicionesGet(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });
    });

    describe("POST /api/v1/mediciones", () => {
        it("debe crear una nueva medición", async () => {
            const mockMedicion = { id: 1, valor: 30.0 };
            (prisma.lugar.findFirst as jest.Mock).mockResolvedValue({ id: 1, nombre: "Lugar 1" });
            (prisma.unidad.findFirst as jest.Mock).mockResolvedValue({ id: 1, nombre: "Unidad 1" });
            (prisma.tipoRegistro.findUnique as jest.Mock).mockResolvedValue({ id: 1, codigo: "T1" });
            (prisma.origenDato.findFirst as jest.Mock).mockResolvedValue({ id: 1, nombre: "Origen 1" });
            (MedicionesService.create as jest.Mock).mockResolvedValue(mockMedicion);

            const req = new NextRequest("http://localhost/api/v1/mediciones", {
                method: "POST",
                body: JSON.stringify({
                    valor: 30.0,
                    fecha_medicion: new Date().toISOString(),
                    lugar_id: 1,
                    unidad_id: 1,
                    tipo_id: 1,
                    origen_id: 1,
                }),
            });

            const response = await v1MedicionesPost(req);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.data.valor).toBe(30.0);
        });

        it("debe crear una medición con ciclo", async () => {
            const mockMedicion = { id: 1, valor: 30.0 };
            (prisma.lugar.findFirst as jest.Mock).mockResolvedValue({ id: 1, nombre: "Lugar 1" });
            (prisma.unidad.findFirst as jest.Mock).mockResolvedValue({ id: 1, nombre: "Unidad 1" });
            (prisma.tipoRegistro.findUnique as jest.Mock).mockResolvedValue({ id: 1, codigo: "T1" });
            (prisma.origenDato.findFirst as jest.Mock).mockResolvedValue({ id: 1, nombre: "Origen 1" });
            (prisma.ciclo.findFirst as jest.Mock).mockResolvedValue({ id: 1, nombre: "Ciclo 1" });
            (MedicionesService.create as jest.Mock).mockResolvedValue(mockMedicion);

            const req = new NextRequest("http://localhost/api/v1/mediciones", {
                method: "POST",
                body: JSON.stringify({
                    valor: 30.0,
                    fecha_medicion: new Date().toISOString(),
                    lugar_id: 1,
                    unidad_id: 1,
                    tipo_id: 1,
                    origen_id: 1,
                    ciclo_id: 1,
                }),
            });

            const response = await v1MedicionesPost(req);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
        });

        it("debe fallar si el lugar no existe", async () => {
            (prisma.lugar.findFirst as jest.Mock).mockResolvedValue(null);

            const req = new NextRequest("http://localhost/api/v1/mediciones", {
                method: "POST",
                body: JSON.stringify({
                    valor: 30.0,
                    fecha_medicion: new Date().toISOString(),
                    lugar_id: 999,
                    unidad_id: 1,
                    tipo_id: 1,
                    origen_id: 1,
                }),
            });

            const response = await v1MedicionesPost(req);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.success).toBe(false);
            expect(data.message).toContain("Lugar no encontrado");
        });

        it("debe fallar si la unidad no existe", async () => {
            (prisma.lugar.findFirst as jest.Mock).mockResolvedValue({ id: 1, nombre: "Lugar 1" });
            (prisma.unidad.findFirst as jest.Mock).mockResolvedValue(null);

            const req = new NextRequest("http://localhost/api/v1/mediciones", {
                method: "POST",
                body: JSON.stringify({
                    valor: 30.0,
                    fecha_medicion: new Date().toISOString(),
                    lugar_id: 1,
                    unidad_id: 999,
                    tipo_id: 1,
                    origen_id: 1,
                }),
            });

            const response = await v1MedicionesPost(req);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.success).toBe(false);
            expect(data.message).toContain("Unidad no encontrada");
        });

        it("debe fallar si el tipo no existe", async () => {
            (prisma.lugar.findFirst as jest.Mock).mockResolvedValue({ id: 1, nombre: "Lugar 1" });
            (prisma.unidad.findFirst as jest.Mock).mockResolvedValue({ id: 1, nombre: "Unidad 1" });
            (prisma.tipoRegistro.findUnique as jest.Mock).mockResolvedValue(null);

            const req = new NextRequest("http://localhost/api/v1/mediciones", {
                method: "POST",
                body: JSON.stringify({
                    valor: 30.0,
                    fecha_medicion: new Date().toISOString(),
                    lugar_id: 1,
                    unidad_id: 1,
                    tipo_id: 999,
                    origen_id: 1,
                }),
            });

            const response = await v1MedicionesPost(req);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.success).toBe(false);
            expect(data.message).toContain("Tipo de registro no encontrado");
        });

        it("debe fallar si el origen no existe", async () => {
            (prisma.lugar.findFirst as jest.Mock).mockResolvedValue({ id: 1, nombre: "Lugar 1" });
            (prisma.unidad.findFirst as jest.Mock).mockResolvedValue({ id: 1, nombre: "Unidad 1" });
            (prisma.tipoRegistro.findUnique as jest.Mock).mockResolvedValue({ id: 1, codigo: "T1" });
            (prisma.origenDato.findFirst as jest.Mock).mockResolvedValue(null);

            const req = new NextRequest("http://localhost/api/v1/mediciones", {
                method: "POST",
                body: JSON.stringify({
                    valor: 30.0,
                    fecha_medicion: new Date().toISOString(),
                    lugar_id: 1,
                    unidad_id: 1,
                    tipo_id: 1,
                    origen_id: 999,
                }),
            });

            const response = await v1MedicionesPost(req);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.success).toBe(false);
            expect(data.message).toContain("Origen de datos no encontrado");
        });

        it("debe fallar si el ciclo no existe", async () => {
            (prisma.lugar.findFirst as jest.Mock).mockResolvedValue({ id: 1, nombre: "Lugar 1" });
            (prisma.unidad.findFirst as jest.Mock).mockResolvedValue({ id: 1, nombre: "Unidad 1" });
            (prisma.tipoRegistro.findUnique as jest.Mock).mockResolvedValue({ id: 1, codigo: "T1" });
            (prisma.origenDato.findFirst as jest.Mock).mockResolvedValue({ id: 1, nombre: "Origen 1" });
            (prisma.ciclo.findFirst as jest.Mock).mockResolvedValue(null);

            const req = new NextRequest("http://localhost/api/v1/mediciones", {
                method: "POST",
                body: JSON.stringify({
                    valor: 30.0,
                    fecha_medicion: new Date().toISOString(),
                    lugar_id: 1,
                    unidad_id: 1,
                    tipo_id: 1,
                    origen_id: 1,
                    ciclo_id: 999,
                }),
            });

            const response = await v1MedicionesPost(req);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.success).toBe(false);
            expect(data.message).toContain("Ciclo no encontrado");
        });

        it("debe fallar con datos inválidos", async () => {
            const req = new NextRequest("http://localhost/api/v1/mediciones", {
                method: "POST",
                body: JSON.stringify({
                    valor: "invalid", // Valor inválido
                }),
            });

            const response = await v1MedicionesPost(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });
    });

    describe("GET /api/v1/mediciones/[id]", () => {
        it("debe obtener una medición por ID", async () => {
            const mockMedicion = {
                id: 1,
                valor: 25.5,
                fecha_medicion: new Date(),
                notas: null,
                created_at: new Date(),
                lugar: { id: 1, nombre: "Lugar 1" },
                unidad: { id: 1, nombre: "Unidad 1", sigla: "U1" },
                tipo: { id: 1, codigo: "T1", descripcion: "Tipo 1" },
                origen: { id: 1, nombre: "Origen 1" },
                ciclo: null,
            };
            (prisma.medicion.findFirst as jest.Mock).mockResolvedValue(mockMedicion);

            const req = new NextRequest("http://localhost/api/v1/mediciones/1");
            const response = await v1MedicionIdGet(req, { params: Promise.resolve({ id: "1" }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.id).toBe(1);
        });

        it("debe fallar con ID inválido", async () => {
            const req = new NextRequest("http://localhost/api/v1/mediciones/invalid");
            const response = await v1MedicionIdGet(req, { params: Promise.resolve({ id: "invalid" }) });

            expect(response.status).toBe(400);
        });

        it("debe retornar 404 si la medición no existe", async () => {
            (prisma.medicion.findFirst as jest.Mock).mockResolvedValue(null);

            const req = new NextRequest("http://localhost/api/v1/mediciones/999");
            const response = await v1MedicionIdGet(req, { params: Promise.resolve({ id: "999" }) });

            expect(response.status).toBe(404);
        });
    });

    describe("PUT /api/v1/mediciones/[id]", () => {
        it("debe actualizar una medición", async () => {
            const mockMedicionExistente = {
                id: 1,
                valor: 25.5,
                fecha_medicion: new Date(),
                notas: "Notas originales",
            };
            const mockMedicionActualizada = {
                id: 1,
                valor: 35.0,
                fecha_medicion: new Date(),
                notas: "Notas actualizadas",
                created_at: new Date(),
                updated_at: new Date(),
                lugar: { id: 1, nombre: "Lugar 1" },
                unidad: { id: 1, nombre: "Unidad 1", sigla: "U1" },
                tipo: { id: 1, codigo: "T1" },
                ciclo: null,
            };

            (prisma.medicion.findFirst as jest.Mock).mockResolvedValue(mockMedicionExistente);
            (prisma.medicion.update as jest.Mock).mockResolvedValue(mockMedicionActualizada);

            const req = new NextRequest("http://localhost/api/v1/mediciones/1", {
                method: "PUT",
                body: JSON.stringify({
                    valor: 35.0,
                    notas: "Notas actualizadas",
                }),
            });

            const response = await v1MedicionIdPut(req, { params: Promise.resolve({ id: "1" }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.valor).toBe(35.0);
        });

        it("debe actualizar una medición con ciclo", async () => {
            const mockMedicionExistente = {
                id: 1,
                valor: 25.5,
                fecha_medicion: new Date(),
                notas: "Notas originales",
            };
            const mockMedicionActualizada = {
                id: 1,
                valor: 25.5,
                fecha_medicion: new Date(),
                notas: "Notas originales",
                created_at: new Date(),
                updated_at: new Date(),
                lugar: { id: 1, nombre: "Lugar 1" },
                unidad: { id: 1, nombre: "Unidad 1", sigla: "U1" },
                tipo: { id: 1, codigo: "T1" },
                ciclo: { id: 1, nombre: "Ciclo 1" },
            };

            (prisma.medicion.findFirst as jest.Mock).mockResolvedValue(mockMedicionExistente);
            (prisma.ciclo.findFirst as jest.Mock).mockResolvedValue({ id: 1, nombre: "Ciclo 1" });
            (prisma.medicion.update as jest.Mock).mockResolvedValue(mockMedicionActualizada);

            const req = new NextRequest("http://localhost/api/v1/mediciones/1", {
                method: "PUT",
                body: JSON.stringify({
                    ciclo_id: 1,
                }),
            });

            const response = await v1MedicionIdPut(req, { params: Promise.resolve({ id: "1" }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });

        it("debe fallar con ID inválido", async () => {
            const req = new NextRequest("http://localhost/api/v1/mediciones/invalid", {
                method: "PUT",
                body: JSON.stringify({ valor: 30.0 }),
            });
            const response = await v1MedicionIdPut(req, { params: Promise.resolve({ id: "invalid" }) });

            expect(response.status).toBe(400);
        });

        it("debe fallar si la medición no existe", async () => {
            (prisma.medicion.findFirst as jest.Mock).mockResolvedValue(null);

            const req = new NextRequest("http://localhost/api/v1/mediciones/999", {
                method: "PUT",
                body: JSON.stringify({ valor: 30.0 }),
            });
            const response = await v1MedicionIdPut(req, { params: Promise.resolve({ id: "999" }) });

            expect(response.status).toBe(404);
        });

        it("debe fallar si el valor no es numérico", async () => {
            const mockMedicionExistente = {
                id: 1,
                valor: 25.5,
                fecha_medicion: new Date(),
                notas: "Notas originales",
            };
            (prisma.medicion.findFirst as jest.Mock).mockResolvedValue(mockMedicionExistente);

            const req = new NextRequest("http://localhost/api/v1/mediciones/1", {
                method: "PUT",
                body: JSON.stringify({
                    valor: "invalid",
                }),
            });
            const response = await v1MedicionIdPut(req, { params: Promise.resolve({ id: "1" }) });

            expect(response.status).toBe(400);
        });

        it("debe fallar si el ciclo no existe", async () => {
            const mockMedicionExistente = {
                id: 1,
                valor: 25.5,
                fecha_medicion: new Date(),
                notas: "Notas originales",
            };
            (prisma.medicion.findFirst as jest.Mock).mockResolvedValue(mockMedicionExistente);
            (prisma.ciclo.findFirst as jest.Mock).mockResolvedValue(null);

            const req = new NextRequest("http://localhost/api/v1/mediciones/1", {
                method: "PUT",
                body: JSON.stringify({
                    ciclo_id: 999,
                }),
            });
            const response = await v1MedicionIdPut(req, { params: Promise.resolve({ id: "1" }) });

            expect(response.status).toBe(404);
        });
    });
});
