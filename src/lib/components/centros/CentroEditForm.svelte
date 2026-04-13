<script lang="ts">
	import { enhance } from '$app/forms';
	import { browser } from '$app/environment';

	export let centro: {
		id: number;
		nombre: string;
		latitud?: number | null;
		longitud?: number | null;
	};
	export let onCancel: () => void;
	export let onSuccess: (msg: string) => void;
	export let onError: (msg: string) => void;

	let editNombre = centro.nombre;
	let editLat = centro.latitud?.toString() ?? '';
	let editLng = centro.longitud?.toString() ?? '';
	let showMap = false;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let MapComponent: any = null;

	function handleMapSelect(coords: { lat: number; lng: number }) {
		const lat = Math.round(coords.lat * 10000) / 10000;
		const lng = Math.round(coords.lng * 10000) / 10000;
		editLat = lat.toString();
		editLng = lng.toString();
	}

	function toggleMap() {
		showMap = !showMap;
		if (showMap && browser && !MapComponent) {
			import('$lib/components/MapLibreMap.svelte').then((mod) => {
				MapComponent = mod.default;
			});
		}
	}
</script>

<tr class="border-b border-border/20 bg-ocean-light/[0.03]">
	<td colspan="6" class="px-4 py-3">
		<form
			method="POST"
			action="?/update"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						// @ts-expect-error - message comes from action result
						onSuccess(result.data?.message || 'Centro actualizado');
						showMap = false;
					} else if (result.type === 'failure') {
						// @ts-expect-error - message comes from action result
						onError(result.data?.message || 'Error al actualizar');
					}
					await update();
				};
			}}
			class="space-y-3"
		>
			<input type="hidden" name="centroId" value={centro.id} />
			<div class="flex flex-wrap items-end gap-3">
				<div class="min-w-[150px] flex-1 space-y-1">
					<label
						for="edit-nombre-{centro.id}"
						class="block text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
						>Nombre</label
					>
					<input
						id="edit-nombre-{centro.id}"
						name="nombre"
						type="text"
						bind:value={editNombre}
						required
						class="h-9 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
					/>
				</div>
				<div class="w-28 space-y-1">
					<label
						for="edit-lat-{centro.id}"
						class="block text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
						>Latitud</label
					>
					<input
						id="edit-lat-{centro.id}"
						name="latitud"
						type="text"
						bind:value={editLat}
						placeholder="-41.4689"
						class="h-9 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm tabular-nums focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
					/>
				</div>
				<div class="w-28 space-y-1">
					<label
						for="edit-lng-{centro.id}"
						class="block text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
						>Longitud</label
					>
					<input
						id="edit-lng-{centro.id}"
						name="longitud"
						type="text"
						bind:value={editLng}
						placeholder="-72.9411"
						class="h-9 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm tabular-nums focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
					/>
				</div>
				<div class="flex gap-1.5">
					<button
						type="submit"
						class="h-9 rounded-lg bg-ocean-mid px-3 font-body text-xs font-medium text-white transition-all hover:bg-ocean-deep"
						>Guardar</button
					>
					<button
						type="button"
						onclick={onCancel}
						class="h-9 rounded-lg border border-border/60 px-3 font-body text-xs transition-all hover:bg-secondary"
						>Cancelar</button
					>
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
						<svelte:component
							this={MapComponent}
							height="280px"
							latitude={centro.latitud ?? -41.4689}
							longitude={centro.longitud ?? -72.9411}
							onselect={handleMapSelect}
						/>
						<p class="mt-1.5 font-body text-[11px] text-muted-foreground">
							Haga clic en el mapa para seleccionar coordenadas
						</p>
					</div>
				{/if}
			</div>
		</form>
	</td>
</tr>