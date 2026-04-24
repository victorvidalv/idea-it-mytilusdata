<!--
Componente de animación de carga para proyecciones.
Refactorizado para reducir complejidad ciclomática.
-->
<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fade, fly } from 'svelte/transition';
    import { MENSAJES_LOADER, DURACION_MINIMA_LOADER, INTERVALO_MENSAJE, scrollToResults } from './ProyeccionLoaderActions';

	interface Props {
		visible: boolean;
	}

	let { visible }: Props = $props();

	let mostrarLoader = $state(false);
	let indiceMensaje = $state(0);
	let timeoutId: ReturnType<typeof setTimeout> | undefined;
	let intervalId: ReturnType<typeof setInterval> | undefined;
	let startTime = 0;

	$effect(() => {
		if (visible) {
			iniciarLoader();
		} else if (mostrarLoader) {
			detenerLoader();
		}
	});

    function iniciarLoader() {
        mostrarLoader = true;
        indiceMensaje = 0;
        startTime = Date.now();
        limpiarTimers();
        intervalId = setInterval(() => {
            if (indiceMensaje < MENSAJES_LOADER.length - 1) indiceMensaje++;
            else clearInterval(intervalId);
        }, INTERVALO_MENSAJE);
    }

    function detenerLoader() {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, DURACION_MINIMA_LOADER - elapsed);
        timeoutId = setTimeout(() => {
            mostrarLoader = false;
            limpiarTimers();
            setTimeout(scrollToResults, 50);
        }, remaining);
    }

    function limpiarTimers() {
        if (timeoutId) clearTimeout(timeoutId);
        if (intervalId) clearInterval(intervalId);
        timeoutId = undefined;
        intervalId = undefined;
    }

	onDestroy(limpiarTimers);
</script>

{#if mostrarLoader}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md" transition:fade={{ duration: 300 }} role="status">
		<div class="relative w-[340px] max-w-[90vw] overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-ocean-deep/95 via-ocean-mid/95 to-ocean-light/95 p-8 shadow-[0_0_50px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl" in:fly={{ y: 20, duration: 400, delay: 100 }} out:fade={{ duration: 300 }}>
			<div class="pointer-events-none absolute -inset-[100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(255,255,255,0.15)_360deg)]"></div>
			
			<div class="relative z-10 flex flex-col items-center">
				<div class="relative mb-8 flex h-20 w-20 items-center justify-center">
					<svg class="absolute inset-0 h-full w-full animate-[spin_3s_linear_infinite] text-white/30" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="10 10" /></svg>
					<svg class="absolute inset-1 h-[calc(100%-8px)] w-[calc(100%-8px)] animate-[spin_2s_linear_infinite_reverse] text-white/50" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="40 20" stroke-linecap="round" /></svg>
					<svg class="absolute inset-3 h-[calc(100%-24px)] w-[calc(100%-24px)] animate-[spin_1.5s_linear_infinite] text-white" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="80 100" stroke-linecap="round" /></svg>
					<div class="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-tr from-ocean-deep to-ocean-light shadow-inner">
						<svg class="h-8 w-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path class="animate-pulse" d="M3 3v18h18" /><path class="animate-pulse" style="animation-delay: 200ms;" d="M18 9l-5 5" /><path class="animate-pulse" style="animation-delay: 400ms;" d="M13 14l-4-4" /><path class="animate-pulse" style="animation-delay: 600ms;" d="M9 10l-3 3" /></svg>
					</div>
				</div>

				<div class="relative flex h-14 w-full items-center justify-center overflow-hidden">
					{#key indiceMensaje}<p in:fly={{ y: 20, duration: 400, delay: 100 }} out:fade={{ duration: 150 }} class="absolute text-center text-lg font-medium tracking-wide text-white drop-shadow-md">{MENSAJES_LOADER[indiceMensaje]}</p>{/key}
				</div>

				<div class="mt-4 flex w-full justify-center gap-2">
					{#each MENSAJES_LOADER as _, i}
						<div class="relative h-1.5 w-full max-w-[48px] overflow-hidden rounded-full bg-white/10">
							<div class="absolute left-0 top-0 h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" style="width: {i < indiceMensaje ? '100%' : i === indiceMensaje ? '100%' : '0%'}" class:animate-progress={i === indiceMensaje}></div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	:global(.animate-progress) { animation: fill-progress 1s linear forwards !important; }
	@keyframes fill-progress { 0% { width: 0%; } 100% { width: 100%; } }
</style>
