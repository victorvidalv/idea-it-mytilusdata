<script lang="ts">
	import MapLibre from 'svelte-maplibre/MapLibre.svelte';
	import MapEvents from 'svelte-maplibre/MapEvents.svelte';
	import DefaultMarker from 'svelte-maplibre/DefaultMarker.svelte';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import type { LngLat, MapMouseEvent, Map as MapLibreMap } from 'maplibre-gl';

	let {
		latitude = -41.4689,
		longitude = -72.9411,
		zoom = 8,
		readonly = false,
		height = '360px',
		markers = [],
		onselect
	}: {
		latitude?: number;
		longitude?: number;
		zoom?: number;
		readonly?: boolean;
		height?: string;
		markers?: Array<{ lat: number; lng: number; label?: string }>;
		onselect?: (data: { lat: number; lng: number }) => void;
	} = $props();

	// Estado del marcador seleccionado
	let selectedLngLat: LngLat | null = $state(
		latitude !== -41.4689 || longitude !== -72.9411
			? { lng: longitude, lat: latitude } as LngLat
			: null
	);

	// Referencia al mapa
	let mapInstance: MapLibreMap | null = $state(null);

	function handleMapClick(e: MapMouseEvent) {
		if (readonly) return;

		selectedLngLat = e.lngLat;
		onselect?.({ lat: e.lngLat.lat, lng: e.lngLat.lng });
	}

	function handleMapLoad(map: MapLibreMap) {
		mapInstance = map;
		// Invalidar tamaño para asegurar renderizado correcto
		setTimeout(() => mapInstance?.resize(), 100);
		setTimeout(() => mapInstance?.resize(), 300);
	}

	// Sincronizar props con estado interno
	$effect(() => {
		if (latitude !== -41.4689 || longitude !== -72.9411) {
			selectedLngLat = { lng: longitude, lat: latitude } as LngLat;
		}
	});
</script>

<div
	class="map-container overflow-hidden rounded-xl border border-border/40"
	style="height:{height};min-height:{height};width:100%;position:relative;z-index:0;background:#e8e8e8;"
>
	<MapLibre
		center={[longitude, latitude]}
		{zoom}
		style="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
		standardControls
		class="h-full w-full"
		onload={handleMapLoad}
	>
		<MapEvents onclick={handleMapClick} />

		{#if selectedLngLat}
			<DefaultMarker lngLat={selectedLngLat} />
		{/if}

		{#each markers as marker}
			<DefaultMarker lngLat={{ lng: marker.lng, lat: marker.lat }} />
		{/each}
	</MapLibre>
</div>

<style>
	:global(.maplibregl-map) {
		font-family: inherit;
	}

	:global(.map-container .maplibregl-ctrl-attrib) {
		font-size: 10px;
	}
</style>