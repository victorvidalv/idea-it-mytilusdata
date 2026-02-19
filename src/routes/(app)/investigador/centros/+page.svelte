<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import DataTable from '$lib/components/DataTable.svelte';

	export let data: import('./$types').PageData;

	let selectedUserId: string = 'all';

	$: filteredCentros =
		selectedUserId === 'all'
			? data.centros
			: data.centros.filter((c) => c.userId === Number(selectedUserId));
</script>

<svelte:head>
	<title>Centros de Cultivo Globales | MytilusData</title>
</svelte:head>

<div class="space-y-6">
	<!-- Encabezado -->
	<div class="animate-fade-up flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
		<div>
			<p
				class="mb-2 font-body text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase"
			>
				Área Investigador
			</p>
			<h1 class="font-display text-3xl leading-tight text-foreground md:text-4xl">
				Centros de <span class="text-gradient-ocean">Cultivo Globales</span>
			</h1>
		</div>
		<div class="sm:self-end">
			<select
				bind:value={selectedUserId}
				class="w-full rounded-xl border border-border bg-background px-4 py-2 font-body text-sm text-foreground focus:border-teal-glow focus:ring-1 focus:ring-teal-glow focus:outline-none sm:w-64"
			>
				<option value="all">Todos los Usuarios</option>
				{#each data.usuarios as usr (usr.id)}
					<option value={usr.id.toString()}>{usr.nombre}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Tabla de centros -->
	<div class="animate-fade-up delay-100">
		<Card.Root class="overflow-hidden border-border/50">
			<DataTable
				data={filteredCentros}
				columns={[
					{ key: 'nombre', label: 'Nombre', sortable: true },
					{ key: 'usuarioNombre', label: 'Propietario', sortable: true },
					{ key: 'latitud', label: 'Latitud', sortable: true },
					{ key: 'longitud', label: 'Longitud', sortable: true },
					{ key: 'totalCiclos', label: 'Ciclos', sortable: true, align: 'center' },
					{ key: 'createdAt', label: 'Creado', sortable: true }
				]}
				searchKeys={['nombre', 'usuarioNombre']}
				searchPlaceholder="Buscar centros o usuarios..."
				emptyTitle="Sin centros registrados"
				emptyIcon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
				pageSize={10}
				let:items
			>
				{#each items as centro (centro.id)}
					<tr class="transition-colors hover:bg-white/[0.02]">
						<td class="px-4 py-3 font-body text-sm whitespace-nowrap">
							<span class="font-medium text-white">{centro.nombre}</span>
						</td>
						<td class="px-4 py-3 font-body text-sm whitespace-nowrap">
							<span class="text-white/70">{centro.usuarioNombre}</span>
						</td>
						<td class="px-4 py-3 font-mono text-sm whitespace-nowrap text-white/50">
							{centro.latitud ?? '-'}
						</td>
						<td class="px-4 py-3 font-mono text-sm whitespace-nowrap text-white/50">
							{centro.longitud ?? '-'}
						</td>
						<td class="px-4 py-3 text-center font-body text-sm whitespace-nowrap">
							<span
								class="inline-flex items-center justify-center rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/80"
							>
								{centro.totalCiclos}
							</span>
						</td>
						<td class="px-4 py-3 font-body text-sm whitespace-nowrap text-white/50">
							{centro.createdAt ? new Date(centro.createdAt).toLocaleDateString() : '-'}
						</td>
					</tr>
				{/each}
			</DataTable>
		</Card.Root>
	</div>
</div>
