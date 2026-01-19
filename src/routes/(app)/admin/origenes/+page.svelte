<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import toast from 'svelte-french-toast';

	export let data: any;
	export let form: any;

	let showForm = false;
	let editingId: number | null = null;
	let editNombre = '';

	let newNombre = '';

	function startEdit(origen: any) {
		editingId = origen.id;
		editNombre = origen.nombre;
	}

	function cancelEdit() {
		editingId = null;
	}

	function handleAction() {
		return async ({ result, update }: { result: any, update: any }) => {
			if (result.type === 'success') {
				toast.success(result.data?.message || 'Operación exitosa');
				showForm = false;
				editingId = null;
				newNombre = '';
				await update();
			} else if (result.type === 'failure') {
				toast.error(result.data?.message || 'Ocurrió un error');
			}
		};
	}

	// Restablecer form si viene del server con error y se había mostrado (fallback visual)
	$: if (form?.error) {
		toast.error(form.message);
	}
</script>

<svelte:head>
	<title>Orígenes de Datos | Plataforma Idea 2025</title>
</svelte:head>

{#if !data.authorized}
	<div class="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4 animate-fade-up">
		<div class="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
			<svg class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
			</svg>
		</div>
		<div>
			<h2 class="text-xl font-display font-medium text-foreground">Acceso Denegado</h2>
			<p class="text-sm text-muted-foreground font-body max-w-[300px] mx-auto mt-2">
				Solo los administradores tienen acceso a la configuración técnica del sistema.
			</p>
		</div>
		<Button href="/dashboard" variant="outline" class="font-body text-sm rounded-xl mt-4">
			Volver al Inicio
		</Button>
	</div>
{:else}
	<div class="space-y-6">
		<div class="animate-fade-up flex flex-col sm:flex-row sm:items-end justify-between gap-4">
			<div>
				<p class="text-xs font-body font-medium text-muted-foreground uppercase tracking-[0.2em] mb-2">Administración Técnica</p>
				<h1 class="text-3xl md:text-4xl font-display text-foreground leading-tight">
					Tipos de <span class="text-gradient-ocean">Origen</span>
				</h1>
			</div>
			<Button 
				onclick={() => showForm = !showForm}
				class="bg-ocean-mid hover:bg-ocean-deep text-white rounded-xl h-10 px-5 font-body text-sm transition-all duration-300 hover:shadow-lg hover:shadow-ocean-mid/20 hover:-translate-y-0.5"
			>
				{#if showForm}
					<svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
					Cancelar
				{:else}
					<svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					Nuevo Origen
				{/if}
			</Button>
		</div>

		<!-- Formulario Agregar -->
		{#if showForm}
			<div class="animate-fade-up">
				<Card.Root class="border-border/50">
					<Card.Content class="pt-6">
						<form method="POST" action="?/create" use:enhance={handleAction} class="flex flex-col sm:flex-row gap-4 items-end">
							<div class="w-full sm:flex-1 space-y-2">
								<label for="new_nombre" class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground block font-body">Nombre del origen (Ej: API Externa, Satélite)</label>
								<input
									id="new_nombre"
									name="nombre"
									type="text"
									bind:value={newNombre}
									placeholder="Nombre del nuevo origen..."
									required
									class="w-full h-10 rounded-lg bg-background border border-border/60 px-3 text-sm font-body focus:border-ocean-light focus:outline-none focus:ring-2 focus:ring-ocean-light/20 transition-all"
								/>
							</div>
							<button
								type="submit"
								disabled={!newNombre.trim()}
								class="w-full sm:w-auto h-10 px-6 rounded-lg bg-ocean-mid hover:bg-ocean-deep disabled:opacity-50 text-white text-sm font-body font-medium transition-all"
							>
								Guardar
							</button>
						</form>
					</Card.Content>
				</Card.Root>
			</div>
		{/if}

		<!-- Tabla de Tipos -->
		<div class="animate-fade-up delay-100">
			<Card.Root class="border-border/50 overflow-hidden">
				<div class="overflow-x-auto">
					<table class="w-full text-sm font-body">
						<thead>
							<tr class="border-b border-border/40 bg-secondary/30">
								<th class="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground w-16">ID</th>
								<th class="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Nombre / Descripción</th>
								<th class="text-right py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground w-32">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{#if data.origenes.length === 0}
								<tr>
									<td colspan="3" class="text-center py-8 text-muted-foreground font-body">
										No hay orígenes de datos registrados.
									</td>
								</tr>
							{:else}
								{#each data.origenes as origen}
									{#if editingId === origen.id}
										<!-- Modo Edición -->
										<tr class="border-b border-border/20 bg-ocean-light/[0.03]">
											<td colspan="3" class="py-3 px-4">
												<form method="POST" action="?/update" use:enhance={handleAction} class="flex flex-wrap items-end gap-3">
													<input type="hidden" name="id" value={origen.id} />
													<div class="flex items-center w-12 text-xs text-muted-foreground px-2">#{origen.id}</div>
													
													<div class="flex-1 min-w-[150px] space-y-1 block">
														<input
															name="nombre"
															type="text"
															bind:value={editNombre}
															required
															class="w-full h-9 rounded-lg bg-background border border-border/60 px-3 text-sm font-body focus:border-ocean-light focus:outline-none focus:ring-2 focus:ring-ocean-light/20"
														/>
													</div>
													
													<div class="flex gap-1.5 ml-auto">
														<button type="submit" class="h-9 px-3 rounded-lg bg-ocean-mid hover:bg-ocean-deep text-white text-xs font-body font-medium transition-all">Guardar</button>
														<button type="button" onclick={cancelEdit} class="h-9 px-3 rounded-lg border border-border/60 text-xs font-body hover:bg-secondary transition-all">Cancelar</button>
													</div>
												</form>
											</td>
										</tr>
									{:else}
										<!-- Modo Vista -->
										<tr class="border-b border-border/20 hover:bg-secondary/20 transition-colors group">
											<td class="py-3 px-4 tabular-nums text-muted-foreground w-16">#{origen.id}</td>
											<td class="py-3 px-4 font-medium text-foreground tracking-wide text-[13px]">{origen.nombre}</td>
											<td class="py-3 px-4">
												<div class="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
													<button
														type="button"
														onclick={() => startEdit(origen)}
														class="p-1.5 rounded-md text-muted-foreground hover:text-ocean-light hover:bg-ocean-light/10 transition-all"
														title="Editar"
													>
														<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
													</button>
													<form method="POST" action="?/delete" use:enhance={handleAction} class="inline">
														<input type="hidden" name="id" value={origen.id} />
														<button
															type="submit"
															class="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
															title="Eliminar"
														>
															<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
														</button>
													</form>
												</div>
											</td>
										</tr>
									{/if}
								{/each}
							{/if}
						</tbody>
					</table>
				</div>
			</Card.Root>
		</div>
	</div>
{/if}
