<script lang="ts">
	import { enhance } from '$app/forms';

	import * as Card from '$lib/components/ui/card';
	import toast from 'svelte-french-toast';

	export let data: import('./$types').PageData;
	export let form: import('./$types').ActionData;

	const rolConfig: Record<string, { color: string; bg: string; label: string; dot: string }> = {
		ADMIN: {
			color: 'text-red-700 dark:text-red-400',
			bg: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30',
			label: 'Administrador',
			dot: 'bg-red-500'
		},
		INVESTIGADOR: {
			color: 'text-ocean-light',
			bg: 'bg-ocean-light/[0.08] border-ocean-light/15',
			label: 'Investigador',
			dot: 'bg-ocean-light'
		},
		USUARIO: {
			color: 'text-muted-foreground',
			bg: 'bg-secondary/50 border-border/50',
			label: 'Usuario',
			dot: 'bg-muted-foreground/50'
		}
	};

	$: if (form?.success) {
		toast.success('Operación exitosa: ' + (form?.message || ''));
	} else if (form?.error) {
		toast.error('Error: ' + (form?.message || ''));
	}

	// Contadores
	$: totalUsers = data.usuarios.length;
	$: investigators = data.usuarios.filter((u) => u.rol === 'INVESTIGADOR').length;
	$: admins = data.usuarios.filter((u) => u.rol === 'ADMIN').length;
</script>

<svelte:head>
	<title>Administrar Usuarios | MytilusData</title>
</svelte:head>

