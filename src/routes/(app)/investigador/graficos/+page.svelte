<script lang="ts">
	import { LineChart } from 'layerchart';
	import { scaleTime, scaleLinear } from 'd3-scale';
	import * as Card from '$lib/components/ui/card';

	export let data: import('./$types').PageData;

	// --- Estado de filtros ---
	let selectedUserId: string = 'all';
	let selectedCentroId: number | null = null;
	let selectedCicloId: number | null = null;
	let selectedTipoIds: Set<number> = new Set();

	// Colores para cada serie (hasta 10)
	const seriesColors = [
		'oklch(0.55 0.18 200)', // ocean-light
		'oklch(0.72 0.15 185)', // teal-glow
		'oklch(0.65 0.17 170)', // chart-2
		'oklch(0.7 0.18 140)', // chart-3
		'oklch(0.6 0.22 280)', // chart-4
		'oklch(0.65 0.22 30)', // chart-5
		'oklch(0.55 0.15 300)',
		'oklch(0.60 0.20 60)',
		'oklch(0.50 0.18 120)',
		'oklch(0.70 0.12 250)'
	];

	// Mapa estable de tipo.id → color (asignado una vez, nunca cambia)
	$: tipoColorMap = new Map(
		data.tipos.map((t, i) => [t.id, seriesColors[i % seriesColors.length]])
	);

	function getColorForTipo(tipoId: number): string {
		return tipoColorMap.get(tipoId) ?? seriesColors[0];
	}

	// Centros filtrados por usuario
	$: centrosFiltrados =
		selectedUserId === 'all'
			? data.centros
			: data.centros.filter((c) => c.userId === Number(selectedUserId));

	// Ciclos filtrados por centro seleccionado
	$: ciclosFiltrados = selectedCentroId
		? data.ciclos.filter((c) => c.lugarId === selectedCentroId)
		: data.ciclos;

	// Reset ciclo/centro si cambian sus dependencias
	$: if (selectedUserId) {
		if (selectedCentroId) {
			const centroValido = centrosFiltrados.find((c) => c.id === selectedCentroId);
			if (!centroValido) {
				selectedCentroId = null;
				selectedCicloId = null;
			}
		}
	}

	$: if (selectedCentroId) {
		const cicloValido = ciclosFiltrados.find((c) => c.id === selectedCicloId);
		if (!cicloValido) selectedCicloId = null;
	}

	// Inicializar tipos seleccionados
	$: if (selectedTipoIds.size === 0 && data.tipos.length > 0) {
		selectedTipoIds = new Set(data.tipos.map((t) => t.id));
	}

	function toggleTipo(tipoId: number) {
		const newSet = new Set(selectedTipoIds);
		if (newSet.has(tipoId)) {
			newSet.delete(tipoId);
		} else {
			newSet.add(tipoId);
		}
		selectedTipoIds = newSet;
	}

	// --- Filtrar registros ---
	$: registrosFiltrados = data.registros.filter((r) => {
		if (selectedUserId !== 'all' && r.userId !== Number(selectedUserId)) return false;
		if (selectedCentroId && r.lugarId !== selectedCentroId) return false;
		if (selectedCicloId && r.cicloId !== selectedCicloId) return false;
		if (!selectedTipoIds.has(r.tipoId)) return false;
		return true;
	});

	// --- Preparar datos para el gráfico ---
	$: tiposActivos = data.tipos.filter((t) => selectedTipoIds.has(t.id));

	$: chartSeries = tiposActivos
		.map((tipo) => {
			const tipoData = registrosFiltrados
				.filter((r) => r.tipoId === tipo.id)
				.map((r) => ({
					date: new Date(r.fechaMedicion),
					value: r.valor
				}))
				.sort((a, b) => a.date.getTime() - b.date.getTime());

			if (tipoData.length === 0) return null;

			return {
				key: tipo.codigo,
				label: `${tipo.codigo} (${tipo.unidadBase})`,
				data: tipoData,
				color: getColorForTipo(tipo.id)
			};
		})
		.filter(Boolean) as {
		key: string;
		label: string;
		data: { date: Date; value: number }[];
		color: string;
	}[];

	$: hayDatos = chartSeries.length > 0 && chartSeries.some((s) => s.data.length > 0);

	// --- Estadísticas rápidas ---
	$: stats = (() => {
		if (registrosFiltrados.length === 0) {
			return {
				total: 0,
				porTipo: [] as {
					codigo: string;
					unidad: string;
					promedio: number;
					min: number;
					max: number;
					cuenta: number;
				}[]
			};
		}

		const porTipo = tiposActivos
			.map((tipo) => {
				const valores = registrosFiltrados.filter((r) => r.tipoId === tipo.id).map((r) => r.valor);

				if (valores.length === 0)
					return {
						codigo: tipo.codigo,
						unidad: tipo.unidadBase,
						promedio: 0,
						min: 0,
						max: 0,
						cuenta: 0
					};

				return {
					codigo: tipo.codigo,
					unidad: tipo.unidadBase,
					promedio: Math.round((valores.reduce((a, b) => a + b, 0) / valores.length) * 100) / 100,
					min: Math.round(Math.min(...valores) * 100) / 100,
					max: Math.round(Math.max(...valores) * 100) / 100,
					cuenta: valores.length
				};
			})
			.filter((s) => s.cuenta > 0);

		return { total: registrosFiltrados.length, porTipo };
	})();

	// Última medición
	$: ultimaMedicion =
		registrosFiltrados.length > 0 ? registrosFiltrados[registrosFiltrados.length - 1] : null;

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('es-CL', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Análisis y Gráficos Globales | Plataforma Idea 2025</title>
</svelte:head>

<div class="space-y-6">
	<!-- Encabezado -->
	<div class="animate-fade-up flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
		<div>
			<p
				class="mb-2 font-body text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase"
			>
				Área Investigador
			</p>
			<h1 class="font-display text-3xl leading-tight text-foreground md:text-4xl">
				Análisis y <span class="text-gradient-ocean">Gráficos Globales</span>
			</h1>
			<p class="mt-2 font-body text-sm text-muted-foreground">
				Visualiza la evolución de las mediciones filtradas por usuario a lo largo del tiempo
			</p>
		</div>
		<div class="sm:self-end">
			<select
				bind:value={selectedUserId}
				class="w-full rounded-xl border border-border bg-background px-4 py-2 font-body text-sm text-foreground focus:border-teal-glow focus:ring-1 focus:ring-teal-glow focus:outline-none sm:w-64"
			>
				<option value="all">Todos los Usuarios</option>
				{#each data.usuarios as usr}
					<option value={usr.id.toString()}>{usr.nombre}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Panel de Filtros Secundario -->
	<div class="animate-fade-up delay-75">
		<Card.Root class="border-border/50">
			<Card.Header class="pb-4">
				<Card.Title class="font-display text-lg">Sub-filtros Espaciales/Técnicos</Card.Title>
				<Card.Description class="font-body text-xs"
					>Restringe los datos del usuario seleccionado por centro, ciclo y tipos</Card.Description
				>
			</Card.Header>
			<Card.Content>
				<div class="grid gap-4 md:grid-cols-3">
					<!-- Selector de Centro -->
					<div class="space-y-1.5">
						<label for="centro-select" class="font-body text-xs font-medium text-muted-foreground">
							Centro de Cultivo
						</label>
						<select
							id="centro-select"
							class="h-10 w-full rounded-xl border border-border bg-background px-3 font-body text-sm text-foreground transition-colors focus:border-ocean-light focus:ring-1 focus:ring-ocean-light focus:outline-none"
							bind:value={selectedCentroId}
						>
							<option value={null}>Todos los centros</option>
							{#each centrosFiltrados as centro (centro.id)}
								<option value={centro.id}>{centro.nombre}</option>
							{/each}
						</select>
					</div>

					<!-- Selector de Ciclo -->
					<div class="space-y-1.5">
						<label for="ciclo-select" class="font-body text-xs font-medium text-muted-foreground">
							Ciclo Productivo
						</label>
						<select
							id="ciclo-select"
							class="h-10 w-full rounded-xl border border-border bg-background px-3 font-body text-sm text-foreground transition-colors focus:border-ocean-light focus:ring-1 focus:ring-ocean-light focus:outline-none"
							bind:value={selectedCicloId}
							disabled={ciclosFiltrados.length === 0}
						>
							<option value={null}>Todos los ciclos</option>
							{#each ciclosFiltrados as ciclo (ciclo.id)}
								<option value={ciclo.id}>{ciclo.nombre}</option>
							{/each}
						</select>
					</div>

					<!-- Tipos de Registro (checkboxes) -->
					<div class="space-y-1.5">
						<span class="font-body text-xs font-medium text-muted-foreground">
							Tipos de Medición
						</span>
						<div class="flex flex-wrap gap-2 pt-1">
							{#each data.tipos as tipo (tipo.id)}
								<button
									type="button"
									class="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-body text-xs font-medium transition-all duration-200 {selectedTipoIds.has(
										tipo.id
									)
										? 'border-ocean-light/40 bg-ocean-light/10 text-ocean-light'
										: 'border-border/50 text-muted-foreground hover:border-border hover:bg-secondary/50'}"
									onclick={() => toggleTipo(tipo.id)}
								>
									<div
										class="h-2.5 w-2.5 rounded-full transition-opacity {selectedTipoIds.has(tipo.id)
											? 'opacity-100'
											: 'opacity-30'}"
										style="background-color: {getColorForTipo(tipo.id)}"
									></div>
									{tipo.codigo}
									<span class="text-[10px] opacity-60">({tipo.unidadBase})</span>
								</button>
							{/each}
						</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Gráfico Principal -->
	<div class="animate-fade-up delay-150">
		<Card.Root class="overflow-hidden border-border/50">
			<Card.Header>
				<div class="flex items-center justify-between">
					<div>
						<Card.Title class="font-display text-lg">Evolución Temporal Global</Card.Title>
						<Card.Description class="mt-1 font-body text-xs">
							{#if hayDatos}
								{registrosFiltrados.length} mediciones visualizadas
							{:else}
								Selecciona filtros para ver datos
							{/if}
						</Card.Description>
					</div>
					{#if hayDatos}
						<div class="flex flex-wrap gap-3">
							{#each chartSeries as s (s.key)}
								<div class="flex items-center gap-1.5 font-body text-xs text-muted-foreground">
									<div class="h-2.5 w-2.5 rounded-full" style="background-color: {s.color}"></div>
									{s.label}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</Card.Header>
			<Card.Content>
				{#if hayDatos}
					<div class="h-[400px] w-full">
						<LineChart
							data={chartSeries.length === 1 ? chartSeries[0].data : []}
							x="date"
							xScale={scaleTime()}
							y="value"
							yScale={scaleLinear()}
							series={chartSeries.length > 1
								? chartSeries.map((s) => ({
										key: s.key,
										label: s.label,
										data: s.data,
										color: s.color,
										value: 'value'
									}))
								: undefined}
							axis
							grid
							legend={chartSeries.length > 1}
							tooltip
							points={registrosFiltrados.length < 100}
							props={{
								xAxis: {
									format: (v: any) =>
										v instanceof Date
											? v.toLocaleDateString('es-CL', { month: 'short', year: '2-digit' })
											: String(v)
								}
							}}
						/>
					</div>
				{:else}
					<div
						class="relative flex h-[400px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-border/50 bg-secondary/30"
					>
						<div class="absolute inset-0 opacity-[0.03]">
							<svg width="100%" height="100%">
								{#each Array(8) as _, i (i)}
									<line
										x1="0"
										y1="{(i + 1) * 12.5}%"
										x2="100%"
										y2="{(i + 1) * 12.5}%"
										stroke="currentColor"
										stroke-width="1"
									/>
								{/each}
							</svg>
						</div>
						<div class="relative z-10 text-center">
							<div
								class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-ocean-light/10"
							>
								<svg
									class="h-6 w-6 text-ocean-light/60"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="1.5"
										d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
									/>
								</svg>
							</div>
							<p class="font-body text-sm text-muted-foreground">
								No hay datos para los filtros seleccionados
							</p>
							<p class="mt-1 font-body text-xs text-muted-foreground/60">
								Ajusta los filtros o selecciona otro usuario
							</p>
						</div>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Estadísticas Rápidas -->
	{#if stats.total > 0}
		<div class="animate-fade-up delay-200">
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<!-- Total de mediciones -->
				<div class="card-hover group">
					<Card.Root class="border-border/50 transition-colors duration-300 hover:border-border">
						<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
							<Card.Title class="font-body text-sm font-medium text-muted-foreground"
								>Total Mediciones Visualizadas</Card.Title
							>
							<div
								class="flex h-9 w-9 items-center justify-center rounded-xl bg-ocean-light/10 transition-transform duration-300 group-hover:scale-110"
							>
								<svg
									class="h-[18px] w-[18px] text-ocean-light"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="1.75"
										d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
							</div>
						</Card.Header>
						<Card.Content>
							<div class="font-display text-3xl text-foreground">{stats.total}</div>
							<p class="mt-1 font-body text-xs text-muted-foreground">registros filtrados</p>
						</Card.Content>
					</Card.Root>
				</div>

				<!-- Última medición -->
				{#if ultimaMedicion}
					<div class="card-hover group">
						<Card.Root class="border-border/50 transition-colors duration-300 hover:border-border">
							<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
								<Card.Title class="font-body text-sm font-medium text-muted-foreground"
									>Última Medición</Card.Title
								>
								<div
									class="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-glow/10 transition-transform duration-300 group-hover:scale-110"
								>
									<svg
										class="h-[18px] w-[18px] text-teal-glow"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="1.75"
											d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
							</Card.Header>
							<Card.Content>
								<div class="font-display text-xl text-foreground">
									{ultimaMedicion.valor}
									{ultimaMedicion.tipoUnidad}
								</div>
								<p class="mt-1 font-body text-xs text-muted-foreground">
									{ultimaMedicion.tipoCodigo} · {formatDate(ultimaMedicion.fechaMedicion)}
								</p>
							</Card.Content>
						</Card.Root>
					</div>
				{/if}

				<!-- Stats por tipo -->
				{#each stats.porTipo.slice(0, 2) as tipoStat (tipoStat.codigo)}
					<div class="card-hover group">
						<Card.Root class="border-border/50 transition-colors duration-300 hover:border-border">
							<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
								<Card.Title class="font-body text-sm font-medium text-muted-foreground"
									>{tipoStat.codigo}</Card.Title
								>
								<span
									class="rounded-md bg-secondary px-1.5 py-0.5 font-body text-[10px] font-semibold text-muted-foreground"
								>
									{tipoStat.unidad}
								</span>
							</Card.Header>
							<Card.Content>
								<div class="font-display text-xl text-foreground">x̄ {tipoStat.promedio}</div>
								<div class="mt-1.5 flex items-center gap-3 font-body text-xs text-muted-foreground">
									<span class="flex items-center gap-1">
										<svg
											class="h-3 w-3 text-teal-glow"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M5 15l7-7 7 7"
											/>
										</svg>
										Max: {tipoStat.max}
									</span>
									<span class="flex items-center gap-1">
										<svg
											class="h-3 w-3 text-destructive"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M19 9l-7 7-7-7"
											/>
										</svg>
										Min: {tipoStat.min}
									</span>
									<span class="opacity-60">{tipoStat.cuenta} reg.</span>
								</div>
							</Card.Content>
						</Card.Root>
					</div>
				{/each}
			</div>
		</div>

		<!-- Tabla de resumen completa si hay más de 2 tipos -->
		{#if stats.porTipo.length > 2}
			<div class="animate-fade-up delay-300">
				<Card.Root class="border-border/50">
					<Card.Header>
						<Card.Title class="font-display text-lg">Resumen por Tipo de Medición</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="overflow-x-auto">
							<table class="w-full font-body text-sm">
								<thead>
									<tr class="border-b border-border/50">
										<th class="px-3 py-2 text-left text-xs font-medium text-muted-foreground"
											>Tipo</th
										>
										<th class="px-3 py-2 text-right text-xs font-medium text-muted-foreground"
											>Registros</th
										>
										<th class="px-3 py-2 text-right text-xs font-medium text-muted-foreground"
											>Promedio</th
										>
										<th class="px-3 py-2 text-right text-xs font-medium text-muted-foreground"
											>Mínimo</th
										>
										<th class="px-3 py-2 text-right text-xs font-medium text-muted-foreground"
											>Máximo</th
										>
									</tr>
								</thead>
								<tbody>
									{#each stats.porTipo as tipoStat (tipoStat.codigo)}
										<tr class="border-b border-border/30 transition-colors hover:bg-secondary/30">
											<td class="px-3 py-2.5 font-medium text-foreground">
												{tipoStat.codigo}
												<span class="ml-1 text-xs text-muted-foreground">({tipoStat.unidad})</span>
											</td>
											<td class="px-3 py-2.5 text-right text-muted-foreground">{tipoStat.cuenta}</td
											>
											<td class="px-3 py-2.5 text-right font-medium text-foreground"
												>{tipoStat.promedio}</td
											>
											<td class="px-3 py-2.5 text-right text-muted-foreground">{tipoStat.min}</td>
											<td class="px-3 py-2.5 text-right text-muted-foreground">{tipoStat.max}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		{/if}
	{/if}
</div>
