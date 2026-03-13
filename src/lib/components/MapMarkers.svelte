<script lang="ts">
	import DefaultMarker from 'svelte-maplibre/DefaultMarker.svelte';
	import type { LngLat } from 'maplibre-gl';

	let {
		selectedLngLat = null,
		markers = []
	}: {
		selectedLngLat?: LngLat | null;
		markers?: Array<{ lat: number; lng: number; label?: string }>;
	} = $props();
</script>

{#if selectedLngLat}
	<DefaultMarker lngLat={selectedLngLat} />
{/if}

{#each markers as marker}
	<DefaultMarker lngLat={{ lng: marker.lng, lat: marker.lat }} />
{/each}