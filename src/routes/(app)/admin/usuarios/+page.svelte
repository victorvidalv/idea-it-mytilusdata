<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';

	export let data: any;
	export let form: any;

	// Colores por rol para los badges
	const rolColors: Record<string, string> = {
		ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
		INVESTIGADOR: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
		USUARIO: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
	};

	const rolLabels: Record<string, string> = {
		ADMIN: 'Administrador',
		INVESTIGADOR: 'Investigador',
		USUARIO: 'Usuario'
	};

	$: if (form?.success) {
		toast.success('Operación exitosa', { description: form?.message });
	} else if (form?.error) {
		toast.error('Error', { description: form?.message });
	}
</script>

<svelte:head>
	<title>Administrar Usuarios | Plataforma Idea 2025</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Administrar Usuarios</h1>
		<p class="text-slate-500 mt-1">Gestionar roles y accesos de los usuarios de la plataforma</p>
	</div>

	<!-- Resumen de usuarios por rol -->
	<div class="grid gap-4 md:grid-cols-3">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Total Usuarios</Card.Title>
				<svg class="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
				</svg>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.usuarios.length}</div>
				<p class="text-xs text-slate-500">Registrados en la plataforma</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Investigadores</Card.Title>
				<svg class="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
				</svg>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.usuarios.filter((u: any) => u.rol === 'INVESTIGADOR').length}</div>
				<p class="text-xs text-slate-500">Con acceso a datos globales</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Administradores</Card.Title>
				<svg class="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
				</svg>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.usuarios.filter((u: any) => u.rol === 'ADMIN').length}</div>
				<p class="text-xs text-slate-500">Con control total</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Tabla de usuarios -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Usuarios Registrados</Card.Title>
			<Card.Description>Cambia el rol o estado de cualquier usuario de la plataforma</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b text-left">
							<th class="pb-3 font-medium text-slate-500">Nombre</th>
							<th class="pb-3 font-medium text-slate-500">Email</th>
							<th class="pb-3 font-medium text-slate-500">Rol</th>
							<th class="pb-3 font-medium text-slate-500">Estado</th>
							<th class="pb-3 font-medium text-slate-500">Registro</th>
							<th class="pb-3 font-medium text-slate-500 text-right">Acciones</th>
						</tr>
					</thead>
					<tbody>
						{#each data.usuarios as usuario (usuario.id)}
							<tr class="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
								<td class="py-3 font-medium">{usuario.nombre}</td>
								<td class="py-3 text-slate-600 dark:text-slate-400">{usuario.email}</td>
								<td class="py-3">
									{#if usuario.id !== data.user?.userId}
										<form method="POST" action="?/updateRole" use:enhance class="inline">
											<input type="hidden" name="userId" value={usuario.id} />
											<select
												name="rol"
												class="text-xs font-semibold rounded-full px-3 py-1 border-0 cursor-pointer appearance-none {rolColors[usuario.rol] || rolColors['USUARIO']}"
												value={usuario.rol}
												on:change={(e) => e.currentTarget.form?.requestSubmit()}
											>
												<option value="USUARIO">Usuario</option>
												<option value="INVESTIGADOR">Investigador</option>
												<option value="ADMIN">Administrador</option>
											</select>
										</form>
									{:else}
										<span class="text-xs font-semibold rounded-full px-3 py-1 {rolColors[usuario.rol]}">
											{rolLabels[usuario.rol] || usuario.rol}
										</span>
										<span class="text-xs text-slate-400 ml-1">(tú)</span>
									{/if}
								</td>
								<td class="py-3">
									{#if usuario.activo}
										<span class="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400">
											<span class="h-2 w-2 rounded-full bg-green-500"></span>
											Activo
										</span>
									{:else}
										<span class="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
											<span class="h-2 w-2 rounded-full bg-slate-300"></span>
											Inactivo
										</span>
									{/if}
								</td>
								<td class="py-3 text-slate-500 text-xs">
									{usuario.createdAt ? new Date(usuario.createdAt).toLocaleDateString('es-CL') : '—'}
								</td>
								<td class="py-3 text-right">
									{#if usuario.id !== data.user?.userId}
										<form method="POST" action="?/toggleActive" use:enhance class="inline">
											<input type="hidden" name="userId" value={usuario.id} />
											<input type="hidden" name="activo" value={!usuario.activo} />
											<Button
												type="submit"
												variant="ghost"
												class="h-8 text-xs {usuario.activo ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}"
											>
												{usuario.activo ? 'Desactivar' : 'Activar'}
											</Button>
										</form>
									{:else}
										<span class="text-xs text-slate-400">—</span>
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
