/**
 * Script para poblar/limpiar datos de prueba en la base de datos.
 *
 * Uso:
 *   npm run poblar <email>     → Crear datos de prueba para el usuario
 *   npm run limpiar <email>    → Eliminar todos los datos del usuario (sin borrar la cuenta)
 *
 * Ejemplo:
 *   npm run poblar v@vvidal.cl
 *   npm run limpiar v@vvidal.cl
 */

import Database from 'better-sqlite3';
import { resolve } from 'path';

// Conectar a la DB
const dbPath = resolve(process.cwd(), 'local.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Obtener acción y email de los argumentos
const action = process.argv[2]; // 'poblar' o 'limpiar'
const email = process.argv[3];

if (!email) {
	console.error('❌ Debes proporcionar un email.');
	console.error('   Uso: node scripts/seed.js <poblar|limpiar> <email>');
	process.exit(1);
}

// Buscar usuario por email
const user = db.prepare('SELECT id, nombre, email FROM usuarios WHERE email = ?').get(email);

if (!user) {
	console.error(`❌ No se encontró el usuario con email: ${email}`);
	process.exit(1);
}

console.log(`👤 Usuario encontrado: ${user.nombre} (ID: ${user.id})`);

// ──────────────────────────── LIMPIAR ────────────────────────────

function limpiar(userId) {
	console.log('\n🧹 Limpiando datos del usuario...');

	const delMediciones = db.prepare('DELETE FROM mediciones WHERE user_id = ?');
	const delCiclos = db.prepare('DELETE FROM ciclos WHERE user_id = ?');
	const delLugares = db.prepare('DELETE FROM lugares WHERE user_id = ?');
	const delApiKeys = db.prepare('DELETE FROM api_keys WHERE user_id = ?');

	const r1 = delMediciones.run(userId);
	console.log(`   ✓ Mediciones eliminadas: ${r1.changes}`);

	const r2 = delCiclos.run(userId);
	console.log(`   ✓ Ciclos eliminados: ${r2.changes}`);

	const r3 = delLugares.run(userId);
	console.log(`   ✓ Centros eliminados: ${r3.changes}`);

	const r4 = delApiKeys.run(userId);
	console.log(`   ✓ API Keys eliminadas: ${r4.changes}`);

	console.log('✅ Datos del usuario limpiados correctamente.\n');
}

// ──────────────────────────── POBLAR ─────────────────────────────

function poblar(userId) {
	// Primero limpiar datos anteriores
	limpiar(userId);

	console.log('🌱 Poblando datos de prueba...\n');

	// Obtener tipos de registro y orígenes disponibles
	const tipos = db.prepare('SELECT id, codigo, unidad_base FROM tipos_registro').all();
	const origenes = db.prepare('SELECT id, nombre FROM origen_datos').all();

	if (tipos.length === 0 || origenes.length === 0) {
		console.error(
			'❌ No hay tipos de registro u orígenes de datos en la DB. Crea algunos primero.'
		);
		process.exit(1);
	}

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
	const insertLugar = db.prepare(
		'INSERT INTO lugares (nombre, latitud, longitud, user_id) VALUES (?, ?, ?, ?)'
	);

	const centro1 = insertLugar.run('Bahía Quellón - Línea Norte', -43.116, -73.615, userId);
	const centro2 = insertLugar.run('Estero Castro - Línea Sur', -42.48, -73.765, userId);

	const centroId1 = centro1.lastInsertRowid;
	const centroId2 = centro2.lastInsertRowid;

	console.log(`   📍 Centro 1: "Bahía Quellón - Línea Norte" (ID: ${centroId1})`);
	console.log(`   📍 Centro 2: "Estero Castro - Línea Sur" (ID: ${centroId2})`);

	// ─── Crear 3 ciclos por centro (6 ciclos total) ───
	const insertCiclo = db.prepare(
		'INSERT INTO ciclos (nombre, fecha_siembra, fecha_finalizacion, lugar_id, user_id, activo) VALUES (?, ?, ?, ?, ?, ?)'
	);

	// Fechas realistas de mitilicultura en Chile
	const ciclosData = [
		// Centro 1 - Quellón
		{
			nombre: 'Siembra Otoño 2024',
			siembra: new Date('2024-04-15'),
			fin: new Date('2025-01-20'),
			centroId: centroId1,
			activo: 0
		},
		{
			nombre: 'Siembra Primavera 2024',
			siembra: new Date('2024-10-01'),
			fin: new Date('2025-06-15'),
			centroId: centroId1,
			activo: 0
		},
		{
			nombre: 'Siembra Otoño 2025',
			siembra: new Date('2025-03-20'),
			fin: null,
			centroId: centroId1,
			activo: 1
		},
		// Centro 2 - Castro
		{
			nombre: 'Siembra Verano 2024',
			siembra: new Date('2024-01-10'),
			fin: new Date('2024-09-30'),
			centroId: centroId2,
			activo: 0
		},
		{
			nombre: 'Siembra Invierno 2024',
			siembra: new Date('2024-07-15'),
			fin: new Date('2025-04-10'),
			centroId: centroId2,
			activo: 0
		},
		{
			nombre: 'Siembra Primavera 2025',
			siembra: new Date('2025-09-01'),
			fin: null,
			centroId: centroId2,
			activo: 1
		}
	];

	const cicloIds = [];
	for (const c of ciclosData) {
		const ts = Math.floor(c.siembra.getTime() / 1000);
		const tsFin = c.fin ? Math.floor(c.fin.getTime() / 1000) : null;
		const result = insertCiclo.run(c.nombre, ts, tsFin, c.centroId, userId, c.activo);
		cicloIds.push({ id: result.lastInsertRowid, ...c });
		console.log(
			`   🔄 Ciclo: "${c.nombre}" (ID: ${result.lastInsertRowid}) → Centro ${c.centroId}`
		);
	}

	// ─── Generar mediciones realistas ───
	const insertMedicion = db.prepare(
		'INSERT INTO mediciones (valor, fecha_medicion, ciclo_id, lugar_id, user_id, tipo_id, origen_id, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
	);

	let totalMediciones = 0;

	for (const ciclo of cicloIds) {
		const inicio = ciclo.siembra;
		const fin = ciclo.fin || new Date('2026-02-15');
		const duracionDias = Math.floor((fin - inicio) / (1000 * 60 * 60 * 24));
		const numMuestreos = Math.min(Math.floor(duracionDias / 15), 20); // Cada ~15 días, máx 20

		for (let i = 0; i <= numMuestreos; i++) {
			const fechaMuestreo = new Date(inicio.getTime() + i * 15 * 24 * 60 * 60 * 1000);
			const ts = Math.floor(fechaMuestreo.getTime() / 1000);
			const progreso = i / Math.max(numMuestreos, 1); // 0→1

			// Talla: crece de ~5mm a ~65mm (curva sigmoidal aproximada)
			if (tipoMap['TALLA_LONGITUD']) {
				const talla =
					5 + 60 * (1 / (1 + Math.exp(-8 * (progreso - 0.4)))) + (Math.random() * 3 - 1.5);
				insertMedicion.run(
					Math.round(talla * 100) / 100,
					ts,
					ciclo.id,
					ciclo.centroId,
					userId,
					tipoMap['TALLA_LONGITUD'].id,
					defaultOrigen.id,
					i === 0 ? 'Medición inicial de siembra' : null
				);
				totalMediciones++;
			}

			// Peso vivo: correlacionado con talla (~0.01 * talla^2.8)
			if (tipoMap['PESO_VIVO']) {
				const talla = 5 + 60 * (1 / (1 + Math.exp(-8 * (progreso - 0.4))));
				const peso = 0.01 * Math.pow(talla, 2.8) + (Math.random() * 2 - 1);
				insertMedicion.run(
					Math.round(Math.max(peso, 0.5) * 100) / 100,
					ts,
					ciclo.id,
					ciclo.centroId,
					userId,
					tipoMap['PESO_VIVO'].id,
					labOrigen.id,
					null
				);
				totalMediciones++;
			}

			// Temperatura del agua: varía con la estación (8-18°C en sur de Chile)
			if (tipoMap['TEMPERATURA_AGUA']) {
				const mes = fechaMuestreo.getMonth(); // 0-11
				// Estacionalidad: máx en enero-febrero, mín en julio
				const tempBase = 13 + 5 * Math.cos(((mes - 1) * Math.PI) / 6);
				const temp = tempBase + (Math.random() * 2 - 1);
				insertMedicion.run(
					Math.round(temp * 10) / 10,
					ts,
					null,
					ciclo.centroId,
					userId,
					tipoMap['TEMPERATURA_AGUA'].id,
					sensorOrigen.id,
					null
				);
				totalMediciones++;
			}

			// Salinidad: relativamente estable (~28-33 psu)
			if (tipoMap['SALINIDAD'] && i % 2 === 0) {
				const salinidad = 30 + (Math.random() * 4 - 2);
				insertMedicion.run(
					Math.round(salinidad * 10) / 10,
					ts,
					null,
					ciclo.centroId,
					userId,
					tipoMap['SALINIDAD'].id,
					sensorOrigen.id,
					null
				);
				totalMediciones++;
			}

			// Oxígeno disuelto: 6-10 mg/L
			if (tipoMap['OXIGENO_DISUELTO'] && i % 3 === 0) {
				const od = 8 + (Math.random() * 3 - 1.5);
				insertMedicion.run(
					Math.round(od * 100) / 100,
					ts,
					null,
					ciclo.centroId,
					userId,
					tipoMap['OXIGENO_DISUELTO'].id,
					sensorOrigen.id,
					od < 6.5 ? '⚠️ Nivel bajo de oxígeno' : null
				);
				totalMediciones++;
			}

			// Clorofila-a: 1-15 ug/L, más alta en primavera/verano
			if (tipoMap['CLOROFILA_A'] && i % 4 === 0) {
				const mes = fechaMuestreo.getMonth();
				const clorBase = 5 + 7 * Math.cos(((mes - 0) * Math.PI) / 6);
				const clor = Math.max(clorBase + (Math.random() * 3 - 1.5), 0.5);
				insertMedicion.run(
					Math.round(clor * 100) / 100,
					ts,
					null,
					ciclo.centroId,
					userId,
					tipoMap['CLOROFILA_A'].id,
					labOrigen.id,
					clor > 12 ? 'Bloom de fitoplancton detectado' : null
				);
				totalMediciones++;
			}
		}
	}

	console.log(`\n   📊 Total mediciones creadas: ${totalMediciones}`);
	console.log('\n✅ Base de datos poblada exitosamente.\n');
}

// ─── Ejecutar la acción ───

if (action === 'poblar') {
	poblar(user.id);
} else if (action === 'limpiar') {
	limpiar(user.id);
} else {
	console.error(`❌ Acción desconocida: "${action}"`);
	console.error('   Acciones válidas: poblar, limpiar');
	process.exit(1);
}

db.close();
