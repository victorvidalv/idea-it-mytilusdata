<!--
Formulario para ingresar datos de mediciones día a día.
Soporta ingreso manual y carga desde ciclo existente.
-->
<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import SearchableSelect from '$lib/components/SearchableSelect.svelte';

	// --- Tipos ---
	interface Lugar {
		id: number;
		nombre: string;
	}

	interface Ciclo {
		id: number;
		nombre: string;
		lugarId: number;
		fechaSiembra: string;
	}

	interface MedicionCargada {
		dia: number;
		talla: number;
	}

	interface Props {
		lugares?: Lugar[];
		ciclos?: Ciclo[];
		dias: number[];
		tallas: number[];
		tallaObjetivo?: string;
		onAgregarPunto: (dia: number, talla: number) => void;
		onEliminarPunto: (dia: number) => void;
		onUsarMedicionesCargadas: (mediciones: MedicionCargada[]) => void;
		onEjecutarProyeccion: () => void;
		error: string;
		cargando: boolean;
	}

	let {
		lugares = [],
		ciclos = [],
		dias,
		tallas,
		tallaObjetivo = $bindable(''),
		onAgregarPunto,
		onEliminarPunto,
		onUsarMedicionesCargadas,
		onEjecutarProyeccion,
		error,
		cargando
	}: Props = $props();

	// --- Estado para selectors (para datos que no vienen de props) ---
	let lugaresLocales = $state<Lugar[]>([]);
	let ciclosLocales = $state<Ciclo[]>([]);
	let selectedLugarId = $state<number | null>(null);
	let selectedCicloId = $state<number | null>(null);
	let cargandoDatos = $state(false);
	let errorCarga = $state('');

	// --- Estado para mediciones cargadas desde ciclo ---
	let medicionesCargadas = $state<MedicionCargada[]>([]);

	// --- Inputs manual ---
	let nuevoDia = $state('');
	let nuevaTalla = $state('');


	// --- Efecto: usar props si existen, sino cargar desde API ---
	$effect(() => {
		if (lugares && lugares.length > 0) {
			lugaresLocales = lugares;
		} else {
			cargarLugares();
		}
	});

	// --- Efecto para filtrar ciclos cuando cambia lugar ---
	// Usamos lugarIdEffect para rastrear el valor actual y evitar condiciones de carrera
	let lugarIdActual = $state<number | null>(null);
	$effect(() => {
		lugarIdActual = selectedLugarId;
	});

	$effect(() => {
		if (selectedLugarId !== null) {
			selectedCicloId = null;
			medicionesCargadas = [];
			ciclosLocales = ciclos.filter((c) => c.lugarId === selectedLugarId);
		}
	});

	// --- Funciones de carga de datos ---
	async function cargarLugares() {
		try {
			const res = await fetch('/api/centros', { credentials: 'include' });
			if (!res.ok) throw new Error('Error al cargar lugares');
			const data = await res.json();
			lugaresLocales = data.data || [];
		} catch {
			lugaresLocales = [];
		}
	}

	// Filtrar ciclos desde props en lugar de API para evitar 401
	function cargarCiclos(lugarId: number) {
		ciclosLocales = ciclos.filter((c) => c.lugarId === lugarId);
	}

	async function cargarMediciones() {
		if (!selectedCicloId) return;

		cargandoDatos = true;
		errorCarga = '';
		medicionesCargadas = [];

		try {
			const res = await fetch(`/api/proyeccion?cicloId=${selectedCicloId}`, {
				credentials: 'include'
			});
			const data = await res.json();

			if (!res.ok || !data.success) {
				throw new Error(data.error || 'Error al cargar mediciones');
			}

			medicionesCargadas = data.mediciones || [];
		} catch (err) {
			errorCarga = err instanceof Error ? err.message : 'Error al cargar mediciones';
		} finally {
			cargandoDatos = false;
		}
	}

	// --- Funciones para usar datos cargados ---
	function usarMedicionesCargadas() {
		// Delegar al callback del padre para mantener inmutabilidad de props
		onUsarMedicionesCargadas(medicionesCargadas);
		// Limpiar mediciones cargadas localmente
		medicionesCargadas = [];
		selectedCicloId = null;
	}

	function eliminarMedicionCargada(dia: number) {
		medicionesCargadas = medicionesCargadas.filter((m) => m.dia !== dia);
	}

	// --- Funciones de ingreso manual ---
	function agregarPunto() {
		const dia = parseInt(nuevoDia, 10);
		const talla = parseFloat(nuevaTalla);

		if (isNaN(dia) || isNaN(talla)) {
			error = 'Ingresa valores numéricos válidos';
			return;
		}

		if (dia < 0) {
			error = 'El día debe ser un número positivo';
			return;
		}

		if (talla <= 0 || talla > 200) {
			error = 'La talla debe estar entre 0 y 200 mm';
			return;
		}

		onAgregarPunto(dia, talla);
		nuevoDia = '';
		nuevaTalla = '';
		error = '';
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			agregarPunto();
		}
	}

	// --- Opciones para selectors ---
	let lugarOptions = $derived(
		lugaresLocales.map((l) => ({ value: l.id, label: l.nombre }))
	);

	let cicloOptions = $derived(
		ciclosLocales.map((c) => ({
			value: c.id,
			label: `${c.nombre} (${new Date(c.fechaSiembra).toLocaleDateString()})`
		}))
	);
