<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import toast from 'svelte-french-toast';
	import DataTable from '$lib/components/DataTable.svelte';
	import RegistroCreateForm from '$lib/components/registros/RegistroCreateForm.svelte';
	import RegistroRow from '$lib/components/registros/RegistroRow.svelte';

	import type { SubmitFunction } from '@sveltejs/kit';

	export let data: import('./$types').PageData;

	let showForm = false;
	let editingId: number | null = null;

	const handleAction: SubmitFunction = () => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success(result.data?.message || 'Operación exitosa');
				showForm = false;
				editingId = null;
				await update();
			} else if (result.type === 'failure') {
				toast.error(result.data?.message || 'Ocurrió un error');
			}
		};
	};

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

	function startEdit(reg: unknown) {
		const r = reg as { id: number };
		editingId = r.id;
	}

	function cancelEdit() {
		editingId = null;
	}
</script>

<svelte:head>
	<title>Registros y Mediciones | MytilusData</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="animate-fade-up flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
		<div>
			<p
				class="mb-2 font-body text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase"
			>
				Análisis y Datos
			</p>
			<h1 class="font-display text-3xl leading-tight text-foreground md:text-4xl">
				Registros y <span class="text-gradient-ocean">Mediciones</span>
			</h1>
		</div>
		<Button
			onclick={() => (showForm = !showForm)}
			class="h-10 self-start rounded-xl bg-ocean-mid px-5 font-body text-sm text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-ocean-deep hover:shadow-lg hover:shadow-ocean-mid/20 sm:self-auto"
		>
			{#if showForm}
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
				Nuevo Registro
			{/if}
		</Button>
	</div>

	<!-- Advertencia Centros Vacíos -->
	{#if data.centros.length === 0}
		<div
			class="animate-fade-up flex gap-3 rounded-xl border border-ocean-light/20 bg-ocean-light/10 p-4 text-ocean-light"
		>
			<svg
				class="mt-0.5 h-5 w-5 flex-shrink-0"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<div>
				<p class="font-body text-sm font-medium">No puedes ingresar datos aún</p>
				<p class="mt-0.5 font-body text-xs opacity-80">
					Para ingresar registros o mediciones, primero debes configurar al menos un Centro en el
					sistema.
				</p>
				<div class="mt-3">
					<Button
						href="/centros"
						variant="outline"
						class="h-8 border-ocean-light/30 bg-transparent px-3 text-xs text-ocean-light hover:bg-ocean-light/10"
						>Ir a Centros de Cultivo</Button
					>
				</div>
			</div>
		</div>
	{/if}

	<!-- Formulario de Nuevo Registro -->
	{#if showForm}
		<RegistroCreateForm
			{data}
			onCancel={() => (showForm = false)}
			onSuccess={() => {
				showForm = false;
			}}
		/>
	{/if}

	<!-- Lista de Registros -->
	<div class="animate-fade-up delay-100">
		<Card.Root class="overflow-hidden border-border/50">
			<DataTable
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
						{editingId}
						{data}
						{formatDateTime}
						{handleAction}
						onEdit={startEdit}
						onCancel={cancelEdit}
					/>
				{/each}
			</DataTable>
		</Card.Root>
	</div>
</div>
