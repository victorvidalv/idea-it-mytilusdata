<script lang="ts">
	import { browser } from '$app/environment';
	import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from '$lib/components/map-utils';

	interface Props {
		latitude?: number | null;
		longitude?: number | null;
		onSelect: (coords: { lat: string; lng: string }) => void;
	}

	let { latitude, longitude, onSelect }: Props = $props();

	let showMap = $state(false);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let MapComponent: any = $state(null);

	// Valores derivados para coordenadas por defecto
	let mapLat = $derived(latitude ?? DEFAULT_LATITUDE);
	let mapLng = $derived(longitude ?? DEFAULT_LONGITUDE);

	function handleMapSelect(coords: { lat: number; lng: number }) {
		onSelect({ lat: coords.lat.toFixed(6), lng: coords.lng.toFixed(6) });
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
			<MapComponent
				height="280px"
				latitude={mapLat}
				longitude={mapLng}
				onselect={handleMapSelect}
			/>
			<p class="mt-1.5 font-body text-[11px] text-muted-foreground">
				Haga clic en el mapa para seleccionar coordenadas
			</p>
		</div>
	{/if}
</div>