/**
 * Script para poblar/limpiar datos de prueba en la base de datos PostgreSQL en Neon.
 *
 * Uso:
 *   node --env-file=.env scripts/seed.js poblar <email>     → Crear datos de prueba para el usuario
 *   node --env-file=.env scripts/seed.js limpiar <email>    → Eliminar todos los datos del usuario (sin borrar la cuenta)
 *   node --env-file=.env scripts/seed.js create-admin       → Crear admin inicial desde INITIAL_ADMIN_EMAIL
 */

import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
	console.error('❌ DATABASE_URL no está definido en .env');
	process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

// Obtener acción y email de los argumentos
const action = process.argv[2]; // 'poblar', 'limpiar' o 'create-admin'
const email = process.argv[3];

// ──────────────────────────── CREATE ADMIN ────────────────────────────

/**
 * Crea el usuario administrador inicial si no existe.
 * Usa la variable de entorno INITIAL_ADMIN_EMAIL.
 * Este es el único mecanismo para crear el primer ADMIN en el sistema.
 */
async function createInitialAdmin() {
	const adminEmail = process.env.INITIAL_ADMIN_EMAIL;

	if (!adminEmail) {
		console.error('❌ INITIAL_ADMIN_EMAIL no está definido en .env');
		console.error('   Agrega INITIAL_ADMIN_EMAIL=tu-email@dominio.com a tu archivo .env');
		process.exit(1);
	}

	console.log(`🔍 Buscando usuario admin con email: ${adminEmail}`);

	const [existing] =
		await sql`SELECT id, email, rol FROM usuarios WHERE email = ${adminEmail}`;

	if (existing) {
		if (existing.rol === 'ADMIN') {
			console.log(`✅ El usuario admin ya existe: ${existing.email} (ID: ${existing.id})`);
		} else {
			// Promover a ADMIN si existe pero no es admin
			await sql`UPDATE usuarios SET rol = 'ADMIN' WHERE id = ${existing.id}`;
			console.log(`⬆️ Usuario promovido a ADMIN: ${existing.email} (ID: ${existing.id})`);
		}
		return existing;
	}

	// Crear nuevo usuario admin
	const [newAdmin] =
		await sql`INSERT INTO usuarios (nombre, email, rol, activo) VALUES ('Administrador', ${adminEmail}, 'ADMIN', true) RETURNING id, email, rol`;

	console.log(`✅ Usuario admin creado exitosamente:`);
	console.log(`   📧 Email: ${newAdmin.email}`);
	console.log(`   🆔 ID: ${newAdmin.id}`);
	console.log(`   🔑 Rol: ${newAdmin.rol}`);

	return newAdmin;
}

// ──────────────────────────── CREATE ADMIN (sin requerir email en args) ────────────────────────────

if (action === 'create-admin') {
	createInitialAdmin()
		.then(() => {
			console.log('\n🎉 Proceso completado.\n');
		})
		.catch((e) => {
			console.error('Error creando admin:', e);
			process.exit(1);
		});
} else {
	// Para poblar/limpiar se requiere email
	if (!email) {
		console.error('❌ Debes proporcionar un email.');
		console.error('   Uso: npm run poblar <email>');
		console.error('   Uso: npm run limpiar <email>');
		console.error('   Uso: npm run create-admin');
		process.exit(1);
	}
}

async function initMaestros() {
	// 1. Tipos de registros
	const tipos = [
		['TALLA_LONGITUD', 'mm'],
		['PESO_VIVO', 'g'],
		['TEMPERATURA_AGUA', 'C'],
		['SALINIDAD', 'psu'],
		['OXIGENO_DISUELTO', 'mg_l'],
		['CLOROFILA_A', 'ug_l']
	];

	for (const [codigo, unidad_base] of tipos) {
		await sql`INSERT INTO tipos_registro (codigo, unidad_base) VALUES (${codigo}, ${unidad_base}) ON CONFLICT (codigo) DO NOTHING`;
	}

	// 2. Origenes de datos
	const origenes = ['Manual', 'Laboratorio', 'Sensor'];
	for (const nombre of origenes) {
		await sql`INSERT INTO origen_datos (nombre)
				  SELECT ${nombre} WHERE NOT EXISTS (SELECT 1 FROM origen_datos WHERE nombre = ${nombre})`;
	}
}

