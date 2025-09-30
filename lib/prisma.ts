import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";

// Declarar tipo global para evitar múltiples instancias en desarrollo
declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

// Configuración para Neon (PostgreSQL) usando Driver Adapter
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    if (process.env.NODE_ENV === "production" || process.env.DATABASE_URL !== undefined) {
        console.warn("DATABASE_URL no está definido");
    }
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Crear instancia singleton de Prisma Client con el adaptador
const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
    global.prisma = prisma;
}

export default prisma;
