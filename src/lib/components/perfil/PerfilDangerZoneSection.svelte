<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import toast from 'svelte-french-toast';

	export let email: string;

	let loadingDelete = false;
	let confirmEmail = '';

	$: emailMatch = confirmEmail === email;
</script>

<section class="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 shadow-sm sm:p-8">
	<div class="mb-6">
		<h2 class="text-xl font-semibold text-red-500 dark:text-red-400">Zona de Peligro</h2>
		<p class="mt-1 text-sm text-red-500/80 dark:text-red-400/80">
			Borrado permanente e irreversible de tus datos.
		</p>
	</div>

	<div class="max-w-lg space-y-4">
		<div
			class="flex gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-600 dark:text-red-400"
		>
			<svg class="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
				/>
			</svg>
			<div class="text-sm">
				<p class="mb-1 font-semibold">Cuidado: Esto es permanente.</p>
				<p class="leading-relaxed opacity-90">
					Al eliminar tu cuenta, borraremos inmediatamente todos tus centros de cultivo, ciclos
					productivos, consentimientos térmicos y bases de registros históricos. <strong
						>Esta acción no se puede deshacer.</strong
					>
				</p>
			</div>
		</div>

		<form
			method="POST"
			action="?/deleteAccount"
			use:enhance={() => {
				loadingDelete = true;
				return async ({ result, update }) => {
					if (result.type === 'redirect') {
						window.location.href = result.location;
						return;
					}
					if (result.type === 'failure') {
						toast.error(
							'Error al eliminar cuenta: ' +
								(result.data?.message || 'El correo electrónico no coincide.')
						);
					}
					await update();
					loadingDelete = false;
				};
			}}
			class="space-y-4 border-t border-red-500/20 pt-4"
		>
			<div class="space-y-2">
				<Label for="confirmEmail" class="text-xs font-medium text-red-600 dark:text-red-400"
					>Por favor, escribe <strong>{email}</strong> para confirmar:</Label
				>
				<Input
					id="confirmEmail"
					name="confirmEmail"
					bind:value={confirmEmail}
					type="email"
					autocomplete="off"
					placeholder={email}
					disabled={loadingDelete}
					class="h-11 rounded-xl border-red-500/30 bg-background focus:border-red-500 focus:ring-red-500/20"
				/>
			</div>

			<Button
				type="submit"
				variant="destructive"
				class="h-11 w-full rounded-xl font-medium sm:w-auto"
				disabled={loadingDelete || !emailMatch}
			>
				{#if loadingDelete}
					<svg class="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
						></path>
					</svg>
					Eliminando...
				{:else}
					Estoy seguro de eliminar mi cuenta y datos
				{/if}
			</Button>
		</form>
	</div>
</section>