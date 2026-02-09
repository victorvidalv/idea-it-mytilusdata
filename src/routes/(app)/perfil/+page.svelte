<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import toast from 'svelte-french-toast';

	export let data: import('./$types').PageData;

	let loadingUpdate = false;
	let loadingDelete = false;
	let confirmEmail = '';

	$: emailMatch = confirmEmail === data.user?.email;
</script>

<svelte:head>
	<title>Mi Perfil | MytilusData</title>
</svelte:head>

<div class="animate-fade-in max-w-3xl space-y-8">
	<div class="mb-8">
		<h1 class="font-display text-3xl text-foreground">Mi Perfil</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Configura tu información personal y gestiona tu cuenta de acceso.
		</p>
	</div>

	<!-- Sección: Actualizar Datos -->
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
					value={data.user?.email}
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
					value={data.user?.nombre || ''}
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

	<!-- Sección: Descarga de Datos -->
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

	<!-- Sección: Acceso por API -->
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

	<!-- Sección: Zona de Peligro -->
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
						>Por favor, escribe <strong>{data.user?.email}</strong> para confirmar:</Label
					>
					<Input
						id="confirmEmail"
						name="confirmEmail"
						bind:value={confirmEmail}
						type="email"
						autocomplete="off"
						placeholder={data.user?.email}
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
</div>
