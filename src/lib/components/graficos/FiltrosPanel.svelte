<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { Centro, Ciclo, TipoRegistro, Usuario } from './types';
	import FiltrosPanelHeader from './FiltrosPanelHeader.svelte';
	import TipoMedicionButton from './TipoMedicionButton.svelte';

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
	<FiltrosPanelHeader {isInvestigador} {usuarios} bind:selectedUserId />

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
								<TipoMedicionButton
									{tipo}
									isSelected={selectedTipoIds.has(tipo.id)}
									{getColorForTipo}
									onToggle={toggleTipo}
								/>
							{/each}
						</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>