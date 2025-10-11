import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function seed() {
    console.log('🌱 Limpiando base de datos...');

    // Eliminar todos los datos existentes en orden para respetar FK
    await prisma.bitacoraCambio.deleteMany();
    await prisma.medicion.deleteMany();
    await prisma.lugar.deleteMany();
    await prisma.origenDato.deleteMany();
    await prisma.unidad.deleteMany();
    await prisma.tipoRegistro.deleteMany();
    await prisma.usuario.deleteMany();

    console.log('✅ Base de datos limpiada');
    console.log('🌱 Creando usuario administrador...');

    // Hash de la contraseña aveces123
    const passwordHash = await bcrypt.hash('aveces123', 10);

    // Crear único usuario admin
    const admin = await prisma.usuario.create({
        data: {
            nombre: 'Victor Vidal',
            email: 'victorvidalv@gmail.com',
            password_hash: passwordHash,
            activo: true,
            rol: 'ADMIN',
        },
    });

    console.log('👤 Admin creado: victorvidalv@gmail.com');

    // Crear tipos de registro
    const tipos = ['PRB', 'MST', 'REG'];
    const descripciones = ['Medición de prueba o calibración', 'Muestra oficial', 'Registro estándar'];

    for (let i = 0; i < tipos.length; i++) {
        await prisma.tipoRegistro.upsert({
            where: { codigo: tipos[i] },
            update: {},
            create: { codigo: tipos[i], descripcion: descripciones[i] },
        });
    }
    console.log('📋 Tipos de registro creados');

    // Crear unidades
    const unidadesData = [
        { nombre: 'Kilogramo', sigla: 'kg' },
        { nombre: 'Gramo', sigla: 'g' },
        { nombre: 'Litro', sigla: 'L' },
        { nombre: 'Mililitro', sigla: 'mL' },
        { nombre: 'Metro', sigla: 'm' },
        { nombre: 'Centímetro', sigla: 'cm' },
        { nombre: 'Celsius', sigla: '°C' },
        { nombre: 'Porcentaje', sigla: '%' },
    ];

    for (const u of unidadesData) {
        await prisma.unidad.create({
            data: { nombre: u.nombre, sigla: u.sigla, creado_por_id: admin.id },
        });
    }
    console.log('📏 Unidades creadas');

    // Crear orígenes de datos
    const origenesData = [
        { nombre: 'Laboratorio Central', descripcion: 'Datos provenientes del laboratorio principal' },
        { nombre: 'Estación de Campo', descripcion: 'Mediciones tomadas en terreno' },
        { nombre: 'Sensor Automático', descripcion: 'Datos capturados por sensores IoT' },
        { nombre: 'Base de Datos Externa', descripcion: 'Importación de fuentes externas' },
    ];

    for (const o of origenesData) {
        await prisma.origenDato.create({
            data: { nombre: o.nombre, descripcion: o.descripcion, creado_por_id: admin.id },
        });
    }
    console.log('🔗 Orígenes de datos creados');

    // Crear lugar de prueba
    const lugar = await prisma.lugar.create({
        data: { nombre: 'Centro de Pruebas', creado_por_id: admin.id },
    });
    console.log('📍 Lugar:', lugar.nombre);

    // Crear mediciones con curva sigmoide
    const tipo = await prisma.tipoRegistro.findFirst();
    const unidades = await prisma.unidad.findMany();
    const origenes = await prisma.origenDato.findMany();
    const fechaInicio = new Date('2025-01-01');

    console.log('📊 Creando mediciones con curva sigmoide...');

    for (const unidad of unidades) {
        const registros = [];
        const minVal = 5;
        const maxVal = 95;
        const amplitude = maxVal - minVal;
        const k = 0.28;
        const x0 = 25;

        for (let i = 0; i < 50; i++) {
            const valorPerfecto = minVal + amplitude / (1 + Math.exp(-k * (i - x0)));
            const ruido = (Math.random() - 0.5) * 0.8;
            const valor = Math.max(minVal, Math.min(maxVal, valorPerfecto + ruido));

            const fecha = new Date(fechaInicio);
            fecha.setDate(fechaInicio.getDate() + i);

            registros.push({
                valor: parseFloat(valor.toFixed(2)),
                fecha_medicion: fecha,
                lugar_id: lugar.id,
                unidad_id: unidad.id,
                tipo_id: tipo!.id,
                origen_id: origenes[i % origenes.length].id,
                registrado_por_id: admin.id,
                notas: `Prueba día ${i + 1}`,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await prisma.medicion.createMany({ data: registros });
        console.log(`  ${unidad.sigla}: 50 ✓`);
    }

    console.log('✅ Seed completado - Admin: victorvidalv@gmail.com / aveces123');
}

seed()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
