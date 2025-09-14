import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma";
import path from "path";

// Declarar tipo global para evitar múltiples instancias en desarrollo
declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

// Ruta a la base de datos SQLite
const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");

// Crear adapter con la nueva API de Prisma 6.6.0+
const adapter = new PrismaLibSql({
    url: `file:${dbPath}`,
});

// Crear instancia singleton de Prisma Client
const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
    global.prisma = prisma;
}

export default prisma;
