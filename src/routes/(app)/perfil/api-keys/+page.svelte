<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import toast from 'svelte-french-toast';
	import KeyRoundIcon from '@lucide/svelte/icons/key-round';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import ApiKeyDisplay from './_components/ApiKeyDisplay.svelte';
	import ApiKeyEmptyState from './_components/ApiKeyEmptyState.svelte';
	import ApiInstructions from './_components/ApiInstructions.svelte';

	export let data: import('./$types').PageData;

	let loadingGenerate = false;
	let loadingRevoke = false;
	let isKeyVisible = false;

	function copyToClipboard() {
		if (data.apiKey) {
			navigator.clipboard.writeText(data.apiKey);
			toast.success('API Key copiada al portapapeles');
		}
	}

	function setLoadingGenerate(value: boolean) {
		loadingGenerate = value;
	}
</script>

<svelte:head>
	<title>API Keys | MytilusData</title>
</svelte:head>

<div class="animate-fade-in max-w-3xl space-y-8">
	<div class="mb-8">
		<h1 class="font-display text-3xl text-foreground">Acceso por API</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Genera y administra tu clave de acceso en formato API Key para consultar tus datos desde otras
			aplicaciones externas.
		</p>
	</div>

	<!-- Sección: API Key Actual -->
	<section class="rounded-2xl border border-border/50 bg-card p-6 shadow-sm sm:p-8">
		<div class="mb-6 flex items-center justify-between">
			<div>
				<h2 class="flex items-center gap-2 text-xl font-semibold">
					<KeyRoundIcon class="h-5 w-5 text-ocean-mid" />
					Tu API Key
				</h2>
				<p class="mt-1 text-sm text-muted-foreground">
					Usa esta clave para autenticar tus peticiones. Mantenla en secreto, cualquiera con esta
					clave podrá consultar tus ciclos y registros.
				</p>
			</div>
		</div>

		{#if data.apiKey}
			<div class="space-y-4">
				<ApiKeyDisplay
					apiKey={data.apiKey}
					isKeyVisible={isKeyVisible}
					onToggleVisibility={() => (isKeyVisible = !isKeyVisible)}
					onCopy={copyToClipboard}
				/>
				<div class="mt-5 flex items-center gap-4 border-t border-border/50 pt-5">
					<form
						method="POST"
						action="?/revocar"
						use:enhance={() => {
							loadingRevoke = true;
							return async ({ result, update }) => {
								if (result.type === 'success') {
									toast.success('Clave revocada exitosamente');
									isKeyVisible = false;
								} else if (result.type === 'failure') {
									toast.error('Error: ' + (result.data?.message || 'No se pudo revocar la clave.'));
								}
								await update();
								loadingRevoke = false;
							};
						}}
					>
						<Button
							type="submit"
							variant="destructive"
							class="h-10 rounded-lg text-sm"
							disabled={loadingRevoke || loadingGenerate}
						>
							{#if loadingRevoke}
								<RefreshCwIcon class="mr-2 h-4 w-4 animate-spin" />
								Revocando...
							{:else}
								<Trash2Icon class="mr-2 h-4 w-4" />
								Eliminar Clave
							{/if}
						</Button>
					</form>

					<form
						method="POST"
						action="?/generar"
						use:enhance={() => {
							loadingGenerate = true;
							return async ({ result, update }) => {
								if (result.type === 'success') {
									toast.success('Nueva clave generada');
								} else if (result.type === 'failure') {
									toast.error('Error: ' + (result.data?.message || 'No se pudo generar la clave.'));
								}
								await update();
								loadingGenerate = false;
							};
						}}
					>
						<Button
							type="submit"
							variant="outline"
							class="h-10 rounded-lg text-sm"
							disabled={loadingRevoke || loadingGenerate}
						>
							{#if loadingGenerate}
								<RefreshCwIcon class="mr-2 h-4 w-4 animate-spin" />
								Generando...
							{:else}
								<RefreshCwIcon class="mr-2 h-4 w-4" />
								Generar Nueva y Revocar Actual
							{/if}
						</Button>
					</form>
				</div>
			</div>
		{:else}
			<ApiKeyEmptyState {loadingGenerate} onLoadingChange={setLoadingGenerate} />
		{/if}
	</section>

	<ApiInstructions />
</div>