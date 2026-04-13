<script lang="ts">
	import { Button } from '$lib/components/ui/button';
</script>

<div
	class="animate-fade-up flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center"
>
	<div class="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
		<svg class="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
			/>
		</svg>
	</div>
	<div>
		<h2 class="font-display text-xl font-medium text-foreground">Acceso Denegado</h2>
		<p class="mx-auto mt-2 max-w-[300px] font-body text-sm text-muted-foreground">
			Solo los administradores tienen acceso a la configuración técnica del sistema.
		</p>
	</div>
	<Button href="/dashboard" variant="outline" class="mt-4 rounded-xl font-body text-sm">
		Volver al Inicio
	</Button>
</div>