async function getUser() {
	let [user] = await sql`SELECT id, nombre, email FROM usuarios WHERE email = ${email}`;

	if (!user) {
		console.log(`⚠️ Usuario con email ${email} no existe. Creando usuario por defecto...`);
		[user] =
			await sql`INSERT INTO usuarios (nombre, email, rol) VALUES ('Victor Vidal', ${email}, 'ADMIN') RETURNING id, nombre, email`;
	}
	return user;
}

// ──────────────────────────── LIMPIAR ────────────────────────────

async function limpiar(userId) {
	console.log('\n🧹 Limpiando datos del usuario...');

	const r1 = await sql`DELETE FROM mediciones WHERE user_id = ${userId}`;
	console.log(`   ✓ Mediciones eliminadas: ${r1.length}`);

	const r2 = await sql`DELETE FROM ciclos WHERE user_id = ${userId}`;
	console.log(`   ✓ Ciclos eliminados: ${r2.length}`);

	const r3 = await sql`DELETE FROM lugares WHERE user_id = ${userId}`;
	console.log(`   ✓ Centros eliminados: ${r3.length}`);

	const r4 = await sql`DELETE FROM api_keys WHERE user_id = ${userId}`;
	console.log(`   ✓ API Keys eliminadas: ${r4.length}`);

	console.log('✅ Datos del usuario limpiados correctamente.\n');
}

// ──────────────────────────── POBLAR ─────────────────────────────

