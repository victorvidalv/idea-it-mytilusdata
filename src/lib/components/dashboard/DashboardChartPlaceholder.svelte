<script lang="ts">
	import * as Card from '$lib/components/ui/card';
</script>

<Card.Root class="overflow-hidden border-border/50 md:col-span-4">
	<Card.Header>
		<div class="flex items-center justify-between">
			<div>
				<Card.Title class="font-display text-lg">Evolución de Talla / Biomasa</Card.Title>
				<Card.Description class="mt-1 font-body text-xs"
					>Curvas sigmoidales predictivas</Card.Description
				>
			</div>
			<div class="flex gap-2">
				<div class="flex items-center gap-1.5 font-body text-xs text-muted-foreground">
					<div class="h-2 w-2 rounded-full bg-ocean-light"></div>
					Talla
				</div>
				<div class="flex items-center gap-1.5 font-body text-xs text-muted-foreground">
					<div class="h-2 w-2 rounded-full bg-teal-glow"></div>
					Biomasa
				</div>
			</div>
		</div>
	</Card.Header>
	<Card.Content>
		<div
			class="relative flex h-[280px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-border/50 bg-secondary/30"
		>
			<div class="absolute inset-0 opacity-[0.03]">
				<svg width="100%" height="100%">
					{#each Array(8) as _, i (i)}
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
				<p class="font-body text-sm text-muted-foreground">Aún no hay datos suficientes</p>
				<p class="mt-1 font-body text-xs text-muted-foreground/60">
					Registre mediciones para ver proyecciones
				</p>
			</div>
		</div>
	</Card.Content>
</Card.Root>