<div class="space-y-8">
	<!-- Encabezado -->
	<div class="animate-fade-up">
		<p class="mb-2 font-body text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
			Administración
		</p>
		<h1 class="font-display text-3xl leading-tight text-foreground md:text-4xl">
			Gestión de <span class="text-gradient-ocean">Usuarios</span>
		</h1>
		<p class="mt-2 font-body text-sm text-muted-foreground">
			Administrar roles y accesos de los usuarios registrados en la plataforma
		</p>
	</div>

	<!-- Resumen por rol -->
	<div class="animate-fade-up grid gap-5 delay-75 md:grid-cols-3">
		<div class="card-hover">
			<Card.Root class="overflow-hidden border-border/50">
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="font-body text-sm font-medium text-muted-foreground"
						>Total Usuarios</Card.Title
					>
					<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-ocean-mid/10">
						<svg
							class="h-[18px] w-[18px] text-ocean-mid"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.75"
								d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
							/>
						</svg>
					</div>
				</Card.Header>
				<Card.Content>
					<div class="font-display text-3xl">{totalUsers}</div>
					<p class="mt-1 font-body text-xs text-muted-foreground">Registrados en la plataforma</p>
				</Card.Content>
			</Card.Root>
		</div>

		<div class="card-hover">
			<Card.Root class="overflow-hidden border-border/50">
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="font-body text-sm font-medium text-muted-foreground"
						>Investigadores</Card.Title
					>
					<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-ocean-light/10">
						<svg
							class="h-[18px] w-[18px] text-ocean-light"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.75"
								d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
							/>
						</svg>
					</div>
				</Card.Header>
				<Card.Content>
					<div class="font-display text-3xl">{investigators}</div>
					<p class="mt-1 font-body text-xs text-muted-foreground">Con acceso a datos globales</p>
				</Card.Content>
			</Card.Root>
		</div>

		<div class="card-hover">
			<Card.Root class="overflow-hidden border-border/50">
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="font-body text-sm font-medium text-muted-foreground"
						>Administradores</Card.Title
					>
					<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10">
						<svg
							class="h-[18px] w-[18px] text-red-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.75"
								d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
							/>
						</svg>
					</div>
				</Card.Header>
				<Card.Content>
					<div class="font-display text-3xl">{admins}</div>
					<p class="mt-1 font-body text-xs text-muted-foreground">Con control total del sistema</p>
				</Card.Content>
			</Card.Root>
		</div>
	</div>

	<!-- Tabla de usuarios -->
	<div class="animate-fade-up delay-150">
		<Card.Root class="overflow-hidden border-border/50">
			<Card.Header>
				<div class="flex items-center justify-between">
					<div>
						<Card.Title class="font-display text-lg">Usuarios Registrados</Card.Title>
						<Card.Description class="mt-1 font-body text-xs"
							>Cambiar roles y estado de acceso</Card.Description
						>
					</div>
					<div
						class="rounded-lg bg-secondary/60 px-3 py-1.5 font-body text-xs text-muted-foreground"
					>
						{totalUsers}
						{totalUsers === 1 ? 'usuario' : 'usuarios'}
					</div>
				</div>
			</Card.Header>
			<Card.Content>
				<div class="-mx-6 overflow-x-auto">
					<table class="w-full min-w-[640px] font-body text-sm">
						<thead>
							<tr class="border-b border-border/50">
								<th
									class="px-6 pb-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
									>Usuario</th
								>
								<th
									class="px-4 pb-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
									>Rol</th
								>
								<th
									class="px-4 pb-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
									>Estado</th
								>
								<th
									class="px-4 pb-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
									>Registro</th
								>
								<th
									class="px-6 pb-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase"
									>Acciones</th
								>
							</tr>
						</thead>
						<tbody>
							{#each data.usuarios as usuario (usuario.id)}
								<tr
									class="group border-b border-border/30 transition-colors duration-150 last:border-0 hover:bg-secondary/30"
								>
									<!-- Info del usuario -->
									<td class="px-6 py-4">
										<div class="flex items-center gap-3">
											<div
												class="flex h-9 w-9 items-center justify-center rounded-xl bg-ocean-mid/10 font-display text-xs {usuario.id ===
												data.user?.userId
													? 'text-ocean-light ring-2 ring-ocean-light/20'
													: 'text-ocean-mid'}"
											>
												{usuario.nombre?.charAt(0).toUpperCase() || 'U'}
											</div>
											<div class="min-w-0">
												<p class="truncate font-medium text-foreground">
													{usuario.nombre}
													{#if usuario.id === data.user?.userId}
														<span class="ml-1 font-body text-[10px] text-ocean-light">(tú)</span>
													{/if}
												</p>
												<p class="truncate text-xs text-muted-foreground">{usuario.email}</p>
											</div>
										</div>
									</td>

									<!-- Rol -->
									<td class="px-4 py-4">
										{#if usuario.id !== data.user?.userId}
											<form method="POST" action="?/updateRole" use:enhance class="inline">
												<input type="hidden" name="userId" value={usuario.id} />
												<select
													name="rol"
													class="cursor-pointer rounded-lg border px-3 py-1.5 font-body text-xs font-semibold transition-all duration-200 hover:shadow-sm {rolConfig[
														usuario.rol ?? 'USUARIO'
													]?.bg || rolConfig['USUARIO'].bg} {rolConfig[usuario.rol ?? 'USUARIO']
														?.color || rolConfig['USUARIO'].color}"
													value={usuario.rol}
													on:change={(e) => e.currentTarget.form?.requestSubmit()}
												>
													<option value="USUARIO">Usuario</option>
													<option value="INVESTIGADOR">Investigador</option>
													<option value="ADMIN">Administrador</option>
												</select>
											</form>
										{:else}
											<span
												class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-body text-xs font-semibold {rolConfig[
													usuario.rol ?? 'USUARIO'
												]?.bg} {rolConfig[usuario.rol ?? 'USUARIO']?.color}"
											>
												<span
													class="h-1.5 w-1.5 rounded-full {rolConfig[usuario.rol ?? 'USUARIO']
														?.dot}"
												></span>
												{rolConfig[usuario.rol ?? 'USUARIO']?.label || usuario.rol}
											</span>
										{/if}
									</td>

									<!-- Estado -->
									<td class="px-4 py-4">
										{#if usuario.activo}
											<span
												class="inline-flex items-center gap-1.5 font-body text-xs font-medium text-green-600 dark:text-green-400"
											>
												<span class="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
												Activo
											</span>
										{:else}
											<span
												class="inline-flex items-center gap-1.5 font-body text-xs font-medium text-muted-foreground"
											>
												<span class="h-2 w-2 rounded-full bg-muted-foreground/40"></span>
												Inactivo
											</span>
										{/if}
									</td>

									<!-- Fecha -->
									<td class="px-4 py-4 font-body text-xs text-muted-foreground">
										{usuario.createdAt
											? new Date(usuario.createdAt).toLocaleDateString('es-CL', {
													day: '2-digit',
													month: 'short',
													year: 'numeric'
												})
											: '—'}
									</td>

									<!-- Acciones -->
									<td class="px-6 py-4 text-right">
										{#if usuario.id !== data.user?.userId}
											<form method="POST" action="?/toggleActive" use:enhance class="inline">
												<input type="hidden" name="userId" value={usuario.id} />
												<input type="hidden" name="activo" value={!usuario.activo} />
												<button
													type="submit"
													class="rounded-lg px-3 py-1.5 font-body text-xs font-medium transition-all duration-200
														{usuario.activo
														? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/15'
														: 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/15'}"
												>
													{usuario.activo ? 'Desactivar' : 'Activar'}
												</button>
											</form>
										{:else}
											<span class="text-xs text-muted-foreground/40">—</span>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
