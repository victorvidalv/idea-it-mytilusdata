import * as dotenv from 'dotenv';
dotenv.config();

import prisma from '../lib/prisma';
import { Rol } from '@prisma/client';
import bcrypt from 'bcryptjs';

async function main() {
    console.log('🧹 Iniciando limpieza de base de datos...');

    // 1. Eliminar datos dependientes primero (Respetando integridad referencial)
    await prisma.medicion.deleteMany();
    await prisma.ciclo.deleteMany();
    await prisma.lugar.deleteMany();
    await prisma.origenDato.deleteMany();
    await prisma.unidad.deleteMany();
    await prisma.apiKey.deleteMany();

    // 2. Mantener ÚNICAMENTE al admin principal, eliminar el resto
    await prisma.usuario.deleteMany({
        where: {
            email: { not: 'victorvidalv@gmail.com' }
        }
    });

    // Asegurar que el admin principal existe
    const passwordHash = await bcrypt.hash('aveces123', 10);
    const admin = await prisma.usuario.upsert({
        where: { email: 'victorvidalv@gmail.com' },
        update: { activo: true, rol: Rol.ADMIN },
        create: {
            nombre: 'Victor Vidal',
            email: 'victorvidalv@gmail.com',
            password_hash: passwordHash,
            activo: true,
            rol: Rol.ADMIN,
        },
    });

    console.log(`✅ Admin verificado: ${admin.email}`);

    // 3. Tipos de registro (Se mantienen o actualizan)
    const tiposData = [
        { codigo: 'PRB', descripcion: 'Medición de prueba o calibración' },
        { codigo: 'MST', descripcion: 'Muestra oficial' },
        { codigo: 'REG', descripcion: 'Registro estándar' },
    ];

    for (const t of tiposData) {
        await prisma.tipoRegistro.upsert({
            where: { codigo: t.codigo },
            update: { descripcion: t.descripcion },
            create: t,
        });
    }
    console.log('✅ Tipos de registro listos');

    // 4. Crear Unidades (Específicas de mitilicultura)
    const unidades = await Promise.all([
        prisma.unidad.create({ data: { nombre: 'Temperatura', sigla: '°C', creado_por_id: admin.id } }),
        prisma.unidad.create({ data: { nombre: 'Salinidad', sigla: 'psu', creado_por_id: admin.id } }),
        prisma.unidad.create({ data: { nombre: 'Oxígeno Disuelto', sigla: 'mg/L', creado_por_id: admin.id } }),
        prisma.unidad.create({ data: { nombre: 'Peso Promedio', sigla: 'g', creado_por_id: admin.id } }),
        prisma.unidad.create({ data: { nombre: 'Talla Promedio', sigla: 'mm', creado_por_id: admin.id } }),
        prisma.unidad.create({ data: { nombre: 'Transparencia (Secchi)', sigla: 'm', creado_por_id: admin.id } }),
    ]);
    console.log('✅ Unidades de mitilicultura creadas');

    // 5. Crear Orígenes de Datos
    const origenes = await Promise.all([
        prisma.origenDato.create({ data: { nombre: 'Sensores In-situ', descripcion: 'Datos capturados por boyas inteligentes', creado_por_id: admin.id } }),
        prisma.origenDato.create({ data: { nombre: 'Muestreo Manual', descripcion: 'Registros tomados por personal de terreno', creado_por_id: admin.id } }),
        prisma.origenDato.create({ data: { nombre: 'Laboratorio Externo', descripcion: 'Análisis de muestras enviadas a lab', creado_por_id: admin.id } }),
    ]);
    console.log('✅ Orígenes de datos creados');

    // 6. Crear Lugares (Centros de cultivo)
    const lugares = await Promise.all([
        prisma.lugar.create({ data: { nombre: 'Centro Castro - Estero', nota: 'Ubicado en la zona central del fiordo', latitud: -42.4772, longitud: -73.7661, creado_por_id: admin.id } }),
        prisma.lugar.create({ data: { nombre: 'Centro Quellón - Canal', nota: 'Zona de alta corriente', latitud: -43.1167, longitud: -73.6167, creado_por_id: admin.id } }),
        prisma.lugar.create({ data: { nombre: 'Centro Dalcahue', nota: 'Captación de semilla', latitud: -42.3667, longitud: -73.6500, creado_por_id: admin.id } }),
    ]);
    console.log('✅ Lugares (Centros) creados');

    // 7. Crear Ciclos
    const fechaActual = new Date();
    const ciclos = await Promise.all(lugares.map((l, index) => {
        const fechaSiembra = new Date(fechaActual);
        fechaSiembra.setMonth(fechaActual.getMonth() - (index + 2));

        return prisma.ciclo.create({
            data: {
                nombre: `Ciclo Productivo ${l.nombre.split(' ')[1]} 2024-2025`,
                fecha_siembra: fechaSiembra,
                lugar_id: l.id,
                activo: true,
                notas: 'Ciclo iniciado con semilla certificada',
                creado_por_id: admin.id
            }
        });
    }));
    console.log('✅ Ciclos de producción creados');

    // 8. Crear Mediciones (Datos de prueba para cada ciclo)
    const tipoReg = await prisma.tipoRegistro.findFirst({ where: { codigo: 'PRB' } });

    console.log('📊 Generando mediciones históricas...');

    for (const ciclo of ciclos) {
        const medicionesBuffer = [];
        const diasCiclo = 30; // 1 mes de datos diarios

        for (let i = 0; i < diasCiclo; i++) {
            const fechaMedicion = new Date(ciclo.fecha_siembra);
            fechaMedicion.setDate(fechaMedicion.getDate() + i);

            // Generar una medición para cada unidad en este día
            for (const unidad of unidades) {
                let valorBase = 0;
                switch (unidad.sigla) {
                    case '°C': valorBase = 12 + Math.sin(i / 5) * 2; break; // Temp 10-14
                    case 'psu': valorBase = 32 + (Math.random() * 2); break; // Salinidad estable
                    case 'mg/L': valorBase = 8 - (Math.random() * 1); break; // Oxígeno
                    case 'g': valorBase = 5 + (i * 0.5); break; // Crecimiento progresivo peso
                    case 'mm': valorBase = 15 + (i * 1.2); break; // Crecimiento progresivo talla
                    case 'm': valorBase = 4 + Math.cos(i / 10); break; // Visibilidad
                }

                medicionesBuffer.push({
                    valor: parseFloat(valorBase.toFixed(2)),
                    fecha_medicion: fechaMedicion,
                    lugar_id: ciclo.lugar_id,
                    unidad_id: unidad.id,
                    tipo_id: tipoReg!.id,
                    origen_id: origenes[i % origenes.length].id,
                    registrado_por_id: admin.id,
                    ciclo_id: ciclo.id,
                    notas: `Muestreo diario día ${i + 1}`,
                });
            }
        }

        await prisma.medicion.createMany({
            data: medicionesBuffer
        });
        console.log(`   - Mediciones para ${ciclo.nombre} completadas`);
    }

    console.log('✨ Seed finalizado con éxito');
}

main()
    .catch((e) => {
        console.error('❌ Error durante el seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
