<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import DataTable from '$lib/components/DataTable.svelte';

	export let data: import('./$types').PageData;

	let selectedUserId: string = 'all';

	$: filteredCiclos =
		selectedUserId === 'all'
			? data.ciclos
			: data.ciclos.filter((c) => c.userId === Number(selectedUserId));

	$: activos = filteredCiclos.filter((c) => c.activo).length;
	$: finalizados = filteredCiclos.filter((c) => !c.activo).length;

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '—';
		return new Date(dateStr).toLocaleDateString('es-CL', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}

	function diasCultivo(fechaSiembra: string | null, fechaFin: string | null): string {
		if (!fechaSiembra) return '—';
		const inicio = new Date(fechaSiembra);
		const fin = fechaFin ? new Date(fechaFin) : new Date();
		const dias = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
		return `${dias}d`;
	}
</script>

<svelte:head>
	<title>Ciclos Productivos Globales | Plataforma Idea 2025</title>
</svelte:head>

<div class="space-y-8">
	<!-- Encabezado -->
	<div class="animate-fade-up flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
		<div>
			<p
				class="mb-2 font-body text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase"
			>
				Área Investigador
			</p>
			<h1 class="font-display text-3xl leading-tight text-foreground md:text-4xl">
				Ciclos <span class="text-gradient-ocean">Productivos Globales</span>
			</h1>
			<p class="mt-2 font-body text-sm text-muted-foreground">
				{activos} activo{activos !== 1 ? 's' : ''} · {finalizados} finalizado{finalizados !== 1
					? 's'
					: ''}
			</p>
		</div>
		<div class="sm:self-end">
			<select
				bind:value={selectedUserId}
				class="w-full rounded-xl border border-border bg-background px-4 py-2 font-body text-sm text-foreground focus:border-teal-glow focus:ring-1 focus:ring-teal-glow focus:outline-none sm:w-64"
			>
				<option value="all">Todos los Usuarios</option>
				{#each data.usuarios as usr}
					<option value={usr.id.toString()}>{usr.nombre}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Lista de ciclos -->
	<div class="animate-fade-up delay-150">
		<Card.Root class="overflow-hidden border-border/50">
			<DataTable
				data={filteredCiclos}
				columns={[
					{ key: 'activo', label: 'Estado', sortable: true },
					{ key: 'nombre', label: 'Nombre', sortable: true },
					{ key: 'usuarioNombre', label: 'Propietario', sortable: true },
					{ key: 'lugarNombre', label: 'Centro', sortable: true },
					{ key: 'fechaSiembra', label: 'Siembra', sortable: true },
					{
						key: 'duracion',
						label: 'Duración',
						sortable: true,
						align: 'center',
						accessor: (c) => {
							if (!c.fechaSiembra) return 0;
							const inicio = new Date(c.fechaSiembra);
							const fin = c.fechaFinalizacion ? new Date(c.fechaFinalizacion) : new Date();
							return Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
						}
					}
				]}
				searchKeys={['nombre', 'lugarNombre', 'usuarioNombre']}
				searchPlaceholder="Buscar ciclos o usuarios..."
				emptyTitle="Sin ciclos productivos"
				emptyIcon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
				pageSize={10}
				let:items
			>
				{#each items as ciclo (ciclo.id)}
					<tr class="transition-colors hover:bg-white/[0.02]">
						<td class="px-4 py-3 font-body text-sm whitespace-nowrap">
							{#if ciclo.activo}
								<span
									class="inline-flex items-center gap-1.5 rounded-full border border-teal-glow/20 bg-teal-glow/10 px-2.5 py-1 text-xs font-medium text-teal-300"
								>
									<span
										class="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-glow shadow-[0_0_8px_rgba(45,212,191,0.8)]"
									></span>
									Activo
								</span>
							{:else}
								<span
									class="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/50"
								>
									<span class="h-1.5 w-1.5 rounded-full bg-white/30"></span>
									Finalizado
								</span>
							{/if}
						</td>
						<td class="px-4 py-3 font-body text-sm whitespace-nowrap">
							<span class="font-medium text-white">{ciclo.nombre}</span>
						</td>
						<td class="px-4 py-3 font-body text-sm whitespace-nowrap text-white/70">
							{ciclo.usuarioNombre}
						</td>
						<td class="px-4 py-3 font-body text-sm whitespace-nowrap text-white/70">
							<div class="flex items-center gap-1.5">
								<svg
									class="h-3.5 w-3.5 text-white/40"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
									/>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
								{ciclo.lugarNombre}
							</div>
						</td>
						<td class="px-4 py-3 font-body text-sm whitespace-nowrap text-white/50">
							<div class="flex items-center gap-1.5">
								<svg
									class="h-3.5 w-3.5 text-white/40"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
								{formatDate(ciclo.fechaSiembra)}
							</div>
						</td>
						<td class="px-4 py-3 text-center font-body text-sm whitespace-nowrap">
							<span class="font-mono text-ocean-light"
								>{diasCultivo(ciclo.fechaSiembra, ciclo.fechaFinalizacion)}</span
							>
						</td>
					</tr>
				{/each}
			</DataTable>
		</Card.Root>
	</div>
</div>
