<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import DataTable from '$lib/components/DataTable.svelte';

	export let data: import('./$types').PageData;

	let selectedUserId: string = 'all';

	$: filteredRegistros =
		selectedUserId === 'all'
			? data.registros
			: data.registros.filter((r) => r.userId === Number(selectedUserId));

	function formatDateTime(dateInput: string | Date | null) {
		if (!dateInput) return '—';
		const date = new Date(dateInput);
		return date.toLocaleString('es-CL', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Auditoría de Registros | MytilusData</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="animate-fade-up flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
		<div>
			<p
				class="mb-2 font-body text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase"
			>
				Área Investigador
			</p>
			<h1 class="font-display text-3xl leading-tight text-foreground md:text-4xl">
				Auditoría de <span class="text-gradient-ocean">Registros</span>
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

	<!-- Lista de Registros -->
	<div class="animate-fade-up delay-100">
		<Card.Root class="overflow-hidden border-border/50">
			<DataTable
				data={filteredRegistros}
				columns={[
					{
						key: 'fechaMedicion',
						label: 'Fecha',
						sortable: true,
						accessor: (r) => new Date(r.fechaMedicion).getTime()
					},
					{ key: 'usuarioNombre', label: 'Autor', sortable: true },
					{ key: 'centroNombre', label: 'Centro / Ciclo', sortable: true },
					{ key: 'tipoNombre', label: 'Medición', sortable: true },
					{ key: 'valor', label: 'Valor', sortable: true, align: 'right' },
					{ key: 'origenNombre', label: 'Origen', sortable: true }
				]}
				searchKeys={[
					'centroNombre',
					'cicloNombre',
					'tipoNombre',
					'origenNombre',
					'notas',
					'usuarioNombre'
				]}
				searchPlaceholder="Buscar por centro, autor, tipo..."
				emptyTitle="No hay registros asociados a este usuario"
				emptyDescription="Seleccione otro usuario o modifique la búsqueda."
				let:items
			>
				{#each items as reg (reg.id)}
					<tr class="transition-colors hover:bg-white/[0.02]">
						<td class="px-4 py-3 font-body text-sm whitespace-nowrap text-white/50">
							<div class="flex items-center gap-1.5">
								<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								{formatDateTime(reg.fechaMedicion)}
							</div>
						</td>
						<td class="px-4 py-3 font-body text-sm whitespace-nowrap text-white/70">
							{reg.usuarioNombre}
						</td>
						<td class="px-4 py-3 font-body text-sm">
							<div class="flex flex-col gap-0.5">
								<span class="font-medium text-white">{reg.centroNombre}</span>
								{#if reg.cicloNombre}
									<span class="flex items-center gap-1 text-xs text-white/40">
										<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
											/>
										</svg>
										{reg.cicloNombre}
									</span>
								{/if}
							</div>
						</td>
						<td class="px-4 py-3 font-body text-sm">
							<span
								class="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/70"
							>
								{reg.tipoNombre}
							</span>
						</td>
						<td
							class="px-4 py-3 text-right font-display text-base font-semibold whitespace-nowrap text-ocean-light"
						>
							{reg.valor} <span class="text-xs text-ocean-light/60">{reg.unidad}</span>
						</td>
						<td class="px-4 py-3 font-body text-sm whitespace-nowrap text-white/50">
							{reg.origenNombre}
						</td>
					</tr>
				{/each}
			</DataTable>
		</Card.Root>
	</div>
</div>
