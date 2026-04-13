<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import toast from 'svelte-french-toast';
	import KeyIcon from '@lucide/svelte/icons/key';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';

	export let loadingGenerate: boolean;
	export let onLoadingChange: (loading: boolean) => void;
</script>

<div
	class="flex flex-col items-center justify-center space-y-4 rounded-xl border border-dashed border-border p-6 text-center"
>
	<div class="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50">
		<KeyIcon class="h-8 w-8 text-muted-foreground" />
	</div>
	<div>
		<h3 class="text-lg font-medium">No tienes ninguna API Key activa</h3>
		<p class="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
			Genera una llave nueva para empezar a utilizar las integraciones de la plataforma.
		</p>
	</div>
	<form
		method="POST"
		action="?/generar"
		use:enhance={() => {
			onLoadingChange(true);
			return async ({ result, update }) => {
				if (result.type === 'success') {
					toast.success('API Key generada correctamente');
				} else if (result.type === 'failure') {
					toast.error('Error: ' + (result.data?.message || 'No se pudo generar.'));
				}
				await update();
				onLoadingChange(false);
			};
		}}
	>
		<Button
			type="submit"
			class="mt-2 h-11 rounded-xl bg-ocean-mid px-6 text-white hover:bg-ocean-deep"
			disabled={loadingGenerate}
		>
			{#if loadingGenerate}
				<RefreshCwIcon class="mr-2 h-4 w-4 animate-spin" />
				Generando...
			{:else}
				<KeyIcon class="mr-2 h-4 w-4" />
				Generar API Key
			{/if}
		</Button>
	</form>
</div>