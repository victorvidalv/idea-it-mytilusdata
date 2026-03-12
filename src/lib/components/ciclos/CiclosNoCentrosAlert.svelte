<script lang="ts">
	import * as Card from '$lib/components/ui/card';
</script>

<div class="animate-fade-up">
	<Card.Root class="border-border/50 border-ocean-light/15 bg-ocean-light/[0.04]">
		<Card.Content class="flex items-start gap-3 py-4">
			<div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-ocean-light/15">
				<svg class="h-4 w-4 text-ocean-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			</div>
			<div>
				<p class="font-body text-sm font-medium text-foreground">Primero registre un centro</p>
				<p class="mt-0.5 font-body text-xs text-muted-foreground">
					Necesita al menos un centro de cultivo para poder crear ciclos productivos.
					<a href="/centros" class="text-ocean-light hover:underline">Ir a Centros →</a>
				</p>
			</div>
		</Card.Content>
	</Card.Root>
</div>