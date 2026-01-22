<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import toast from 'svelte-french-toast';
	import KeyIcon from '@lucide/svelte/icons/key';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import KeyRoundIcon from '@lucide/svelte/icons/key-round';

	export let data: any;

	let loadingGenerate = false;
	let loadingRevoke = false;
	let isKeyVisible = false;

	function copyToClipboard() {
		if (data.apiKey) {
			navigator.clipboard.writeText(data.apiKey);
			toast.success('API Key copiada al portapapeles');
		}
	}
</script>

<svelte:head>
	<title>API Keys | Plataforma Idea 2025</title>
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
				<div
					class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/30 bg-secondary/30 p-5 sm:flex-nowrap"
				>
					<div class="w-full flex-1 space-y-2">
						<Label class="text-xs font-medium tracking-wider text-muted-foreground uppercase"
							>Clave de Acceso</Label
						>
						<div class="flex items-center gap-2">
							<Input
								type={isKeyVisible ? 'text' : 'password'}
								value={data.apiKey}
								readonly
								class="h-11 rounded-xl border-border/50 bg-background font-mono text-sm"
							/>
							<Button
								variant="outline"
								class="h-11 shrink-0 rounded-xl px-4"
								onclick={() => (isKeyVisible = !isKeyVisible)}
							>
								{isKeyVisible ? 'Ocultar' : 'Mostrar'}
							</Button>
							<Button
								variant="default"
								class="h-11 shrink-0 rounded-xl bg-ocean-mid px-4 hover:bg-ocean-deep"
								onclick={copyToClipboard}
							>
								<CopyIcon class="mr-2 h-4 w-4" />
								Copiar
							</Button>
						</div>
					</div>
				</div>
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
						loadingGenerate = true;
						return async ({ result, update }) => {
							if (result.type === 'success') {
								toast.success('API Key generada correctamente');
							} else if (result.type === 'failure') {
								toast.error('Error: ' + (result.data?.message || 'No se pudo generar.'));
							}
							await update();
							loadingGenerate = false;
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
		{/if}
	</section>

	<!-- Sección: Instrucciones -->
	<section class="rounded-2xl border border-border/50 bg-card p-6 shadow-sm sm:p-8">
		<div class="mb-6">
			<h2 class="text-xl font-semibold">¿Cómo usar la API?</h2>
			<p class="mt-1 text-sm text-muted-foreground">
				Ejemplos de cómo puedes consultar tus datos desde otras aplicaciones locales o servidores.
			</p>
		</div>

		<div class="space-y-6">
			<div class="space-y-3">
				<h3 class="font-medium">1. Autenticación</h3>
				<p class="text-sm text-muted-foreground">
					Debes enviar la API Key en las cabeceras (headers) de tus peticiones HTTP usando el
					formato Bearer Token.
				</p>
				<div class="rounded-xl border border-border/50 bg-secondary/30 p-4">
					<code class="text-ocean-dark font-mono text-sm dark:text-ocean-light"
						>Authorization: Bearer tu_api_key_aqui</code
					>
				</div>
			</div>

			<div class="space-y-3">
				<h3 class="font-medium">2. Endpoints Disponibles</h3>
				<div class="space-y-4">
					<!-- Endpoint 1 -->
					<div class="space-y-2 rounded-xl border border-border/50 bg-background p-4">
						<div class="flex items-center gap-2">
							<span
								class="rounded bg-green-500/10 px-2 py-0.5 text-xs font-bold tracking-wider text-green-600 uppercase dark:text-green-400"
								>GET</span
							>
							<code class="font-mono text-sm">/api/registros</code>
						</div>
						<p class="text-sm text-muted-foreground">
							Retorna el listado completo de todos los registros de mediciones y datos históricos
							que has ingresado o sincronizado.
						</p>
					</div>

					<!-- Endpoint 2 -->
					<div class="space-y-2 rounded-xl border border-border/50 bg-background p-4">
						<div class="flex items-center gap-2">
							<span
								class="rounded bg-green-500/10 px-2 py-0.5 text-xs font-bold tracking-wider text-green-600 uppercase dark:text-green-400"
								>GET</span
							>
							<code class="font-mono text-sm">/api/ciclos</code>
						</div>
						<p class="text-sm text-muted-foreground">
							Retorna los ciclos de cultivo asociados a tu cuenta de investigador.
						</p>
					</div>
				</div>
			</div>

			<div class="space-y-3">
				<h3 class="font-medium">3. Ejemplo con cURL</h3>
				<div
					class="overflow-x-auto rounded-xl bg-[#1e1e1e] p-4 font-mono text-sm leading-relaxed text-emerald-400"
				>
					curl -X GET \<br />
					&nbsp;&nbsp;https://plataforma.mytilusdata.cl/api/registros \<br />
					&nbsp;&nbsp;-H "Authorization: Bearer tu_api_key_aqui"
				</div>
			</div>
		</div>
	</section>
</div>