</script>

<Card.Root class="border-border/50">
	<Card.Header>
		<Card.Title class="font-display text-lg">Ingresa tus mediciones</Card.Title>
		<Card.Description class="mt-1 font-body text-xs">
			Agrega los datos de tus mediciones día a día. Mínimo 3 puntos para proyectar.
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-6">
		<!-- Sección: Cargar desde ciclo -->
		<div class="rounded-lg border border-dashed border-border bg-secondary/20 p-4 space-y-4">
			<div class="flex items-center gap-2">
				<Label class="text-sm font-medium">Cargar desde ciclo existente</Label>
			</div>

			<div class="flex flex-col gap-4 sm:flex-row">
				<div class="flex-1 space-y-2">
					<Label
						for="selector-lugar"
						class="text-xs font-medium tracking-wider text-muted-foreground uppercase"
					>
						Lugar
					</Label>
					<SearchableSelect
						id="selector-lugar"
						bind:value={selectedLugarId}
						options={lugarOptions}
						placeholder="Selecciona un lugar..."
						disabled={lugaresLocales.length === 0}
					/>
				</div>

				<div class="flex-1 space-y-2">
					<Label
						for="selector-ciclo"
						class="text-xs font-medium tracking-wider text-muted-foreground uppercase"
					>
						Ciclo
					</Label>
					<SearchableSelect
						id="selector-ciclo"
						bind:value={selectedCicloId}
						options={cicloOptions}
						placeholder={cargandoDatos ? 'Cargando ciclos...' : 'Selecciona un ciclo...'}
						disabled={selectedLugarId === null}
					/>
				</div>

				<div class="flex items-end">
					<Button
						onclick={cargarMediciones}
						disabled={selectedCicloId === null || cargandoDatos}
						class="h-11 rounded-xl bg-ocean-mid hover:bg-ocean-light"
					>
						{cargandoDatos ? 'Cargando...' : 'Cargar datos'}
					</Button>
				</div>
			</div>

			<!-- Error de carga -->
			{#if errorCarga}
				<p class="text-sm text-destructive">{errorCarga}</p>
			{/if}

			<!-- Tabla de mediciones cargadas -->
			{#if medicionesCargadas.length > 0}
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label class="text-xs font-medium tracking-wider text-muted-foreground uppercase">
							Mediciones del ciclo ({medicionesCargadas.length})
						</Label>
						<Button
							variant="outline"
							size="sm"
							onclick={usarMedicionesCargadas}
							class="h-7 text-xs"
						>
							Usar estos datos
						</Button>
					</div>
					<div class="max-h-48 overflow-y-auto rounded-lg border border-border/50">
						<table class="w-full text-sm">
							<thead class="bg-secondary/30 text-muted-foreground">
								<tr>
									<th class="px-3 py-2 text-left font-medium">Día</th>
									<th class="px-3 py-2 text-left font-medium">Talla (mm)</th>
									<th class="px-3 py-2 text-right font-medium">Acciones</th>
								</tr>
							</thead>
							<tbody>
								{#each medicionesCargadas as medicion}
									<tr class="border-t border-border/30">
										<td class="px-3 py-2">{medicion.dia}</td>
										<td class="px-3 py-2">{medicion.talla.toFixed(1)}</td>
										<td class="px-3 py-2 text-right">
											<Button
												variant="ghost"
												size="sm"
												onclick={() => eliminarMedicionCargada(medicion.dia)}
												class="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
											>
												Eliminar
											</Button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}
		</div>

		<!-- Separador -->
		<div class="relative">
			<div class="absolute inset-0 flex items-center">
				<div class="w-full border-t border-border/30"></div>
			</div>
			<div class="relative flex justify-center">
				<span class="bg-background px-2 text-xs text-muted-foreground">O ingresa manualmente</span>
			</div>
		</div>

		<!-- Formulario de nuevo punto (manual) -->
		<div class="flex flex-col gap-4 sm:flex-row">
			<div class="flex-1 space-y-2">
				<Label
					for="nuevo-dia"
					class="text-xs font-medium tracking-wider text-muted-foreground uppercase"
				>
					Día
				</Label>
				<Input
					id="nuevo-dia"
					type="number"
					placeholder="Ej: 0, 30, 60..."
					bind:value={nuevoDia}
					onkeydown={handleKeydown}
					min="0"
					class="h-11 rounded-xl border-border/50 bg-secondary/50 transition-all focus:border-ocean-light focus:ring-ocean-light/20"
				/>
			</div>
			<div class="flex-1 space-y-2">
				<Label
					for="nueva-talla"
					class="text-xs font-medium tracking-wider text-muted-foreground uppercase"
				>
					Talla (mm)
				</Label>
				<Input
					id="nueva-talla"
					type="number"
					step="0.1"
					placeholder="Ej: 25.5"
					bind:value={nuevaTalla}
					onkeydown={handleKeydown}
					min="0"
					max="200"
					class="h-11 rounded-xl border-border/50 bg-secondary/50 transition-all focus:border-ocean-light focus:ring-ocean-light/20"
				/>
			</div>
			<div class="flex items-end">
				<Button
					onclick={agregarPunto}
					disabled={nuevoDia === '' || nuevaTalla === ''}
					class="h-11 rounded-xl bg-ocean-mid hover:bg-ocean-light"
				>
					Agregar
				</Button>
			</div>
		</div>

		<!-- Error message -->
		{#if error}
			<p class="text-sm text-destructive">{error}</p>
		{/if}

		<!-- Lista de puntos -->
		{#if dias.length > 0}
			<div class="space-y-2">
				<Label class="text-xs font-medium tracking-wider text-muted-foreground uppercase">
					Datos ingresados ({dias.length})
				</Label>
				<div class="max-h-48 overflow-y-auto rounded-lg border border-border/50">
					<table class="w-full text-sm">
						<thead class="bg-secondary/30 text-muted-foreground">
							<tr>
								<th class="px-3 py-2 text-left font-medium">Día</th>
								<th class="px-3 py-2 text-left font-medium">Talla (mm)</th>
								<th class="px-3 py-2 text-right font-medium">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{#each dias as dia, i}
								<tr class="border-t border-border/30">
									<td class="px-3 py-2">{dia}</td>
									<td class="px-3 py-2">{tallas[i].toFixed(1)}</td>
									<td class="px-3 py-2 text-right">
										<Button
											variant="ghost"
											size="sm"
											onclick={() => onEliminarPunto(dia)}
											class="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
										>
											Eliminar
										</Button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}

		<!-- Configuración de proyección -->
		<div class="flex flex-col gap-4 sm:flex-row">
			<div class="flex-1 space-y-2">
				<Label
					for="talla-objetivo"
					class="text-xs font-medium tracking-wider text-muted-foreground uppercase"
				>
					Talla objetivo (mm) - Opcional
				</Label>
				<Input
					id="talla-objetivo"
					type="number"
					step="0.1"
					placeholder="Ej: 80"
					bind:value={tallaObjetivo}
					min="0"
					max="200"
					class="h-11 rounded-xl border-border/50 bg-secondary/50 transition-all focus:border-ocean-light focus:ring-ocean-light/20"
				/>
			</div>
			<div class="flex items-end">
				<Button
					onclick={onEjecutarProyeccion}
					disabled={dias.length < 3 || cargando}
					class="h-11 rounded-xl bg-ocean-mid hover:bg-ocean-light"
				>
					{cargando ? 'Proyectando...' : 'Ejecutar Proyección'}
				</Button>
			</div>
		</div>
	</Card.Content>
</Card.Root>
