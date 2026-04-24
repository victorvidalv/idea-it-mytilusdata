<!--
Componente de animación de carga para extracción de mediciones.
Muestra un mensaje de carga sencillo con el mismo estilo visual que la proyección.
-->
<script lang="ts">
	import { fade, fly } from 'svelte/transition';

	interface Props {
		visible: boolean;
	}

	let { visible }: Props = $props();
</script>

{#if visible}
	<!-- Overlay oscuro semitransparente con efecto glass -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
		transition:fade={{ duration: 300 }}
		role="status"
		aria-live="polite"
		aria-label="Extrayendo mediciones"
	>
		<!-- Popup card moderno -->
		<div
			class="relative w-[340px] max-w-[90vw] overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-ocean-deep/95 via-ocean-mid/95 to-ocean-light/95 p-8 shadow-[0_0_50px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl"
			in:fly={{ y: 20, duration: 400, delay: 100 }}
			out:fade={{ duration: 300 }}
		>
			<!-- Efecto de brillo de fondo animado -->
			<div class="pointer-events-none absolute -inset-[100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(255,255,255,0.15)_360deg)]"></div>
			
			<div class="relative z-10 flex flex-col items-center">
				<!-- Icono central con anillos vibrantes -->
				<div class="relative mb-8 flex h-20 w-20 items-center justify-center">
					<!-- Anillos giratorios -->
					<svg class="absolute inset-0 h-full w-full animate-[spin_3s_linear_infinite] text-white/30" viewBox="0 0 100 100">
						<circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="10 10" />
					</svg>
					<svg class="absolute inset-1 h-[calc(100%-8px)] w-[calc(100%-8px)] animate-[spin_2s_linear_infinite_reverse] text-white/50" viewBox="0 0 100 100">
						<circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="40 20" stroke-linecap="round" />
					</svg>

					<!-- Contenedor estático del icono -->
					<div class="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-tr from-ocean-deep to-ocean-light shadow-inner">
						<svg
							class="h-8 w-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] animate-pulse"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="7 10 12 15 17 10" />
							<line x1="12" y1="15" x2="12" y2="3" />
						</svg>
					</div>
				</div>

				<!-- Mensaje animado que ocupa un espacio fijo -->
				<div class="relative flex h-14 w-full items-center justify-center overflow-hidden">
					<p
						class="text-center text-lg font-medium tracking-wide text-white drop-shadow-md"
					>
						Extrayendo las mediciones del ciclo...
					</p>
				</div>
				
				<!-- Barra de progreso simple estilo indeterminada -->
				<div class="mt-4 w-24 h-1.5 overflow-hidden rounded-full bg-white/10 relative">
					<div class="absolute top-0 bottom-0 left-0 right-[50%] bg-white/80 rounded-full animate-bounce-x shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes bounce-x {
		0%, 100% { transform: translateX(-100%); }
		50% { transform: translateX(200%); }
	}
	.animate-bounce-x {
		animation: bounce-x 1.5s ease-in-out infinite;
	}
</style>
