<!--
Página de proyección de crecimiento para usuarios autenticados.
Permite al usuario ingresar sus datos y proyectar el crecimiento
mediante modelos predictivos externos.
-->
<script lang="ts">
	import ProyeccionPanel from '$lib/components/calculo-sigmoides-similares/ProyeccionPanel.svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Estado de conexión con API
	let apiStatus = $state<'checking' | 'online' | 'degraded' | 'offline'>('checking');
	let modelosCount = $state<number | null>(null);

	onMount(() => {
		checkApiStatus();
	});

	async function checkApiStatus() {
		try {
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 5000);
			const res = await fetch('/api/proyectar/models', {
				signal: controller.signal,
				credentials: 'include'
			});
			clearTimeout(timeout);
			if (res.ok) {
				const data = await res.json();
				modelosCount = data.modelos?.length ?? null;
				apiStatus = 'online';
			} else {
				apiStatus = 'degraded';
			}
		} catch {
			apiStatus = 'offline';
		}
	}

	const statusConfig = {
		checking: { label: 'Verificando...', color: 'bg-slate-400', text: 'text-slate-500' },
		online: { label: 'Conectado', color: 'bg-emerald-500', text: 'text-emerald-600' },
		degraded: { label: 'Degradado', color: 'bg-amber-500', text: 'text-amber-600' },
		offline: { label: 'Sin conexión', color: 'bg-rose-500', text: 'text-rose-600' }
	};
</script>

<svelte:head>
	<title>Proyectar Crecimiento | MytilusData</title>
</svelte:head>

<div class="space-y-6">
	<!-- Encabezado -->
	<div class="animate-fade-up flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
		<div>
			<p
				class="mb-2 font-body text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase"
			>
				Análisis
			</p>
			<h1 class="font-display text-3xl leading-tight text-foreground md:text-4xl">
				Proyectar <span class="text-gradient-ocean">Crecimiento</span>
			</h1>
			<p class="mt-2 font-body text-sm text-muted-foreground">
				Ingresa al menos cinco mediciones día-talla para proyectar el crecimiento
				mediante modelos predictivos y visualizar el rango esperado.
			</p>
		</div>
		<div class="flex flex-col items-end gap-1.5">
			<div class="flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-3 py-1.5">
				<span class="h-2 w-2 rounded-full {statusConfig[apiStatus].color} animate-pulse"></span>
				<span class="text-xs font-medium {statusConfig[apiStatus].text}">
					{statusConfig[apiStatus].label}
				</span>
			</div>
			{#if modelosCount !== null && apiStatus === 'online'}
				<p class="text-[10px] text-muted-foreground">
					{modelosCount} {modelosCount === 1 ? 'modelo' : 'modelos'} disponibles
				</p>
			{/if}
		</div>
	</div>

	<div>
		<ProyeccionPanel lugares={data.lugares} ciclos={data.ciclos} />
	</div>
</div>
