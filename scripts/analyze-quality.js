/**
 * Analizador de calidad de código - MytilusData
 *
 * Analiza archivos TypeScript y Svelte para determinar el nivel
 * de calidad del código de la aplicación.
 *
 * Uso: node scripts/analyze-quality.js [--output <archivo>]
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, relative, extname, basename } from 'path';

// ──────────────────────────────────────────────────────────────────
// CONFIGURACIÓN
// ──────────────────────────────────────────────────────────────────
const CONFIG = {
	maxComplexity: 10,
	maxLines: 200,
	extensions: ['ts', 'svelte'],
	excludeDirs: [
		'node_modules',
		'dist',
		'build',
		'.git',
		'coverage',
		'.svelte-kit',
		'drizzle',
		'static'
	],
	excludeFiles: ['*.min.js', '*.bundle.js', 'package-lock.json', 'seed.js', 'analyze-quality.js'],
	excludeDirs_extra: ['__tests__'],
	testExtensions: ['.test.ts', '.spec.ts', '.test.svelte.ts'],
	minDuplicateLines: 5,
	showTopDuplicates: 5,
	// Umbrales para nivel de calidad
	nivel: {
		profesional: { maxAvgComplexity: 4, maxDuplication: 8, minTestRatio: 0.15, maxWarnPct: 0 },
		avanzado:    { maxAvgComplexity: 6, maxDuplication: 15, minTestRatio: 0.08, maxWarnPct: 3 },
		intermedio:  { maxAvgComplexity: 8, maxDuplication: 25, minTestRatio: 0.03, maxWarnPct: 10 }
		// por debajo → Básico
	}
};

// ──────────────────────────────────────────────────────────────────
// UTILIDADES
// ──────────────────────────────────────────────────────────────────
function matchesPattern(filename, patterns) {
	return patterns.some((pattern) => {
		if (pattern.includes('*')) {
			// Escape all special regex chars except '*', then replace '*' with '.*'
			const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
			const regex = new RegExp('^' + escaped + '$');
			return regex.test(filename);
		}
		return filename === pattern;
	});
}

function collectFiles(dir, rootDir) {
	const results = { source: [], tests: [] };

	function walk(currentDir) {
		let entries;
		try {
			entries = readdirSync(currentDir);
		} catch {
			return;
		}

		for (const entry of entries) {
			const fullPath = join(currentDir, entry);
			let stat;
			try {
				stat = statSync(fullPath);
			} catch {
				continue;
			}

			if (stat.isDirectory()) {
				if (!CONFIG.excludeDirs.includes(entry) && !CONFIG.excludeDirs_extra.includes(entry))
					walk(fullPath);
				continue;
			}

			const ext = extname(entry).slice(1);
			const base = basename(entry);

			if (matchesPattern(base, CONFIG.excludeFiles)) continue;

			const isTest = CONFIG.testExtensions.some((te) => entry.endsWith(te));
			if (isTest) {
				results.tests.push(fullPath);
				continue;
			}

			if (CONFIG.extensions.includes(ext)) {
				results.source.push(fullPath);
			}
		}
	}

	walk(dir);
	return results;
}

// ──────────────────────────────────────────────────────────────────
// ANÁLISIS DE COMPLEJIDAD
// ──────────────────────────────────────────────────────────────────

/** Complejidad ciclomática simplificada para TypeScript */
function tsComplexity(content) {
	const patterns = [
		/\bif\s*\(/g,
		/\belse\s+if\s*\(/g,
		/\bfor\s*\(/g,
		/\bwhile\s*\(/g,
		/\bdo\s*\{/g,
		/\bswitch\s*\(/g,
		/\bcase\s+[^:]+:/g,
		/\bcatch\s*\(/g,
		/\?\s*[^:]+:/g, // ternarios
		/&&|\|\|/g
	];
	return patterns.reduce((sum, re) => sum + (content.match(re) || []).length, 1);
}

/** Complejidad para Svelte: combina script + template */
function svelteComplexity(content) {
	// Extraer bloque <script>
	const scriptMatch = content.match(/<script(?:\s[^>]*)?>(?<src>[\s\S]*?)<\/script(?:\s[^>]*)?>/i);
	const scriptContent = scriptMatch ? (scriptMatch.groups?.src ?? '') : '';

	// Complejidad lógica en script
	const logicComplexity = tsComplexity(scriptContent);

	// Directivas de template
	const templateDirectives = [
		/#if\b/g,
		/:else\b/g,
		/:else if\b/g,
		/#each\b/g,
		/#await\b/g,
		/:catch\b/g
	];
	const templateComplexity = templateDirectives.reduce(
		(sum, re) => sum + (content.match(re) || []).length,
		0
	);

	return logicComplexity + templateComplexity;
}

function analyzeFile(filePath) {
	const content = readFileSync(filePath, 'utf-8');
	const lines = content.split('\n').length;
	const ext = extname(filePath).slice(1);

	const complexity = ext === 'svelte' ? svelteComplexity(content) : tsComplexity(content);

	const exceedsComplexity = complexity > CONFIG.maxComplexity;
	const exceedsLines = lines > CONFIG.maxLines;
	const status = exceedsComplexity || exceedsLines ? 'WARN' : 'OK';

	return { filePath, lines, complexity, status };
}

// ──────────────────────────────────────────────────────────────────
// DETECCIÓN DE DUPLICADOS
// ──────────────────────────────────────────────────────────────────

/** Filtra líneas triviales (vacías, solo llaves/corchetes, imports simples, markup HTML/SVG) */
function isNonTrivialLine(line) {
	const trimmed = line.trim();
	if (trimmed.length < 12) return false;
	// Solo estructura sintáctica
	if (/^[{}[\]();,<>]+$/.test(trimmed)) return false;
	// Imports / exports de módulos
	if (/^import\s/.test(trimmed)) return false;
	if (/^export\s*\{/.test(trimmed)) return false;
	// Comentarios
	if (/^\s*\/\//.test(trimmed)) return false;
	if (/^\s*\*/.test(trimmed)) return false;
	// Atributos HTML/SVG puros (p.ej. stroke="currentColor", fill="none")
	if (/^[a-z-]+=["'][^"']*["']$/.test(trimmed)) return false;
	// Tags HTML/SVG de apertura o cierre simples
	if (/^<\/?[a-zA-Z][a-zA-Z0-9-]*(\s[^>]*)?>?$/.test(trimmed)) return false;
	// Cierre de tags
	if (/^<\/[a-zA-Z]/.test(trimmed)) return false;
	// Líneas que solo tienen atributos SVG (stroke-*, fill-*, d=, viewBox=)
	if (/^(stroke|fill|viewBox|stroke-linecap|stroke-linejoin|stroke-width|d=)/.test(trimmed)) return false;
	return true;
}

function detectDuplicates(files) {
	const chunks = new Map(); // hash → [file, lineStart]

	for (const file of files) {
		const content = readFileSync(file, 'utf-8');
		const lines = content.split('\n').map((l) => l.trim());

		for (let i = 0; i <= lines.length - CONFIG.minDuplicateLines; i++) {
			const chunk = lines.slice(i, i + CONFIG.minDuplicateLines);
			// Require that at least half the lines have non-trivial content
			const nonTrivialCount = chunk.filter(isNonTrivialLine).length;
			if (nonTrivialCount < Math.ceil(CONFIG.minDuplicateLines / 2)) continue;

			const chunkStr = chunk.join('\n');
			if (!chunks.has(chunkStr)) chunks.set(chunkStr, []);
			chunks.get(chunkStr).push({ file, line: i + 1 });
		}
	}

	// Solo fragmentos que aparecen en ≥2 archivos distintos
	const duplicates = [];
	for (const [chunk, locations] of chunks.entries()) {
		const uniqueFiles = new Set(locations.map((l) => l.file));
		if (uniqueFiles.size >= 2) {
			duplicates.push({ lines: chunk.split('\n').length, count: locations.length, locations });
		}
	}

	duplicates.sort((a, b) => b.count - a.count);
	return duplicates;
}

function duplicationPercent(files, duplicates) {
	let totalLines = 0;
	let duplicatedLines = 0;

	for (const file of files) {
		const content = readFileSync(file, 'utf-8');
		totalLines += content.split('\n').filter((l) => l.trim()).length;
	}

	// Count unique duplicate lines (once per extra occurrence in a different file)
	for (const dup of duplicates) {
		const uniqueFiles = new Set(dup.locations.map((l) => l.file));
		// Extra copies beyond the first occurrence = (uniqueFiles - 1) * lines
		duplicatedLines += dup.lines * (uniqueFiles.size - 1);
	}

	if (totalLines === 0) return 0;
	return Math.min(100, (duplicatedLines / totalLines) * 100);
}

// ──────────────────────────────────────────────────────────────────
// DETERMINACIÓN DE NIVEL
// ──────────────────────────────────────────────────────────────────
function determineLevel(avgComplexity, duplicationPct, testRatio, failingFiles, totalFiles) {
	const warnPct = totalFiles > 0 ? (failingFiles / totalFiles) * 100 : 0;

	const { profesional, avanzado, intermedio } = CONFIG.nivel;

	if (
		avgComplexity <= profesional.maxAvgComplexity &&
		duplicationPct <= profesional.maxDuplication &&
		testRatio >= profesional.minTestRatio &&
		warnPct <= profesional.maxWarnPct
	)
		return 'Profesional';

	if (
		avgComplexity <= avanzado.maxAvgComplexity &&
		duplicationPct <= avanzado.maxDuplication &&
		testRatio >= avanzado.minTestRatio &&
		warnPct <= avanzado.maxWarnPct
	)
		return 'Avanzado';

	if (
		avgComplexity <= intermedio.maxAvgComplexity &&
		duplicationPct <= intermedio.maxDuplication &&
		testRatio >= intermedio.minTestRatio &&
		warnPct <= intermedio.maxWarnPct
	)
		return 'Intermedio';

	return 'Básico';
}

function levelEmoji(level) {
	return { Básico: '🔴', Intermedio: '🟡', Avanzado: '🟢', Profesional: '⭐' }[level] ?? '❓';
}

function levelDescription(level) {
	const desc = {
		Básico:
			'Código funcional pero con alta complejidad, duplicación o falta de tests. Requiere refactorización.',
		Intermedio:
			'Código estructurado con complejidad moderada. Hay margen de mejora en pruebas y duplicación.',
		Avanzado:
			'Código bien organizado, baja complejidad y duplicación. Buena cobertura de pruebas.',
		Profesional:
			'Código de alta calidad: complejidad controlada, mínima duplicación y sólida cobertura de pruebas.'
	};
	return desc[level] ?? '';
}

// ──────────────────────────────────────────────────────────────────
// GENERACIÓN DE REPORTE
// ──────────────────────────────────────────────────────────────────
function truncate(str, maxLen) {
	return str.length > maxLen ? str.slice(0, maxLen - 1) + '…' : str;
}

function generateReport(rootDir, sourceFiles, testFiles, analyzed, duplicates, dupPct) {
	const totalLines = analyzed.reduce((s, f) => s + f.lines, 0);
	const avgComplexity =
		analyzed.length > 0
			? analyzed.reduce((s, f) => s + f.complexity, 0) / analyzed.length
			: 0;
	const failingFiles = analyzed.filter((f) => f.status === 'WARN').length;
	const testRatio = sourceFiles.length > 0 ? testFiles.length / sourceFiles.length : 0;

	const level = determineLevel(avgComplexity, dupPct, testRatio, failingFiles, analyzed.length);
	const emoji = levelEmoji(level);

	const now = new Date().toISOString();
	const lines = [];

	const W = 70;
	const divider = '═'.repeat(W);
	const thin = '─'.repeat(W);

	lines.push(divider);
	lines.push('         REPORTE DE CALIDAD DE CÓDIGO - MytilusData');
	lines.push(divider);
	lines.push('');
	lines.push(`Fecha    : ${now}`);
	lines.push(`Directorio: ${rootDir}`);
	lines.push('');
	lines.push(thin);
	lines.push('LÍMITES CONFIGURADOS');
	lines.push(thin);
	lines.push(`Complejidad Máxima : ${CONFIG.maxComplexity}`);
	lines.push(`Líneas Máximas     : ${CONFIG.maxLines}`);
	lines.push(`Extensiones        : ${CONFIG.extensions.join(', ')}`);
	lines.push('');
	lines.push(thin);
	lines.push('RESUMEN');
	lines.push(thin);
	lines.push(`Archivos fuente analizados : ${analyzed.length}`);
	lines.push(`Archivos de tests          : ${testFiles.length}`);
	lines.push(`Ratio tests/fuente         : ${(testRatio * 100).toFixed(1)}%`);
	lines.push(`Total líneas               : ${totalLines}`);
	lines.push(`Complejidad promedio       : ${avgComplexity.toFixed(1)}`);
	lines.push(`Código duplicado           : ${dupPct.toFixed(2)}%`);
	lines.push(`Archivos con advertencias  : ${failingFiles}`);
	lines.push('');
	lines.push(thin);
	lines.push('NIVEL DE CALIDAD');
	lines.push(thin);
	lines.push('');
	lines.push(`  ${emoji}  NIVEL: ${level.toUpperCase()}`);
	lines.push('');
	lines.push(`  ${levelDescription(level)}`);
	lines.push('');
	const warnPct = analyzed.length > 0 ? (failingFiles / analyzed.length) * 100 : 0;
	lines.push('  Criterios de evaluación:');
	lines.push(`    Complejidad promedio : ${avgComplexity.toFixed(1)}  (umbral profesional ≤ ${CONFIG.nivel.profesional.maxAvgComplexity})`);
	lines.push(`    Duplicación          : ${dupPct.toFixed(2)}%  (umbral profesional ≤ ${CONFIG.nivel.profesional.maxDuplication}%)`);
	lines.push(`    Cobertura de tests   : ${(testRatio * 100).toFixed(1)}%  (umbral profesional ≥ ${(CONFIG.nivel.profesional.minTestRatio * 100).toFixed(0)}%)`);
	lines.push(`    Archivos con warn    : ${failingFiles} (${warnPct.toFixed(1)}%)  (umbral profesional = 0%)`);
	lines.push('');
	lines.push('  Escala de niveles:');
	lines.push('    ⭐ Profesional — Alta calidad, mínima complejidad/duplicación, tests sólidos');
	lines.push('    🟢 Avanzado    — Buena calidad, complejidad controlada, tests presentes');
	lines.push('    🟡 Intermedio  — Calidad aceptable, margen de mejora');
	lines.push('    🔴 Básico      — Requiere refactorización importante');
	lines.push('');
	lines.push(thin);
	lines.push('DETALLE POR ARCHIVO (ordenado por complejidad)');
	lines.push(thin);

	const header = `${'Archivo'.padEnd(46)} ${'Líneas'.padStart(6)}  ${'Complejidad'.padStart(11)}  ${'Estado'.padStart(6)}`;
	lines.push(header);
	lines.push('-'.repeat(W));

	const sorted = [...analyzed].sort((a, b) => b.complexity - a.complexity);
	for (const file of sorted) {
		const rel = truncate(relative(rootDir, file.filePath), 46);
		const statusLabel = file.status === 'WARN' ? '⚠ WARN' : 'OK';
		lines.push(
			`${rel.padEnd(46)} ${String(file.lines).padStart(6)}  ${String(file.complexity).padStart(11)}  ${statusLabel.padStart(6)}`
		);
	}

	lines.push('');
	lines.push(thin);
	lines.push(`FRAGMENTOS MÁS REPETIDOS (top ${CONFIG.showTopDuplicates})`);
	lines.push(thin);

	const topDups = duplicates.slice(0, CONFIG.showTopDuplicates);
	if (topDups.length === 0) {
		lines.push('No se detectaron fragmentos duplicados significativos.');
	} else {
		topDups.forEach((dup, i) => {
			const uniqueFiles = [...new Set(dup.locations.map((l) => basename(l.file)))];
			lines.push(`${i + 1}. ${dup.lines} líneas, ${dup.count} veces en:`);
			uniqueFiles.slice(0, 3).forEach((f) => lines.push(`   - ${f}`));
		});
	}

	lines.push('');
	lines.push(divider);
	lines.push('FIN DEL REPORTE');
	lines.push(divider);

	return lines.join('\n');
}

// ──────────────────────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────────────────────
function main() {
	const args = process.argv.slice(2);
	const outputIdx = args.indexOf('--output');
	const outputFile = outputIdx !== -1 ? args[outputIdx + 1] : 'code-quality-report.txt';

	const rootDir = process.cwd();

	console.log('Recopilando archivos...');
	const { source: sourceFiles, tests: testFiles } = collectFiles(join(rootDir, 'src'), rootDir);

	console.log(`Archivos fuente: ${sourceFiles.length}  |  Tests: ${testFiles.length}`);
	console.log('Analizando complejidad...');

	const analyzed = sourceFiles.map((f) => {
		try {
			return analyzeFile(f);
		} catch (err) {
			return { filePath: f, lines: 0, complexity: 0, status: 'ERROR' };
		}
	});

	console.log('Detectando duplicados...');
	const duplicates = detectDuplicates(sourceFiles);
	const dupPct = duplicationPercent(sourceFiles, duplicates);

	const report = generateReport(rootDir, sourceFiles, testFiles, analyzed, duplicates, dupPct);

	writeFileSync(outputFile, report, 'utf-8');
	console.log(`\nReporte generado: ${outputFile}`);

	// Mostrar nivel en consola
	const totalLines = analyzed.reduce((s, f) => s + f.lines, 0);
	const avgComplexity =
		analyzed.length > 0
			? analyzed.reduce((s, f) => s + f.complexity, 0) / analyzed.length
			: 0;
	const failingFiles = analyzed.filter((f) => f.status === 'WARN').length;
	const testRatio = sourceFiles.length > 0 ? testFiles.length / sourceFiles.length : 0;
	const level = determineLevel(avgComplexity, dupPct, testRatio, failingFiles, analyzed.length);

	console.log('\n' + '═'.repeat(50));
	console.log(`  ${levelEmoji(level)}  NIVEL DE CALIDAD: ${level.toUpperCase()}`);
	console.log('═'.repeat(50));
	console.log(`  Complejidad promedio : ${avgComplexity.toFixed(1)}`);
	console.log(`  Duplicación          : ${dupPct.toFixed(2)}%`);
	console.log(`  Ratio tests/fuente   : ${(testRatio * 100).toFixed(1)}%`);
	console.log(`  Advertencias         : ${failingFiles}`);
	console.log('═'.repeat(50) + '\n');
}

main();
