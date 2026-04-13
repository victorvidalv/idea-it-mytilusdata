<script lang="ts">
	import { Button } from '$lib/components/ui/button';
</script>

<section class="rounded-2xl border border-border/50 bg-card p-6 shadow-sm sm:p-8">
	<div class="mb-6">
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
				class="text-green-500"
			>
				<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
				<polyline points="14 2 14 8 20 8" />
				<path d="M8 13h2" />
				<path d="M8 17h2" />
				<path d="M14 13h2" />
				<path d="M14 17h2" />
			</svg>
			Descargar mis datos
		</h2>
		<p class="mt-1 text-sm text-muted-foreground">
			Genera y descarga un archivo Excel (.xlsx) con todo el historial de los centros de cultivo,
			ciclos productivos y registros bajo tu cuenta.
		</p>
	</div>

	<Button
		href="/api/export-data"
		target="_blank"
		variant="outline"
		class="h-11 rounded-xl border-border/50 bg-background font-medium transition-all hover:bg-muted"
	>
		Descargar Archivo Excel
	</Button>
</section>