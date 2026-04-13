<script lang="ts">
	import { Button } from '$lib/components/ui/button';
</script>

<div
	class="animate-fade-up flex gap-3 rounded-xl border border-ocean-light/20 bg-ocean-light/10 p-4 text-ocean-light"
>
	<svg
		class="mt-0.5 h-5 w-5 flex-shrink-0"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
		/>
	</svg>
	<div>
		<p class="font-body text-sm font-medium">No puedes ingresar datos aún</p>
		<p class="mt-0.5 font-body text-xs opacity-80">
			Para ingresar registros o mediciones, primero debes configurar al menos un Centro en el
			sistema.
		</p>
		<div class="mt-3">
			<Button
				href="/centros"
				variant="outline"
				class="h-8 border-ocean-light/30 bg-transparent px-3 text-xs text-ocean-light hover:bg-ocean-light/10"
			>Ir a Centros de Cultivo</Button>
		</div>
	</div>
</div>