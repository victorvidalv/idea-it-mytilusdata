<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import toast from 'svelte-french-toast';

	export let data: any;
	export let form: any;

	let loadingUpdate = false;
	let loadingDelete = false;
	let confirmEmail = '';

	$: emailMatch = confirmEmail === data.user?.email;
</script>

<svelte:head>
	<title>Mi Perfil | Plataforma Idea 2025</title>
</svelte:head>

<div class="max-w-3xl space-y-8 animate-fade-in">
	<div class="mb-8">
		<h1 class="text-3xl font-display text-foreground">Mi Perfil</h1>
		<p class="text-sm text-muted-foreground mt-1">Configura tu información personal y gestiona tu cuenta de acceso.</p>
	</div>

	<!-- Sección: Actualizar Datos -->
	<section class="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 shadow-sm">
		<div class="mb-6 flex items-center justify-between">
			<div>
				<h2 class="text-xl font-semibold">Información General</h2>
				<p class="text-sm text-muted-foreground mt-1">Tu nombre es como te conocerán en la plataforma y en los reportes.</p>
			</div>
			<div class="h-16 w-16 rounded-2xl bg-ocean-gradient flex items-center justify-center text-2xl font-display text-white/90 shadow-lg shadow-ocean-mid/20 shrink-0">
				{data.user?.nombre?.charAt(0).toUpperCase() || 'U'}
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
			class="space-y-6 max-w-lg"
		>
			<div class="space-y-2">
				<Label for="email" class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Correo de Sesión</Label>
				<Input 
					id="email" 
					value={data.user?.email} 
					disabled
					class="h-11 rounded-xl bg-secondary/30 text-muted-foreground"
				/>
				<p class="text-xs text-muted-foreground">Tu correo es tu llave de acceso y no puede ser modificado.</p>
			</div>

			<div class="space-y-2">
				<Label for="nombre" class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Nombre Completo</Label>
				<Input 
					id="nombre" 
					name="nombre" 
					type="text" 
					value={data.user?.nombre || ''}
					required 
					disabled={loadingUpdate}
					class="h-11 rounded-xl bg-secondary/50 border-border/50 focus:border-ocean-light focus:ring-ocean-light/20 transition-all"
				/>
			</div>

			<Button 
				type="submit" 
				class="h-11 rounded-xl bg-ocean-mid hover:bg-ocean-deep text-white font-medium transition-all" 
				disabled={loadingUpdate}
			>
				{#if loadingUpdate}
					<svg class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
					</svg>
					Guardando...
				{:else}
					Actualizar Perfil
				{/if}
			</Button>
		</form>
	</section>

	<!-- Sección: Zona de Peligro -->
	<section class="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 sm:p-8 shadow-sm">
		<div class="mb-6">
			<h2 class="text-xl font-semibold text-red-500 dark:text-red-400">Zona de Peligro</h2>
			<p class="text-sm text-red-500/80 dark:text-red-400/80 mt-1">Borrado permanente e irreversible de tus datos.</p>
		</div>

		<div class="space-y-4 max-w-lg">
			<div class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 text-red-600 dark:text-red-400">
				<svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
				</svg>
				<div class="text-sm">
					<p class="font-semibold mb-1">Cuidado: Esto es permanente.</p>
					<p class="opacity-90 leading-relaxed">
						Al eliminar tu cuenta, borraremos inmediatamente todos tus centros de cultivo, ciclos productivos, consentimientos térmicos y bases de registros históricos. <strong>Esta acción no se puede deshacer.</strong>
					</p>
				</div>
			</div>

			<form
				method="POST"
				action="?/deleteAccount"
				use:enhance={() => {
					loadingDelete = true;
					return async ({ result, update }) => {
						if (result.type === 'failure') {
							toast.error('Error al eliminar cuenta: ' + (result.data?.message || 'El correo electrónico no coincide.'));
						}
						await update();
						loadingDelete = false;
					};
				}}
				class="space-y-4 pt-4 border-t border-red-500/20"
			>
				<div class="space-y-2">
					<Label for="confirmEmail" class="text-xs font-medium text-red-600 dark:text-red-400">Por favor, escribe <strong>{data.user?.email}</strong> para confirmar:</Label>
					<Input 
						id="confirmEmail"
						name="confirmEmail"
						bind:value={confirmEmail}
						type="email" 
						autocomplete="off"
						placeholder={data.user?.email}
						disabled={loadingDelete}
						class="h-11 rounded-xl bg-background border-red-500/30 focus:border-red-500 focus:ring-red-500/20"
					/>
				</div>

				<Button 
					type="submit" 
					variant="destructive"
					class="w-full sm:w-auto h-11 rounded-xl font-medium" 
					disabled={loadingDelete || !emailMatch}
				>
					{#if loadingDelete}
						<svg class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
						Eliminando...
					{:else}
						Estoy seguro de eliminar mi cuenta y datos
					{/if}
				</Button>
			</form>
		</div>
	</section>
</div>
