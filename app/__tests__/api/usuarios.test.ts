/** @jest-environment node */
import { NextRequest } from "next/server";
import { GET as usuariosGet, POST as usuariosPost } from "@/app/api/usuarios/route";
import { GET as profileGet, PATCH as profilePatch } from "@/app/api/usuarios/me/route";
import prisma from "@/lib/prisma";

// Mock de Prisma
jest.mock("@/lib/prisma", () => ({
    __esModule: true,
    default: {
        usuario: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
    },
}));

// Mock de middlewares
jest.mock("@/lib/middleware", () => ({
    withRole: (handler: any) => (req: any, ctx: any) => {
        req.user = { userId: 1, email: "admin@example.com", rol: "ADMIN" };
        return handler(req, ctx);
    },
}));

// Mock del logger
jest.mock("@/lib/utils/logger", () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        getRequestId: jest.fn(() => "test-request-id"),
    },
}));

describe("Usuarios API Endpoints", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /api/usuarios", () => {
        it("debe listar usuarios para el administrador", async () => {
            const mockUsers = [{ id: 1, nombre: "Admin", email: "admin@example.com", rol: "ADMIN" }];
            (prisma.usuario.findMany as jest.Mock).mockResolvedValue(mockUsers);

            const req = new NextRequest("http://localhost/api/usuarios");
            const response = await usuariosGet(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data).toHaveLength(1);
        });
    });

    describe("GET /api/usuarios/me", () => {
        it("debe retornar el perfil del usuario autenticado", async () => {
            const mockUser = { id: 1, nombre: "Test", email: "test@example.com", rol: "ADMIN" };
            (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const req = new NextRequest("http://localhost/api/usuarios/me");
            const response = await profileGet(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.id).toBe(1);
        });
    });

    describe("POST /api/usuarios", () => {
        it("debe permitir al administrador crear nuevos usuarios", async () => {
            (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.usuario.create as jest.Mock).mockResolvedValue({ id: 2, email: "new@example.com" });

            const req = new NextRequest("http://localhost/api/usuarios", {
                method: "POST",
                body: JSON.stringify({
                    nombre: "Nuevo Usuario",
                    email: "new@example.com",
                    password: "password123",
                    rol: "EQUIPO"
                }),
            });

            const response = await usuariosPost(req);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
        });
    });

    describe("PATCH /api/usuarios/me", () => {
        it("debe actualizar el nombre del usuario", async () => {
            (prisma.usuario.update as jest.Mock).mockResolvedValue({ id: 1, nombre: "Nuevo Nombre" });

            const req = new NextRequest("http://localhost/api/usuarios/me", {
                method: "PATCH",
                body: JSON.stringify({ nombre: "Nuevo Nombre" }),
            });

            const response = await profilePatch(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.data.nombre).toBe("Nuevo Nombre");
        });
    });

    describe("Operaciones por ID /api/usuarios/[id]", () => {
        const { GET, PATCH } = require("@/app/api/usuarios/[id]/route");

        it("debe obtener un usuario por ID", async () => {
            const mockUser = { id: 2, nombre: "Otro", email: "otro@ex.com" };
            (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const req = new NextRequest("http://localhost/api/usuarios/2");
            const response = await GET(req, { params: Promise.resolve({ id: "2" }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.data.id).toBe(2);
        });

        it("debe actualizar el rol de un usuario", async () => {
            (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({ id: 2, rol: "EQUIPO" });
            (prisma.usuario.update as jest.Mock).mockResolvedValue({ id: 2, rol: "ADMIN" });

            const req = new NextRequest("http://localhost/api/usuarios/2", {
                method: "PATCH",
                body: JSON.stringify({ rol: "ADMIN" }),
            });

            const response = await PATCH(req, { params: Promise.resolve({ id: "2" }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.data.rol).toBe("ADMIN");
        });

        it("debe retornar 404 si el usuario no existe", async () => {
            (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null);

            const req = new NextRequest("http://localhost/api/usuarios/999");
            const response = await GET(req, { params: Promise.resolve({ id: "999" }) });

            expect(response.status).toBe(404);
        });
    });
});
