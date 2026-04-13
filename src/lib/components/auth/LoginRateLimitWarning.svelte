<script lang="ts">
	export let message: string | undefined;
	export let remainingSeconds: number | undefined;
</script>

<div class="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
	<div class="flex items-start gap-3">
		<svg
			class="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
		<div>
			<p class="mb-1 text-sm font-medium text-foreground">Espera un momento</p>
			<p class="text-xs leading-relaxed text-muted-foreground">
				{message ||
					'Demasiados intentos. Por favor, espera antes de intentar nuevamente.'}
			</p>
			{#if remainingSeconds}
				<p class="mt-2 text-xs font-medium text-amber-500">
					Tiempo restante: {remainingSeconds} segundos
				</p>
			{/if}
		</div>
	</div>
</div>