async function poblar(userId) {
	// Primero limpiar datos anteriores
	await limpiar(userId);

	console.log('🌱 Poblando datos de prueba...\n');

	// Asegurarse que haya tipos de registro y orígenes
	await initMaestros();

	const tipos = await sql`SELECT id, codigo, unidad_base FROM tipos_registro`;
	const origenes = await sql`SELECT id, nombre FROM origen_datos`;

	// Mapear tipos por código para acceso rápido
	const tipoMap = {};
	for (const t of tipos) {
		tipoMap[t.codigo] = t;
	}

	// Buscar orígenes por nombre
	const origenManual = origenes.find((o) => o.nombre.includes('Manual'));
	const origenLab = origenes.find((o) => o.nombre.includes('Laboratorio'));
	const origenSensor = origenes.find((o) => o.nombre.includes('Sensor'));
	const defaultOrigen = origenManual || origenes[0];
	const labOrigen = origenLab || defaultOrigen;
	const sensorOrigen = origenSensor || defaultOrigen;

	// ─── Crear 2 centros de cultivo ───
	const [centro1] =
		await sql`INSERT INTO lugares (nombre, latitud, longitud, user_id) VALUES ('Bahía Quellón - Línea Norte', -43.116, -73.615, ${userId}) RETURNING id`;
	const [centro2] =
		await sql`INSERT INTO lugares (nombre, latitud, longitud, user_id) VALUES ('Estero Castro - Línea Sur', -42.48, -73.765, ${userId}) RETURNING id`;

	const centroId1 = centro1.id;
	const centroId2 = centro2.id;

	console.log(`   📍 Centro 1: "Bahía Quellón - Línea Norte" (ID: ${centroId1})`);
	console.log(`   📍 Centro 2: "Estero Castro - Línea Sur" (ID: ${centroId2})`);

	// ─── Crear 3 ciclos por centro (6 ciclos total) ───
	// Fechas realistas de mitilicultura en Chile
	const ciclosData = [
		// Centro 1 - Quellón
		{
			nombre: 'Siembra Otoño 2024',
			siembra: new Date('2024-04-15'),
			fin: new Date('2025-01-20'),
			centroId: centroId1,
			activo: false
		},
		{
			nombre: 'Siembra Primavera 2024',
			siembra: new Date('2024-10-01'),
			fin: new Date('2025-06-15'),
			centroId: centroId1,
			activo: false
		},
		{
			nombre: 'Siembra Otoño 2025',
			siembra: new Date('2025-03-20'),
			fin: null,
			centroId: centroId1,
			activo: true
		},
		// Centro 2 - Castro
		{
			nombre: 'Siembra Verano 2024',
			siembra: new Date('2024-01-10'),
			fin: new Date('2024-09-30'),
			centroId: centroId2,
			activo: false
		},
		{
			nombre: 'Siembra Invierno 2024',
			siembra: new Date('2024-07-15'),
			fin: new Date('2025-04-10'),
			centroId: centroId2,
			activo: false
		},
		{
			nombre: 'Siembra Primavera 2025',
			siembra: new Date('2025-09-01'),
			fin: null,
			centroId: centroId2,
			activo: true
		}
	];

	const cicloIds = [];
	for (const c of ciclosData) {
		// Neon handles JS Dates correctly for PostgreSQL timestamps
		const [result] =
			await sql`INSERT INTO ciclos (nombre, fecha_siembra, fecha_finalizacion, lugar_id, user_id, activo) VALUES (${c.nombre}, ${c.siembra}, ${c.fin}, ${c.centroId}, ${userId}, ${c.activo}) RETURNING id`;
		cicloIds.push({ id: result.id, ...c });
		console.log(`   🔄 Ciclo: "${c.nombre}" (ID: ${result.id}) → Centro ${c.centroId}`);
	}

	// ─── Generar mediciones realistas ───
	let totalMediciones = 0;

	for (const ciclo of cicloIds) {
		const inicio = ciclo.siembra;
		const fin = ciclo.fin || new Date('2026-02-15');
		const duracionDias = Math.floor((fin - inicio) / (1000 * 60 * 60 * 24));
		const numMuestreos = Math.min(Math.floor(duracionDias / 15), 20); // Cada ~15 días, máx 20

		for (let i = 0; i <= numMuestreos; i++) {
			const fechaMuestreo = new Date(inicio.getTime() + i * 15 * 24 * 60 * 60 * 1000);
			const progreso = i / Math.max(numMuestreos, 1); // 0→1

			// Talla: crece de ~5mm a ~65mm (curva sigmoidal aproximada)
			if (tipoMap['TALLA_LONGITUD']) {
				const talla =
					5 + 60 * (1 / (1 + Math.exp(-8 * (progreso - 0.4)))) + (Math.random() * 3 - 1.5);
				await sql`INSERT INTO mediciones (valor, fecha_medicion, ciclo_id, lugar_id, user_id, tipo_id, origen_id, notas) VALUES (${Math.round(talla * 100) / 100}, ${fechaMuestreo}, ${ciclo.id}, ${ciclo.centroId}, ${userId}, ${tipoMap['TALLA_LONGITUD'].id}, ${defaultOrigen.id}, ${i === 0 ? 'Medición inicial de siembra' : null})`;
				totalMediciones++;
			}

			// Peso vivo: correlacionado con talla (~0.01 * talla^2.8)
			if (tipoMap['PESO_VIVO']) {
				const talla = 5 + 60 * (1 / (1 + Math.exp(-8 * (progreso - 0.4))));
				const peso = 0.01 * Math.pow(talla, 2.8) + (Math.random() * 2 - 1);
				await sql`INSERT INTO mediciones (valor, fecha_medicion, ciclo_id, lugar_id, user_id, tipo_id, origen_id, notas) VALUES (${Math.round(Math.max(peso, 0.5) * 100) / 100}, ${fechaMuestreo}, ${ciclo.id}, ${ciclo.centroId}, ${userId}, ${tipoMap['PESO_VIVO'].id}, ${labOrigen.id}, null)`;
				totalMediciones++;
			}

			// Temperatura del agua: varía con la estación (8-18°C en sur de Chile)
			if (tipoMap['TEMPERATURA_AGUA']) {
				const mes = fechaMuestreo.getMonth(); // 0-11
				const tempBase = 13 + 5 * Math.cos(((mes - 1) * Math.PI) / 6);
				const temp = tempBase + (Math.random() * 2 - 1);
				await sql`INSERT INTO mediciones (valor, fecha_medicion, lugar_id, user_id, tipo_id, origen_id, notas) VALUES (${Math.round(temp * 10) / 10}, ${fechaMuestreo}, ${ciclo.centroId}, ${userId}, ${tipoMap['TEMPERATURA_AGUA'].id}, ${sensorOrigen.id}, null)`;
				totalMediciones++;
			}

			// Salinidad: relativamente estable (~28-33 psu)
			if (tipoMap['SALINIDAD'] && i % 2 === 0) {
				const salinidad = 30 + (Math.random() * 4 - 2);
				await sql`INSERT INTO mediciones (valor, fecha_medicion, lugar_id, user_id, tipo_id, origen_id, notas) VALUES (${Math.round(salinidad * 10) / 10}, ${fechaMuestreo}, ${ciclo.centroId}, ${userId}, ${tipoMap['SALINIDAD'].id}, ${sensorOrigen.id}, null)`;
				totalMediciones++;
			}

			// Oxígeno disuelto: 6-10 mg/L
			if (tipoMap['OXIGENO_DISUELTO'] && i % 3 === 0) {
				const od = 8 + (Math.random() * 3 - 1.5);
				await sql`INSERT INTO mediciones (valor, fecha_medicion, lugar_id, user_id, tipo_id, origen_id, notas) VALUES (${Math.round(od * 100) / 100}, ${fechaMuestreo}, ${ciclo.centroId}, ${userId}, ${tipoMap['OXIGENO_DISUELTO'].id}, ${sensorOrigen.id}, ${od < 6.5 ? '⚠️ Nivel bajo de oxígeno' : null})`;
				totalMediciones++;
			}

			// Clorofila-a: 1-15 ug/L, más alta en primavera/verano
			if (tipoMap['CLOROFILA_A'] && i % 4 === 0) {
				const mes = fechaMuestreo.getMonth();
				const clorBase = 5 + 7 * Math.cos(((mes - 0) * Math.PI) / 6);
				const clor = Math.max(clorBase + (Math.random() * 3 - 1.5), 0.5);
				await sql`INSERT INTO mediciones (valor, fecha_medicion, lugar_id, user_id, tipo_id, origen_id, notas) VALUES (${Math.round(clor * 100) / 100}, ${fechaMuestreo}, ${ciclo.centroId}, ${userId}, ${tipoMap['CLOROFILA_A'].id}, ${labOrigen.id}, ${clor > 12 ? 'Bloom de fitoplancton detectado' : null})`;
				totalMediciones++;
			}
		}
	}

	console.log(`\n   📊 Total mediciones creadas: ${totalMediciones}`);
	console.log('\n✅ Base de datos poblada exitosamente.\n');
}

// ─── Ejecutar la acción ───

async function main() {
	const user = await getUser();
	console.log(`👤 Usuario encontrado: ${user.nombre} (ID: ${user.id})`);

	if (action === 'poblar') {
		await poblar(user.id);
	} else if (action === 'limpiar') {
		await limpiar(user.id);
	} else {
		console.error(`❌ Acción desconocida: "${action}"`);
		console.error('   Acciones válidas: poblar, limpiar');
		process.exit(1);
	}
}

main().catch((e) => {
	console.error('Error in script', e);
	process.exit(1);
});
