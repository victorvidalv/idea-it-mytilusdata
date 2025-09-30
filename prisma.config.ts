// Configuración de Prisma para PostgreSQL (Neon)
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // URL de conexión (Neon)
    url: process.env.DATABASE_URL,
  },
});
