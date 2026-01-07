<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

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

	let mapContainer: HTMLDivElement;
	let map: any = null;
	let selectedMarker: any = null;
	let L: any = null;

	onMount(async () => {
		// Importar Leaflet
		const leafletModule = await import('leaflet');
		L = leafletModule.default || leafletModule;

		// Cargar CSS: intentar múltiples formas
		const cssId = 'leaflet-global-css';
		if (!document.getElementById(cssId)) {
			try {
				// Intentar import de CSS local (Vite lo maneja)
				await import('leaflet/dist/leaflet.css');
			} catch {
				// Fallback: cargar desde CDN
				const link = document.createElement('link');
				link.id = cssId;
				link.rel = 'stylesheet';
				link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
				link.crossOrigin = '';
				document.head.appendChild(link);
				await new Promise(r => setTimeout(r, 300));
			}
		}

		// Crear mapa
		map = L.map(mapContainer, {
			center: [latitude, longitude],
			zoom: zoom,
			zoomControl: true,
			attributionControl: true
		});

		// Tiles - CartoDB Voyager (claro)
		L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
			subdomains: 'abcd',
			maxZoom: 20
		}).addTo(map);

		// Icono personalizado
		const makeIcon = (size: number = 22) => L.divIcon({
			className: '',
			html: `<div style="width:${size}px;height:${size}px;background:linear-gradient(135deg,#2980b9,#16a085);border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>`,
			iconSize: [size, size],
			iconAnchor: [size/2, size/2]
		});

		// Marcador inicial si tiene posición válida
		if (latitude !== -41.4689 || longitude !== -72.9411) {
			selectedMarker = L.marker([latitude, longitude], {
				icon: makeIcon(),
				draggable: !readonly
			}).addTo(map);

			if (!readonly) {
				selectedMarker.on('dragend', () => {
					const pos = selectedMarker.getLatLng();
					onselect?.({ lat: pos.lat, lng: pos.lng });
				});
			}
		}

		// Marcadores adicionales
		if (markers.length > 0) {
			const bounds: any[] = [];
			markers.forEach(m => {
				const mk = L.marker([m.lat, m.lng], { icon: makeIcon(16) }).addTo(map);
				if (m.label) mk.bindPopup(m.label);
				bounds.push([m.lat, m.lng]);
			});
			if (bounds.length > 1) {
				map.fitBounds(bounds, { padding: [30, 30] });
			}
		}

		// Click para seleccionar ubicación
		if (!readonly) {
			map.on('click', (e: any) => {
				const { lat, lng } = e.latlng;
				if (selectedMarker) {
					selectedMarker.setLatLng([lat, lng]);
				} else {
					selectedMarker = L.marker([lat, lng], {
						icon: makeIcon(),
						draggable: true
					}).addTo(map);
					selectedMarker.on('dragend', () => {
						const pos = selectedMarker.getLatLng();
						onselect?.({ lat: pos.lat, lng: pos.lng });
					});
				}
				onselect?.({ lat, lng });
			});
		}

		// Forzar recálculo del tamaño del mapa (crítico para contenedores ocultos)
		const fixSize = () => { if (map) map.invalidateSize(); };
		setTimeout(fixSize, 100);
		setTimeout(fixSize, 300);
		setTimeout(fixSize, 600);
		setTimeout(fixSize, 1200);

		// Observer para cuando el contenedor cambie de tamaño
		const observer = new ResizeObserver(fixSize);
		observer.observe(mapContainer);
		
		return () => observer.disconnect();
	});

	onDestroy(() => {
		if (map) {
			map.remove();
			map = null;
		}
	});
</script>

<div
	bind:this={mapContainer}
	style="height:{height};min-height:{height};width:100%;position:relative;z-index:0;background:#e8e8e8;"
	class="rounded-xl overflow-hidden border border-border/40"
></div>
