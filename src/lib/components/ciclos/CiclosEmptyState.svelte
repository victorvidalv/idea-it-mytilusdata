<script lang="ts">
	import * as Card from '$lib/components/ui/card';
</script>

<div class="animate-fade-up delay-150">
	<Card.Root class="border-dashed border-border/50">
		<Card.Content class="flex flex-col items-center justify-center py-16">
			<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-glow/10">
				<svg class="h-8 w-8 text-teal-glow/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
			</div>
			<p class="mb-1 font-body text-sm font-medium text-foreground">Sin ciclos productivos</p>
			<p class="font-body text-xs text-muted-foreground">Inicie su primer ciclo de cultivo</p>
		</Card.Content>
	</Card.Root>
</div>