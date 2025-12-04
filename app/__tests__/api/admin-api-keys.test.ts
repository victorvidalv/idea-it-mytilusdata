/** @jest-environment node */
import { NextRequest } from "next/server";

import { GET as apiKeysGet, POST as apiKeysPost } from "@/app/api/admin/api-keys/route";
import {
    GET as apiKeyIdGet,
    DELETE as apiKeyIdDelete
} from "@/app/api/admin/api-keys/[id]/route";
import { ApiKeysService } from "@/lib/services/api-keys";

// Mock de los servicios
jest.mock("@/lib/services/api-keys", () => ({
    ApiKeysService: {
        findAll: jest.fn(),
        findAllByUser: jest.fn(),
        create: jest.fn(),
        findById: jest.fn(),
        revoke: jest.fn(),
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

describe("Admin API Keys Endpoints", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /api/admin/api-keys", () => {
        it("debe listar todas las API keys para administrador", async () => {
            const mockApiKeys = [
                { id: 1, nombre: "API Key 1", activa: true },
                { id: 2, nombre: "API Key 2", activa: false }
            ];
            (ApiKeysService.findAll as jest.Mock).mockResolvedValue(mockApiKeys);

            const req = new NextRequest("http://localhost/api/admin/api-keys");
            const response = await apiKeysGet(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data).toHaveLength(2);
            expect(data.total).toBe(2);
        });

        it("debe listar todas las API keys para administrador", async () => {
            const mockApiKeys = [
                { id: 1, nombre: "API Key 1", activa: true },
                { id: 2, nombre: "API Key 2", activa: false }
            ];
            (ApiKeysService.findAll as jest.Mock).mockResolvedValue(mockApiKeys);

            const req = new NextRequest("http://localhost/api/admin/api-keys");
            const response = await apiKeysGet(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data).toHaveLength(2);
            expect(data.total).toBe(2);
        });
    });

    describe("POST /api/admin/api-keys", () => {
        it("debe crear una nueva API key", async () => {
            const mockApiKey = {
                id: 1,
                nombre: "Nueva API Key",
                key: "sk_test_123456",
                permisos: ["mediciones:read", "mediciones:write"],
                activa: true
            };
            (ApiKeysService.create as jest.Mock).mockResolvedValue(mockApiKey);

            const req = new NextRequest("http://localhost/api/admin/api-keys", {
                method: "POST",
                body: JSON.stringify({
                    nombre: "Nueva API Key",
                    permisos: ["mediciones:read", "mediciones:write"],
                }),
            });

            const response = await apiKeysPost(req);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.data.nombre).toBe("Nueva API Key");
            expect(data.message).toContain("creada exitosamente");
        });

        it("debe fallar con datos inválidos", async () => {
            const req = new NextRequest("http://localhost/api/admin/api-keys", {
                method: "POST",
                body: JSON.stringify({
                    nombre: "", // Nombre vacío
                    permisos: [],
                }),
            });

            const response = await apiKeysPost(req);
            const data = await response.json();

            expect(response.status).toBe(422);
            expect(data.success).toBe(false);
        });
    });

    describe("GET /api/admin/api-keys/[id]", () => {
        it("debe obtener una API key por ID", async () => {
            const mockApiKey = {
                id: 1,
                nombre: "API Key 1",
                key: "sk_test_123456",
                permisos: ["mediciones:read"],
                activa: true
            };
            (ApiKeysService.findById as jest.Mock).mockResolvedValue(mockApiKey);

            const req = new NextRequest("http://localhost/api/admin/api-keys/1");
            const response = await apiKeyIdGet(req, { params: Promise.resolve({ id: "1" }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.id).toBe(1);
        });

        it("debe retornar 404 si la API key no existe", async () => {
            (ApiKeysService.findById as jest.Mock).mockResolvedValue(null);

            const req = new NextRequest("http://localhost/api/admin/api-keys/999");
            const response = await apiKeyIdGet(req, { params: Promise.resolve({ id: "999" }) });

            expect(response.status).toBe(404);
        });
    });

    describe("DELETE /api/admin/api-keys/[id]", () => {
        it("debe revocar una API key", async () => {
            (ApiKeysService.revoke as jest.Mock).mockResolvedValue({ id: 1, activa: false });

            const req = new NextRequest("http://localhost/api/admin/api-keys/1", {
                method: "DELETE",
            });

            const response = await apiKeyIdDelete(req, { params: Promise.resolve({ id: "1" }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.message).toContain("revocada exitosamente");
        });
    });
});
