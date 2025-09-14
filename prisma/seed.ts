import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../generated/prisma";
import path from "path";

// Ruta a la base de datos SQLite
const dbPath = path.resolve(__dirname, "dev.db");

// Crear adapter con la nueva API de Prisma 6.6.0+
const adapter = new PrismaLibSql({
    url: `file:${dbPath}`,
});

// Crear cliente Prisma
const prisma = new PrismaClient({ adapter });

/**
 * Script de seed para poblar datos iniciales
 * Ejecutar con: npx prisma db seed
 */
async function main() {
    console.log("🌱 Iniciando seed de la base de datos...");

    // Crear tipos de registro predeterminados
    const tiposRegistro = [
        { codigo: "PRUEBA", descripcion: "Medición de prueba o calibración" },
        { codigo: "MUESTRA", descripcion: "Medición de muestra oficial" },
        { codigo: "DATO_PREVIO", descripcion: "Dato histórico o preexistente" },
    ];

    for (const tipo of tiposRegistro) {
        await prisma.tipoRegistro.upsert({
            where: { codigo: tipo.codigo },
            update: {},
            create: tipo,
        });
        console.log(`✅ Tipo de registro creado: ${tipo.codigo}`);
    }

    // Crear unidades de medida básicas
    const unidades = [
        { nombre: "Kilogramo", sigla: "kg" },
        { nombre: "Gramo", sigla: "g" },
        { nombre: "Litro", sigla: "L" },
        { nombre: "Mililitro", sigla: "mL" },
        { nombre: "Metro", sigla: "m" },
        { nombre: "Centímetro", sigla: "cm" },
        { nombre: "Celsius", sigla: "°C" },
        { nombre: "Porcentaje", sigla: "%" },
    ];

    for (const unidad of unidades) {
        const existente = await prisma.unidad.findFirst({
            where: { sigla: unidad.sigla, deleted_at: null },
        });

        if (!existente) {
            await prisma.unidad.create({ data: unidad });
            console.log(`✅ Unidad creada: ${unidad.nombre} (${unidad.sigla})`);
        }
    }

    console.log("🌱 Seed completado exitosamente");
}

main()
    .catch((e) => {
        console.error("❌ Error en seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
