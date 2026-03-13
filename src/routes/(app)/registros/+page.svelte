<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import SvarDataGrid from '$lib/components/SvarDataGrid.svelte';
	import RegistroCreateForm from '$lib/components/registros/RegistroCreateForm.svelte';
	import RegistroRow from '$lib/components/registros/RegistroRow.svelte';
	import RegistrosNoCentrosAlert from '$lib/components/registros/RegistrosNoCentrosAlert.svelte';
	import RegistrosPageHeader from '$lib/components/registros/RegistrosPageHeader.svelte';
	import { formatDateTime, createRegistrosActionHandler } from '$lib/components/registros/registros-page-utils';

	import type { SubmitFunction } from '@sveltejs/kit';

	export let data: import('./$types').PageData;

	let showForm = false;
	let editingId: number | null = null;

	// Manejador de acciones que limpia el estado de edición al éxito
	const handleAction: SubmitFunction = createRegistrosActionHandler(() => {
		showForm = false;
		editingId = null;
	});

	function startEdit(reg: unknown) {
		const r = reg as { id: number };
		editingId = r.id;
	}

	function cancelEdit() {
		editingId = null;
	}

	// Estado de edición agrupado para el componente RegistroRow
	const editState = {
		get editingId() { return editingId; },
		onEdit: startEdit,
		onCancel: cancelEdit
	};
</script>

<svelte:head>
	<title>Registros y Mediciones | MytilusData</title>
</svelte:head>

<div class="space-y-6">
	<RegistrosPageHeader {showForm} onToggleForm={() => (showForm = !showForm)} />

	{#if data.centros.length === 0}
		<RegistrosNoCentrosAlert />
	{/if}

	{#if showForm}
		<RegistroCreateForm
			{data}
			onCancel={() => (showForm = false)}
			onSuccess={() => {
				showForm = false;
			}}
		/>
	{/if}

	<div class="animate-fade-up delay-100">
		<Card.Root class="overflow-hidden border-border/50">
			<SvarDataGrid
				data={data.registros}
				columns={[
					{
						key: 'fechaMedicion',
						label: 'Fecha',
						sortable: true,
						accessor: (r) => new Date(r.fechaMedicion).getTime()
					},
					{ key: 'centroNombre', label: 'Centro / Ciclo', sortable: true },
					{ key: 'tipoNombre', label: 'Medición', sortable: true },
					{ key: 'valor', label: 'Valor', sortable: true, align: 'right' },
					{ key: 'origenNombre', label: 'Origen', sortable: true },
					{ key: 'acciones', label: 'Acciones', sortable: false, align: 'right' }
				]}
				searchKeys={['centroNombre', 'cicloNombre', 'tipoNombre', 'origenNombre', 'notas']}
				searchPlaceholder="Buscar por centro, tipo, origen..."
				emptyTitle="No hay registros ingresados"
				emptyDescription="Ingresa el primer registro usando el botón superior."
				let:items
			>
				{#each items as reg (reg.id)}
					<RegistroRow
						{reg}
						{data}
						{editState}
						{formatDateTime}
						{handleAction}
					/>
				{/each}
			</SvarDataGrid>
		</Card.Root>
	</div>
</div>