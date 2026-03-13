<script lang="ts">
	import MapLibre from 'svelte-maplibre/MapLibre.svelte';
	import MapEvents from 'svelte-maplibre/MapEvents.svelte';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import type { LngLat, Map as MapLibreMapType } from 'maplibre-gl';
	import { scheduleMapResize } from './map-utils';
	import MapMarkers from './MapMarkers.svelte';

	let {
		latitude,
		longitude,
		zoom = 8,
		readonly = false,
		markers = [],
		onselect,
		onmapready
	}: {
		latitude: number;
		longitude: number;
		zoom?: number;
		readonly?: boolean;
		markers?: Array<{ lat: number; lng: number; label?: string }>;
		onselect?: (data: { lat: number; lng: number }) => void;
		onmapready?: (map: MapLibreMapType) => void;
	} = $props();

	// Estado del marcador seleccionado
	let selectedLngLat: LngLat | null = $state(null);

	// Sincronizar lat/lng con marcador
	$effect(() => {
		selectedLngLat = latitude && longitude ? { lat: latitude, lng: longitude } : null;
	});
</script>

<MapLibre
	center={[longitude, latitude]}
	{zoom}
	style="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
	standardControls
	class="h-full w-full"
	onload={(map: MapLibreMapType) => {
		scheduleMapResize(map);
		onmapready?.(map);
	}}
>
	<MapEvents
		onclick={(e) => {
			if (readonly) return;
			selectedLngLat = e.lngLat;
			onselect?.({ lat: e.lngLat.lat, lng: e.lngLat.lng });
		}}
	/>
	<MapMarkers {selectedLngLat} {markers} />
</MapLibre>

<style>
	:global(.maplibregl-map) {
		font-family: inherit;
	}
</style>