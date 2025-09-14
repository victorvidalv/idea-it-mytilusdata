// Configuración de Prisma para SQLite
import path from "path";
import { defineConfig } from "prisma/config";

// Ruta absoluta a la base de datos SQLite
const dbPath = path.resolve(__dirname, "prisma", "dev.db");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: `file:${dbPath}`,
  },
});

