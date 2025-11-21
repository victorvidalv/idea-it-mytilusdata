/** @jest-environment node */
import { NextRequest } from "next/server";

import { GET as medicionesGet, POST as medicionesPost } from "@/app/api/mediciones/route";
import {
    GET as medicionIdGet,
    PUT as medicionIdPut,
    DELETE as medicionIdDelete
} from "@/app/api/mediciones/[id]/route";
import { MedicionesService } from "@/lib/services";

// Mock de los servicios
jest.mock("@/lib/services", () => ({
    MedicionesService: {
        findAll: jest.fn(),
        create: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        softDelete: jest.fn(),
    },
    MedicionesExportService: {
        exportToCSVStream: jest.fn(),
    }
}));

// Mock de middlewares
jest.mock("@/lib/middleware", () => ({
    withRole: (handler: any) => (req: any, ctx: any) => {
        req.user = { userId: 1, email: "admin@example.com", rol: "ADMIN" };
        return handler(req, ctx);
    },
    withRateLimit: (handler: any) => handler,
    withCSRFProtection: (handler: any) => handler,
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

describe("Mediciones API Endpoints", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /api/mediciones", () => {
        it("debe listar mediciones con paginación", async () => {
            const mockResult = {
                data: [{ id: 1, valor: 25.5 }],
                pagination: { total: 1, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrevious: false }
            };
            (MedicionesService.findAll as jest.Mock).mockResolvedValue(mockResult);

            const req = new NextRequest("http://localhost/api/mediciones?page=1&limit=20");
            const response = await medicionesGet(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data).toHaveLength(1);
        });
    });

    describe("POST /api/mediciones", () => {
        it("debe crear una nueva medición", async () => {
            const mockMedicion = { id: 1, valor: 30.0 };
            (MedicionesService.create as jest.Mock).mockResolvedValue(mockMedicion);

            const req = new NextRequest("http://localhost/api/mediciones", {
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

            const response = await medicionesPost(req);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.data.valor).toBe(30.0);
        });
    });

    describe("GET /api/mediciones/[id]", () => {
        it("debe obtener una medición por ID", async () => {
            const mockMedicion = { id: 1, valor: 25.5 };
            (MedicionesService.findById as jest.Mock).mockResolvedValue(mockMedicion);

            const req = new NextRequest("http://localhost/api/mediciones/1");
            const response = await medicionIdGet(req, { params: Promise.resolve({ id: "1" }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.id).toBe(1);
        });

        it("debe retornar 404 si no existe", async () => {
            (MedicionesService.findById as jest.Mock).mockResolvedValue(null);

            const req = new NextRequest("http://localhost/api/mediciones/999");
            const response = await medicionIdGet(req, { params: Promise.resolve({ id: "999" }) });

            expect(response.status).toBe(404);
        });
    });

    describe("PUT /api/mediciones/[id]", () => {
        it("debe actualizar una medición", async () => {
            const mockMedicion = { id: 1, valor: 35.0 };
            (MedicionesService.update as jest.Mock).mockResolvedValue(mockMedicion);

            const req = new NextRequest("http://localhost/api/mediciones/1", {
                method: "PUT",
                body: JSON.stringify({ valor: 35.0 }),
            });

            const response = await medicionIdPut(req, { params: Promise.resolve({ id: "1" }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.valor).toBe(35.0);
        });
    });

    describe("DELETE /api/mediciones/[id]", () => {
        it("debe realizar un borrado lógico", async () => {
            (MedicionesService.softDelete as jest.Mock).mockResolvedValue({ id: 1 });

            const req = new NextRequest("http://localhost/api/mediciones/1", {
                method: "DELETE",
            });

            const response = await medicionIdDelete(req, { params: Promise.resolve({ id: "1" }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });
    });
});
