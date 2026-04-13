<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import toast from 'svelte-french-toast';
	import UsuariosSummaryCards from '$lib/components/usuarios/UsuariosSummaryCards.svelte';
	import UsuarioRow from '$lib/components/usuarios/UsuarioRow.svelte';

	export let data: import('./$types').PageData;
	export let form: import('./$types').ActionData;

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
	<UsuariosSummaryCards {totalUsers} {investigators} {admins} />

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
								<UsuarioRow {usuario} currentUserId={data.user?.userId} />
							{/each}
						</tbody>
					</table>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>