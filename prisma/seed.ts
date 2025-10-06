import prisma from '../lib/prisma';

async function seed() {
    console.log('🌱 Iniciando seed de base de datos...');

    // Crear usuarios de prueba por rol
    const admin = await prisma.usuario.upsert({
        where: { email: 'admin@test.com' },
        update: { rol: 'ADMIN' },
        create: {
            nombre: 'Administrador',
            email: 'admin@test.com',
            password_hash: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u', // password123
            activo: true,
            rol: 'ADMIN',
        },
    });

    const investigador = await prisma.usuario.upsert({
        where: { email: 'investigador@test.com' },
        update: { rol: 'INVESTIGADOR' },
        create: {
            nombre: 'Investigador de Planta',
            email: 'investigador@test.com',
            password_hash: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u', // password123
            activo: true,
            rol: 'INVESTIGADOR',
        },
    });

    const publico = await prisma.usuario.upsert({
        where: { email: 'publico@test.com' },
        update: { rol: 'PUBLICO' },
        create: {
            nombre: 'Usuario Público',
            email: 'publico@test.com',
            password_hash: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u', // password123
            activo: true,
            rol: 'PUBLICO',
        },
    });

    const victor = await prisma.usuario.upsert({
        where: { email: 'victorvidalv@gmail.com' },
        update: { rol: 'ADMIN' },
        create: {
            nombre: 'Victor Vidal',
            email: 'victorvidalv@gmail.com',
            password_hash: '$2b$10$b5rEEn5bA9Yh51S5zgL/ye8Zdm/XEa/qhiWsEoSCdW1bR64RyMWSK', // aveces123
            activo: true,
            rol: 'ADMIN',
        },
    });

    console.log('👤 Usuarios creados: victor, admin, investigador, publico');

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
        await prisma.unidad.upsert({
            where: { id: unidadesData.indexOf(u) + 1 },
            update: {},
            create: { nombre: u.nombre, sigla: u.sigla, creado_por_id: admin.id },
        });
    }
    console.log('📏 Unidades creadas');

    // Crear lugar de prueba
    const lugar = await prisma.lugar.upsert({
        where: { id: 1 },
        update: {},
        create: { nombre: 'Centro de Pruebas', creado_por_id: admin.id },
    });
    console.log('📍 Lugar:', lugar.nombre);

    // Crear mediciones con curva sigmoide
    const tipo = await prisma.tipoRegistro.findFirst();
    const unidades = await prisma.unidad.findMany();
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
                registrado_por_id: admin.id,
                notas: `Prueba día ${i + 1}`,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await prisma.medicion.createMany({ data: registros });
        console.log(`  ${unidad.sigla}: 50 ✓`);
    }

    console.log('✅ Seed completado');
}

seed()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
