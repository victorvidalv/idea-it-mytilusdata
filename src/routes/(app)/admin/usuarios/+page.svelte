<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';

	export let data: any;
	export let form: any;

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
		toast.success('Operación exitosa', { description: form?.message });
	} else if (form?.error) {
		toast.error('Error', { description: form?.message });
	}

	// Contadores
	$: totalUsers = data.usuarios.length;
	$: investigators = data.usuarios.filter((u: any) => u.rol === 'INVESTIGADOR').length;
	$: admins = data.usuarios.filter((u: any) => u.rol === 'ADMIN').length;
</script>

<svelte:head>
	<title>Administrar Usuarios | Plataforma Idea 2025</title>
</svelte:head>

<div class="space-y-8">
	<!-- Encabezado -->
	<div class="animate-fade-up">
		<p class="text-xs font-body font-medium text-muted-foreground uppercase tracking-[0.2em] mb-2">Administración</p>
		<h1 class="text-3xl md:text-4xl font-display text-foreground leading-tight">
			Gestión de <span class="text-gradient-ocean">Usuarios</span>
		</h1>
		<p class="text-muted-foreground font-body text-sm mt-2">
			Administrar roles y accesos de los usuarios registrados en la plataforma
		</p>
	</div>

	<!-- Resumen por rol -->
	<div class="grid gap-5 md:grid-cols-3 animate-fade-up delay-75">
		<div class="card-hover">
			<Card.Root class="border-border/50 overflow-hidden">
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-body font-medium text-muted-foreground">Total Usuarios</Card.Title>
					<div class="h-9 w-9 rounded-xl bg-ocean-mid/10 flex items-center justify-center">
						<svg class="h-[18px] w-[18px] text-ocean-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
						</svg>
					</div>
				</Card.Header>
				<Card.Content>
					<div class="text-3xl font-display">{totalUsers}</div>
					<p class="text-xs text-muted-foreground font-body mt-1">Registrados en la plataforma</p>
				</Card.Content>
			</Card.Root>
		</div>

		<div class="card-hover">
			<Card.Root class="border-border/50 overflow-hidden">
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-body font-medium text-muted-foreground">Investigadores</Card.Title>
					<div class="h-9 w-9 rounded-xl bg-ocean-light/10 flex items-center justify-center">
						<svg class="h-[18px] w-[18px] text-ocean-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
					</div>
				</Card.Header>
				<Card.Content>
					<div class="text-3xl font-display">{investigators}</div>
					<p class="text-xs text-muted-foreground font-body mt-1">Con acceso a datos globales</p>
				</Card.Content>
			</Card.Root>
		</div>

		<div class="card-hover">
			<Card.Root class="border-border/50 overflow-hidden">
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-body font-medium text-muted-foreground">Administradores</Card.Title>
					<div class="h-9 w-9 rounded-xl bg-red-500/10 flex items-center justify-center">
						<svg class="h-[18px] w-[18px] text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
						</svg>
					</div>
				</Card.Header>
				<Card.Content>
					<div class="text-3xl font-display">{admins}</div>
					<p class="text-xs text-muted-foreground font-body mt-1">Con control total del sistema</p>
				</Card.Content>
			</Card.Root>
		</div>
	</div>

	<!-- Tabla de usuarios -->
	<div class="animate-fade-up delay-150">
		<Card.Root class="border-border/50 overflow-hidden">
			<Card.Header>
				<div class="flex items-center justify-between">
					<div>
						<Card.Title class="font-display text-lg">Usuarios Registrados</Card.Title>
						<Card.Description class="font-body text-xs mt-1">Cambiar roles y estado de acceso</Card.Description>
					</div>
					<div class="text-xs font-body text-muted-foreground bg-secondary/60 px-3 py-1.5 rounded-lg">
						{totalUsers} {totalUsers === 1 ? 'usuario' : 'usuarios'}
					</div>
				</div>
			</Card.Header>
			<Card.Content>
				<div class="overflow-x-auto -mx-6">
					<table class="w-full text-sm font-body min-w-[640px]">
						<thead>
							<tr class="border-b border-border/50">
								<th class="pb-3 px-6 font-medium text-xs text-muted-foreground uppercase tracking-wider text-left">Usuario</th>
								<th class="pb-3 px-4 font-medium text-xs text-muted-foreground uppercase tracking-wider text-left">Rol</th>
								<th class="pb-3 px-4 font-medium text-xs text-muted-foreground uppercase tracking-wider text-left">Estado</th>
								<th class="pb-3 px-4 font-medium text-xs text-muted-foreground uppercase tracking-wider text-left">Registro</th>
								<th class="pb-3 px-6 font-medium text-xs text-muted-foreground uppercase tracking-wider text-right">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{#each data.usuarios as usuario, i (usuario.id)}
								<tr class="border-b border-border/30 last:border-0 hover:bg-secondary/30 transition-colors duration-150 group">
									<!-- Info del usuario -->
									<td class="py-4 px-6">
										<div class="flex items-center gap-3">
											<div class="h-9 w-9 rounded-xl bg-ocean-mid/10 flex items-center justify-center text-xs font-display {usuario.id === data.user?.userId ? 'text-ocean-light ring-2 ring-ocean-light/20' : 'text-ocean-mid'}">
												{usuario.nombre?.charAt(0).toUpperCase() || 'U'}
											</div>
											<div class="min-w-0">
												<p class="font-medium text-foreground truncate">
													{usuario.nombre}
													{#if usuario.id === data.user?.userId}
														<span class="text-[10px] text-ocean-light font-body ml-1">(tú)</span>
													{/if}
												</p>
												<p class="text-xs text-muted-foreground truncate">{usuario.email}</p>
											</div>
										</div>
									</td>

									<!-- Rol -->
									<td class="py-4 px-4">
										{#if usuario.id !== data.user?.userId}
											<form method="POST" action="?/updateRole" use:enhance class="inline">
												<input type="hidden" name="userId" value={usuario.id} />
												<select
													name="rol"
													class="text-xs font-semibold font-body rounded-lg px-3 py-1.5 border cursor-pointer transition-all duration-200 hover:shadow-sm {rolConfig[usuario.rol]?.bg || rolConfig['USUARIO'].bg} {rolConfig[usuario.rol]?.color || rolConfig['USUARIO'].color}"
													value={usuario.rol}
													on:change={(e) => e.currentTarget.form?.requestSubmit()}
												>
													<option value="USUARIO">Usuario</option>
													<option value="INVESTIGADOR">Investigador</option>
													<option value="ADMIN">Administrador</option>
												</select>
											</form>
										{:else}
											<span class="inline-flex items-center gap-1.5 text-xs font-semibold font-body rounded-lg px-3 py-1.5 border {rolConfig[usuario.rol]?.bg} {rolConfig[usuario.rol]?.color}">
												<span class="h-1.5 w-1.5 rounded-full {rolConfig[usuario.rol]?.dot}"></span>
												{rolConfig[usuario.rol]?.label || usuario.rol}
											</span>
										{/if}
									</td>

									<!-- Estado -->
									<td class="py-4 px-4">
										{#if usuario.activo}
											<span class="inline-flex items-center gap-1.5 text-xs font-medium font-body text-green-600 dark:text-green-400">
												<span class="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
												Activo
											</span>
										{:else}
											<span class="inline-flex items-center gap-1.5 text-xs font-medium font-body text-muted-foreground">
												<span class="h-2 w-2 rounded-full bg-muted-foreground/40"></span>
												Inactivo
											</span>
										{/if}
									</td>

									<!-- Fecha -->
									<td class="py-4 px-4 text-xs text-muted-foreground font-body">
										{usuario.createdAt ? new Date(usuario.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
									</td>

									<!-- Acciones -->
									<td class="py-4 px-6 text-right">
										{#if usuario.id !== data.user?.userId}
											<form method="POST" action="?/toggleActive" use:enhance class="inline">
												<input type="hidden" name="userId" value={usuario.id} />
												<input type="hidden" name="activo" value={!usuario.activo} />
												<button
													type="submit"
													class="text-xs font-body font-medium px-3 py-1.5 rounded-lg transition-all duration-200
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
