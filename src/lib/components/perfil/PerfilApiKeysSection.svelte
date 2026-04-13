<script lang="ts">
	import { Button } from '$lib/components/ui/button';
</script>

<section class="rounded-2xl border border-border/50 bg-card p-6 shadow-sm sm:p-8">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h2 class="flex items-center gap-2 text-xl font-semibold">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="text-ocean-mid"
				>
					<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
					<path d="m21 2-9.6 9.6" />
					<circle cx="7.5" cy="15.5" r="5.5" />
				</svg>
				Acceso por API
			</h2>
			<p class="mt-1 text-sm text-muted-foreground">
				Genera y administra tu clave de acceso para conectar aplicaciones externas.
			</p>
		</div>
	</div>

	<Button
		href="/perfil/api-keys"
		class="h-11 rounded-xl bg-ocean-mid font-medium text-white transition-all hover:bg-ocean-deep"
	>
		Administrar API Keys
	</Button>
</section>