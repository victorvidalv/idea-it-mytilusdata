/** @jest-environment node */
import { NextRequest } from "next/server";

import { POST as loginPost } from "@/app/api/auth/login/route";
import { POST as registroPost } from "@/app/api/auth/registro/route";
import { GET as csrfGet } from "@/app/api/auth/csrf-token/route";
import prisma from "@/lib/prisma";
import * as auth from "@/lib/auth";

// Mock de Prisma
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    usuario: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock de las funciones de autenticación
jest.mock("@/lib/auth", () => ({
  verifyPassword: jest.fn(),
  hashPassword: jest.fn(),
  generateToken: jest.fn(),
}));

// Mock de los middlewares para saltar protecciones en tests de lógica
jest.mock("@/lib/middleware", () => ({
  withRateLimit: (handler: any) => handler,
  withCSRFProtection: (handler: any) => handler,
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


describe("Auth API Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/auth/csrf-token", () => {
    it("debe retornar éxito al generar token", async () => {
      const req = new NextRequest("http://localhost/api/auth/csrf-token");
      const response = await csrfGet(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.generated).toBe(true);
    });
  });

  describe("POST /api/auth/login", () => {
    it("debe autenticar exitosamente con credenciales válidas", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        nombre: "Test User",
        password_hash: "hashed_pwd",
        activo: true,
        rol: "ADMIN",
      };

      (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (auth.verifyPassword as jest.Mock).mockResolvedValue(true);
      (auth.generateToken as jest.Mock).mockReturnValue("mock_token");

      const req = new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });

      const response = await loginPost(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.token).toBe("mock_token");
      expect(data.user.email).toBe(mockUser.email);
    });

    it("debe fallar si el usuario no existe", async () => {
      (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "nonexistent@example.com",
          password: "password123",
        }),
      });

      const response = await loginPost(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain("Credenciales inválidas");
    });
  });

  describe("POST /api/auth/registro", () => {
    it("debe registrar un nuevo usuario exitosamente", async () => {
      (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.usuario.create as jest.Mock).mockResolvedValue({
        id: 2,
        email: "new@example.com",
        nombre: "New User",
        rol: "INVITADO",
      });
      (auth.hashPassword as jest.Mock).mockResolvedValue("new_hashed_pwd");
      (auth.generateToken as jest.Mock).mockReturnValue("new_mock_token");

      const req = new NextRequest("http://localhost/api/auth/registro", {
        method: "POST",
        body: JSON.stringify({
          nombre: "New User",
          email: "new@example.com",
          password: "Password123!",
        }),
      });

      const response = await registroPost(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.message).toContain("registrado exitosamente");
      expect(data.user.email).toBe("new@example.com");
    });

    it("debe fallar si el email ya existe", async () => {
      (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({ id: 1 });

      const req = new NextRequest("http://localhost/api/auth/registro", {
        method: "POST",
        body: JSON.stringify({
          nombre: "Existing User",
          email: "existing@example.com",
          password: "Password123!",
        }),
      });

      const response = await registroPost(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain("ya está registrado");
    });
  });
});
