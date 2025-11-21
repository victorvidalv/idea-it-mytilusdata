/** @jest-environment node */
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

// Mock de Prisma
jest.mock("@/lib/prisma", () => ({
    __esModule: true,
    default: {
        lugar: { findMany: jest.fn(), create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
        unidad: { findMany: jest.fn(), create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
        origenDato: { findMany: jest.fn(), create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
        tipoRegistro: { findMany: jest.fn(), create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
        medicion: { count: jest.fn() },
    },
}));

// Mock de autenticación
jest.mock("@/lib/middleware/auth", () => ({
    verifyAuth: jest.fn().mockResolvedValue({ id: 1, email: "admin@example.com", rol: "ADMIN" }),
    isAuthError: jest.fn().mockReturnValue(false),
    getClientIp: jest.fn().mockReturnValue("127.0.0.1"),
}));

describe("Catálogos API Endpoints", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("API Lugares", () => {
        const { GET, POST } = require("@/app/api/lugares/route");
        const { GET: GET_ID, PUT, DELETE } = require("@/app/api/lugares/[id]/route");

        it("GET /api/lugares debe listar lugares", async () => {
            (prisma.lugar.findMany as jest.Mock).mockResolvedValue([{ id: 1, nombre: "Playa" }]);
            const req = new NextRequest("http://localhost/api/lugares");
            const res = await GET(req);
            expect(res.status).toBe(200);
        });

        it("PUT /api/lugares/[id] debe actualizar", async () => {
            (prisma.lugar.findFirst as jest.Mock).mockResolvedValue({ id: 1 });
            (prisma.lugar.update as jest.Mock).mockResolvedValue({ id: 1, nombre: "Editado" });
            const req = new NextRequest("http://localhost/api/lugares/1", {
                method: "PUT",
                body: JSON.stringify({ nombre: "Editado" }),
            });
            const res = await PUT(req, { params: Promise.resolve({ id: "1" }) });
            expect(res.status).toBe(200);
        });
    });

    describe("API Unidades", () => {
        const { GET, POST } = require("@/app/api/unidades/route");
        const { GET: GET_ID, DELETE } = require("@/app/api/unidades/[id]/route");

        it("DELETE /api/unidades/[id] debe realizar borrado lógico", async () => {
            (prisma.unidad.findFirst as jest.Mock).mockResolvedValue({ id: 1 });
            (prisma.medicion.count as jest.Mock).mockResolvedValue(0);
            (prisma.unidad.update as jest.Mock).mockResolvedValue({ id: 1 });
            const req = new NextRequest("http://localhost/api/unidades/1", { method: "DELETE" });
            const res = await DELETE(req, { params: Promise.resolve({ id: "1" }) });
            expect(res.status).toBe(200);
        });
    });

    describe("API Orígenes", () => {
        const { GET, POST } = require("@/app/api/origenes/route");
        const { DELETE } = require("@/app/api/origenes/[id]/route");

        it("DELETE /api/origenes/[id] debe realizar borrado lógico", async () => {
            (prisma.origenDato.findFirst as jest.Mock).mockResolvedValue({ id: 1 });
            (prisma.medicion.count as jest.Mock).mockResolvedValue(0);
            (prisma.origenDato.update as jest.Mock).mockResolvedValue({ id: 1 });
            const req = new NextRequest("http://localhost/api/origenes/1", { method: "DELETE" });
            const res = await DELETE(req, { params: Promise.resolve({ id: "1" }) });
            expect(res.status).toBe(200);
        });
    });

    describe("API Tipos de Registro", () => {
        const { GET, POST } = require("@/app/api/tipos-registro/route");
        const { DELETE } = require("@/app/api/tipos-registro/[id]/route");

        it("DELETE /api/tipos-registro/[id] debe borrar físicamente si no hay mediciones", async () => {
            (prisma.tipoRegistro.findUnique as jest.Mock).mockResolvedValue({ id: 1, _count: { mediciones: 0 } });
            const req = new NextRequest("http://localhost/api/tipos-registro/1", { method: "DELETE" });
            const res = await DELETE(req, { params: Promise.resolve({ id: "1" }) });
            expect(res.status).toBe(200);
            expect(prisma.tipoRegistro.delete).toHaveBeenCalled();
        });
    });
});
