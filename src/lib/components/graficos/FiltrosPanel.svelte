<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { Centro, Ciclo, TipoRegistro, Usuario } from './types';

	export let isInvestigador: boolean = false;
	export let usuarios: Usuario[] | undefined = undefined;

	export let selectedUserId: string;
	export let selectedCentroId: number;
	export let selectedCicloId: number;
	export let selectedTipoIds: Set<number>;

	export let centrosFiltrados: Centro[];
	export let ciclosFiltrados: Ciclo[];
	export let tipos: TipoRegistro[];
	export let getColorForTipo: (tipoId: number) => string;

	function toggleTipo(tipoId: number) {
		if (selectedTipoIds.has(tipoId)) {
			selectedTipoIds.delete(tipoId);
		} else {
			selectedTipoIds.add(tipoId);
		}
		selectedTipoIds = selectedTipoIds;
	}
</script>

<div class="space-y-6">
	<!-- Encabezado con selector de usuario (solo investigador) -->
	<div class="animate-fade-up flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
		<div>
			<p class="mb-2 font-body text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
				{isInvestigador ? 'Área Investigador' : 'Análisis Visual'}
			</p>
			<h1 class="font-display text-3xl leading-tight text-foreground md:text-4xl">
				{#if isInvestigador}
					Análisis y <span class="text-gradient-ocean">Gráficos Globales</span>
				{:else}
					<span class="text-gradient-ocean">Gráficos</span> de Datos
				{/if}
			</h1>
			<p class="mt-2 font-body text-sm text-muted-foreground">
				{#if isInvestigador}
					Visualiza la evolución de las mediciones filtradas por usuario a lo largo del tiempo
				{:else}
					Visualiza la evolución de tus mediciones a lo largo del tiempo
				{/if}
			</p>
		</div>
		<div class="sm:self-end">
			{#if isInvestigador && usuarios}
					<select
						bind:value={selectedUserId}
						class="w-full rounded-xl border border-border bg-background px-4 py-2 font-body text-sm text-foreground focus:border-teal-glow focus:ring-1 focus:ring-teal-glow focus:outline-none sm:w-64"
					>
						<option value="">Selecciona un Usuario</option>
						<option value="all">Todos los Usuarios</option>
						{#each usuarios as usr (usr.id)}
							<option value={usr.id.toString()}>{usr.nombre}</option>
						{/each}
					</select>
				{/if}
		</div>
	</div>

	<!-- Panel de Filtros Secundario -->
	<div class="animate-fade-up delay-75">
		<Card.Root class="border-border/50">
			<Card.Header class="pb-4">
				<Card.Title class="font-display text-lg">
					{isInvestigador ? 'Sub-filtros Espaciales/Técnicos' : 'Filtros'}
				</Card.Title>
				<Card.Description class="font-body text-xs">
					{isInvestigador
						? 'Restringe los datos del usuario seleccionado por centro, ciclo y tipos'
						: 'Selecciona centro, ciclo y tipos de registro para visualizar'}
				</Card.Description>
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
							<option value={0}>Todos los centros</option>
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
							<option value={0}>Todos los ciclos</option>
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
							{#each tipos as tipo (tipo.id)}
								<button
									type="button"
									class="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-body text-xs font-medium transition-all duration-200 {selectedTipoIds.has(tipo.id)
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
</div>