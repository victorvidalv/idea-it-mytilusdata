<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import toast from 'svelte-french-toast';

	export let email: string;
	export let nombre: string;

	let loadingUpdate = false;
</script>

<section class="rounded-2xl border border-border/50 bg-card p-6 shadow-sm sm:p-8">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h2 class="text-xl font-semibold">Información General</h2>
			<p class="mt-1 text-sm text-muted-foreground">
				Tu nombre es como te conocerán en la plataforma y en los reportes.
			</p>
		</div>
		<div
			class="bg-ocean-gradient flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl font-display text-2xl text-white/90 shadow-lg shadow-ocean-mid/20"
		>
			{nombre?.charAt(0).toUpperCase() || 'U'}
		</div>
	</div>

	<form
		method="POST"
		action="?/updateProfile"
		use:enhance={() => {
			loadingUpdate = true;
			return async ({ result, update }) => {
				if (result.type === 'success') {
					toast.success('Perfil actualizado correctamente');
				} else if (result.type === 'failure') {
					toast.error('Error: ' + (result.data?.message || 'No se pudo actualizar el perfil.'));
				}
				await update();
				loadingUpdate = false;
			};
		}}
		class="max-w-lg space-y-6"
	>
		<div class="space-y-2">
			<Label
				for="email"
				class="text-xs font-medium tracking-wider text-muted-foreground uppercase"
				>Correo de Sesión</Label
			>
			<Input
				id="email"
				value={email}
				disabled
				class="h-11 rounded-xl bg-secondary/30 text-muted-foreground"
			/>
			<p class="text-xs text-muted-foreground">
				Tu correo es tu llave de acceso y no puede ser modificado.
			</p>
		</div>

		<div class="space-y-2">
			<Label
				for="nombre"
				class="text-xs font-medium tracking-wider text-muted-foreground uppercase"
				>Nombre Completo</Label
			>
			<Input
				id="nombre"
				name="nombre"
				type="text"
				value={nombre || ''}
				required
				disabled={loadingUpdate}
				class="h-11 rounded-xl border-border/50 bg-secondary/50 transition-all focus:border-ocean-light focus:ring-ocean-light/20"
			/>
		</div>

		<Button
			type="submit"
			class="h-11 rounded-xl bg-ocean-mid font-medium text-white transition-all hover:bg-ocean-deep"
			disabled={loadingUpdate}
		>
			{#if loadingUpdate}
				<svg class="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
					></path>
				</svg>
				Guardando...
			{:else}
				Actualizar Perfil
			{/if}
		</Button>
	</form>
</section>