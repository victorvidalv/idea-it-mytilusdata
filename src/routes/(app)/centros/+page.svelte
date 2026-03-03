<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import toast from 'svelte-french-toast';
	import SvarDataGrid from '$lib/components/SvarDataGrid.svelte';
	import CentroCreateForm from '$lib/components/centros/CentroCreateForm.svelte';
	import CentroRow from '$lib/components/centros/CentroRow.svelte';

	export let data: import('./$types').PageData;

	// Estado del formulario
	let showCreateForm = false;
	let editingId: number | null = null;

	function handleSuccess(message: string) {
		toast.success(message);
		showCreateForm = false;
		editingId = null;
	}

	function handleError(message: string) {
		toast.error(message);
	}

	function startEdit(centro: unknown) {
		const c = centro as { id: number };
		editingId = c.id;
	}

	function cancelEdit() {
		editingId = null;
	}
</script>

<svelte:head>
	<title>Centros de Cultivo | MytilusData</title>
</svelte:head>

<div class="space-y-6">
	<!-- Encabezado -->
	<div class="animate-fade-up flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
		<div>
			<p
				class="mb-2 font-body text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase"
			>
				{#if data.canViewAll}Vista General{:else}Mis Centros{/if}
			</p>
			<h1 class="font-display text-3xl leading-tight text-foreground md:text-4xl">
				Centros de <span class="text-gradient-ocean">Cultivo</span>
			</h1>
		</div>
		<Button
			onclick={() => {
				showCreateForm = !showCreateForm;
			}}
			class="h-10 self-start rounded-xl bg-ocean-mid px-5 font-body text-sm text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-ocean-deep hover:shadow-lg hover:shadow-ocean-mid/20 sm:self-auto"
		>
			{#if showCreateForm}
				<svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
				Cancelar
			{:else}
				<svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 4v16m8-8H4"
					/>
				</svg>
				Nuevo Centro
			{/if}
		</Button>
	</div>

	<!-- Formulario de creación -->
	{#if showCreateForm}
		<CentroCreateForm
			onCancel={() => (showCreateForm = false)}
			onSuccess={handleSuccess}
			onError={handleError}
		/>
	{/if}

	<!-- Tabla de centros -->
	<div class="animate-fade-up delay-100">
		<Card.Root class="overflow-hidden border-border/50">
			<SvarDataGrid
				data={data.centros}
				columns={[
					{ key: 'nombre', label: 'Nombre', sortable: true },
					{ key: 'latitud', label: 'Latitud', sortable: true },
					{ key: 'longitud', label: 'Longitud', sortable: true },
					{ key: 'totalCiclos', label: 'Ciclos', sortable: true, align: 'center' },
					{ key: 'createdAt', label: 'Creado', sortable: true },
					{ key: 'acciones', label: 'Acciones', sortable: false, align: 'right' }
				]}
				searchKeys={['nombre']}
				searchPlaceholder="Buscar centros..."
				emptyTitle="Sin centros registrados"
				emptyIcon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
				pageSize={10}
				let:items
			>
				{#each items as centro (centro.id)}
					<CentroRow
						{centro}
						{editingId}
						canViewAll={data.canViewAll}
						onEdit={startEdit}
						onCancel={cancelEdit}
						onSuccess={handleSuccess}
						onError={handleError}
					/>
				{/each}
			</SvarDataGrid>
		</Card.Root>
	</div>
</div>
