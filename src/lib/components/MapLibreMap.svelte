<script lang="ts">
	import type { Map as MapLibreMapType } from 'maplibre-gl';
	import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE, getInitialMarkerPosition } from './map-utils';
	import MapContainer from './MapContainer.svelte';

	let {
		latitude = DEFAULT_LATITUDE,
		longitude = DEFAULT_LONGITUDE,
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

	// Referencia al mapa
	let mapInstance: MapLibreMapType | null = $state(null);

	// Coordenadas iniciales del marcador
	let initialPosition = $derived(getInitialMarkerPosition(latitude, longitude));
</script>

<div
	class="map-container overflow-hidden rounded-xl border border-border/40"
	style="height:{height};min-height:{height};width:100%;position:relative;z-index:0;background:#e8e8e8;"
>
	<MapContainer
		{latitude}
		{longitude}
		{zoom}
		{readonly}
		{markers}
		{onselect}
		onmapready={(map) => (mapInstance = map)}
	/>
</div>

<style>
	:global(.map-container .maplibregl-ctrl-attrib) {
		font-size: 10px;
	}
</style>