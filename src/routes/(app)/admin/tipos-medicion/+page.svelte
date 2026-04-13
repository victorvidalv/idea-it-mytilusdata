<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import toast from 'svelte-french-toast';
	import TipoMedicionCreateForm from '$lib/components/tipos-medicion/TipoMedicionCreateForm.svelte';
	import TipoMedicionRow from '$lib/components/tipos-medicion/TipoMedicionRow.svelte';
	import AccessDenied from '$lib/components/tipos-medicion/AccessDenied.svelte';

	import type { SubmitFunction } from '@sveltejs/kit';

	export let data: import('./$types').PageData;
	export let form: import('./$types').ActionData;

	let showForm = false;
	let editingId: number | null = null;
	let editCodigo = '';
	let editUnidad = '';

	function startEdit(tipo: { id: number; codigo: string; unidadBase: string }) {
		editingId = tipo.id;
		editCodigo = tipo.codigo;
		editUnidad = tipo.unidadBase;
	}

	function cancelEdit() {
		editingId = null;
	}

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

	$: if (form?.error) {
		toast.error(form.message);
	}
</script>

<svelte:head>
	<title>Tipos de Medición | MytilusData</title>
</svelte:head>

{#if !data.authorized}
	<AccessDenied />
{:else}
	<div class="space-y-6">
		<div class="animate-fade-up flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
			<div>
				<p
					class="mb-2 font-body text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase"
				>
					Administración Técnica
				</p>
				<h1 class="font-display text-3xl leading-tight text-foreground md:text-4xl">
					Tipos de <span class="text-gradient-ocean">Medición</span>
				</h1>
			</div>
			<Button
				onclick={() => (showForm = !showForm)}
				class="h-10 rounded-xl bg-ocean-mid px-5 font-body text-sm text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-ocean-deep hover:shadow-lg hover:shadow-ocean-mid/20"
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
					Nuevo Tipo
				{/if}
			</Button>
		</div>

		{#if showForm}
			<TipoMedicionCreateForm onSubmit={handleAction} />
		{/if}

		<div class="animate-fade-up delay-100">
			<Card.Root class="overflow-hidden border-border/50">
				<div class="overflow-x-auto">
					<table class="w-full font-body text-sm">
						<thead>
							<tr class="border-b border-border/40 bg-secondary/30">
								<th
									class="w-16 px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
									>ID</th
								>
								<th
									class="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
									>Código</th
								>
								<th
									class="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
									>Unidad Base</th
								>
								<th
									class="w-32 px-4 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase"
									>Acciones</th
								>
							</tr>
						</thead>
						<tbody>
							{#if data.tipos.length === 0}
								<tr>
									<td colspan="4" class="py-8 text-center font-body text-muted-foreground">
										No hay tipos de medición registrados. Pense que la base de datos se sembraba
										automáticamente, revisa eso.
									</td>
								</tr>
							{:else}
								{#each data.tipos as tipo (tipo.id)}
									<TipoMedicionRow
										{tipo}
										isEditing={editingId === tipo.id}
										{editCodigo}
										{editUnidad}
										onStartEdit={startEdit}
										onCancelEdit={cancelEdit}
										onSubmit={handleAction}
									/>
								{/each}
							{/if}
						</tbody>
					</table>
				</div>
			</Card.Root>
		</div>
	</div>
{/if}