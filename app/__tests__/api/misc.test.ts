/** @jest-environment node */
import { GET as healthGet } from "@/app/api/health/route";
import prisma from "@/lib/prisma";

// Mock de Prisma
jest.mock("@/lib/prisma", () => ({
    __esModule: true,
    default: {
        $queryRaw: jest.fn(),
    },
}));

describe("Misc API Endpoints", () => {
    describe("GET /api/health", () => {
        it("debe retornar healthy si la base de datos responde", async () => {
            (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ 1: 1 }]);

            const response = await healthGet();
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.status).toBe("healthy");
            expect(data.database).toBe("connected");
        });

        it("debe retornar unhealthy si la base de datos falla", async () => {
            (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error("DB Connection Error"));

            const response = await healthGet();
            const data = await response.json();

            expect(response.status).toBe(503);
            expect(data.status).toBe("unhealthy");
            expect(data.database).toBe("disconnected");
        });
    });
});
