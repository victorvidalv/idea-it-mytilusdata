<script lang="ts">
	/**
	 * Componente presentacional para mostrar estado vacío en gráficos de evolución.
	 * Muestra un SVG decorativo con líneas horizontales, icono de gráfico y mensajes
	 * contextuales según el rol del usuario.
	 */
	export let isInvestigador: boolean = false;
</script>

<div
	class="relative flex h-[400px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-border/50 bg-secondary/30"
>
	<!-- Patrón decorativo de líneas horizontales -->
	<div class="absolute inset-0 opacity-[0.03]">
		<svg width="100%" height="100%">
			{#each Array.from({ length: 8 }, (_, k) => k) as i (i)}
				<line
					x1="0"
					y1="{(i + 1) * 12.5}%"
					x2="100%"
					y2="{(i + 1) * 12.5}%"
					stroke="currentColor"
					stroke-width="1"
				/>
			{/each}
		</svg>
	</div>

	<!-- Contenido central -->
	<div class="relative z-10 text-center">
		<div
			class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-ocean-light/10"
		>
			<svg
				class="h-6 w-6 text-ocean-light/60"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
				/>
			</svg>
		</div>
		<p class="font-body text-sm text-muted-foreground">
			No hay datos para los filtros seleccionados
		</p>
		<p class="mt-1 font-body text-xs text-muted-foreground/60">
			{isInvestigador
				? 'Ajusta los filtros o selecciona otro usuario'
				: 'Ajusta los filtros o registra nuevas mediciones'}
		</p>
	</div>
</div>