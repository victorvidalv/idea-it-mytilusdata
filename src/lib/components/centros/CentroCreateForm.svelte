<script lang="ts">
	import { enhance } from '$app/forms';
	import { browser } from '$app/environment';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';

	export let onCancel: () => void;
	export let onSuccess: (message: string) => void;
	export let onError: (message: string) => void;

	// Estado del formulario de creación
	let newNombre = '';
	let newLat = '';
	let newLng = '';
	let showMap = false;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let MapComponent: any = null;

	function handleMapSelect(coords: { lat: number; lng: number }) {
		const lat = Math.round(coords.lat * 10000) / 10000;
		const lng = Math.round(coords.lng * 10000) / 10000;
		newLat = lat.toString();
		newLng = lng.toString();
	}

	function toggleMap() {
		showMap = !showMap;
		if (showMap && browser && !MapComponent) {
			// Importar el componente MapLibre dinámicamente
			import('$lib/components/MapLibreMap.svelte').then((mod) => {
				MapComponent = mod.default;
			});
		}
	}
</script>

<div class="animate-fade-up">
	<Card.Root class="border-border/50">
		<Card.Content class="pt-6">
			<form
				method="POST"
				action="?/create"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success') {
							// @ts-expect-error - message comes from action result
							onSuccess(result.data?.message || 'Centro creado');
							newNombre = '';
							newLat = '';
							newLng = '';
							showMap = false;
						} else if (result.type === 'failure') {
							// @ts-expect-error - message comes from action result
							onError(result.data?.message || 'Ocurrió un error');
						}
						await update();
					};
				}}
				class="space-y-4"
			>
				<div class="grid gap-4 sm:grid-cols-3">
					<div class="space-y-1.5">
						<label
							for="new-nombre"
							class="block font-body text-xs font-medium tracking-wider text-muted-foreground uppercase"
							>Nombre</label
						>
						<input
							id="new-nombre"
							name="nombre"
							type="text"
							bind:value={newNombre}
							placeholder="Ej: Centro Calbuco Norte"
							required
							class="h-10 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm transition-all focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
						/>
					</div>
					<div class="space-y-1.5">
						<label
							for="new-lat"
							class="block font-body text-xs font-medium tracking-wider text-muted-foreground uppercase"
							>Latitud</label
						>
						<input
							id="new-lat"
							name="latitud"
							type="text"
							bind:value={newLat}
							placeholder="-41.4689"
							class="h-10 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm tabular-nums transition-all focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
						/>
					</div>
					<div class="space-y-1.5">
						<label
							for="new-lng"
							class="block font-body text-xs font-medium tracking-wider text-muted-foreground uppercase"
							>Longitud</label
						>
						<input
							id="new-lng"
							name="longitud"
							type="text"
							bind:value={newLng}
							placeholder="-72.9411"
							class="h-10 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm tabular-nums transition-all focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
						/>
					</div>
				</div>

				<!-- Botón para mostrar mapa -->
				<div>
					<button
						type="button"
						onclick={toggleMap}
						class="inline-flex items-center gap-1.5 font-body text-xs text-ocean-light transition-colors hover:text-ocean-mid"
					>
						<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
							/>
						</svg>
						{showMap ? 'Ocultar mapa' : 'Seleccionar desde mapa'}
					</button>

					{#if showMap && MapComponent}
						<div class="mt-3">
							<svelte:component this={MapComponent} height="280px" onselect={handleMapSelect} />
							<p class="mt-1.5 font-body text-[11px] text-muted-foreground">
								Haga clic en el mapa para seleccionar coordenadas
							</p>
						</div>
					{/if}
				</div>

				<div class="flex justify-end gap-2 pt-1">
					<Button
						type="button"
						variant="outline"
						onclick={onCancel}
						class="h-9 rounded-lg font-body text-xs"
					>
						Cancelar
					</Button>
					<button
						type="submit"
						disabled={!newNombre.trim()}
						class="h-9 rounded-lg bg-ocean-mid px-4 font-body text-xs font-medium text-white transition-all hover:bg-ocean-deep disabled:cursor-not-allowed disabled:opacity-50"
					>
						Guardar
					</button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
