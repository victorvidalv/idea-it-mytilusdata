<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import toast from 'svelte-french-toast';

	import type { SubmitFunction } from '@sveltejs/kit';

	export let data: import('./$types').PageData;
	export let form: import('./$types').ActionData;

	let showForm = false;
	let editingId: number | null = null;
	let editCodigo = '';
	let editUnidad = '';

	let newCodigo = '';
	let newUnidad = '';

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
				newCodigo = '';
				newUnidad = '';
				await update();
			} else if (result.type === 'failure') {
				toast.error(result.data?.message || 'Ocurrió un error');
			}
		};
	};

	// Restablecer form si viene del server con error y se había mostrado (fallback visual)
	$: if (form?.error) {
		toast.error(form.message);
	}
</script>

<svelte:head>
	<title>Tipos de Medición | MytilusData</title>
</svelte:head>

{#if !data.authorized}
	<div
		class="animate-fade-up flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center"
	>
		<div class="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
			<svg class="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
				/>
			</svg>
		</div>
		<div>
			<h2 class="font-display text-xl font-medium text-foreground">Acceso Denegado</h2>
			<p class="mx-auto mt-2 max-w-[300px] font-body text-sm text-muted-foreground">
				Solo los administradores tienen acceso a la configuración técnica del sistema.
			</p>
		</div>
		<Button href="/dashboard" variant="outline" class="mt-4 rounded-xl font-body text-sm">
			Volver al Inicio
		</Button>
	</div>
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

		<!-- Formulario Agregar -->
		{#if showForm}
			<div class="animate-fade-up">
				<Card.Root class="border-border/50">
					<Card.Content class="pt-6">
						<form
							method="POST"
							action="?/create"
							use:enhance={handleAction}
							class="flex flex-col items-end gap-4 sm:flex-row"
						>
							<div class="w-full space-y-2 sm:flex-1">
								<label
									for="new_codigo"
									class="block font-body text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
									>Código identificador (Ej: TEMP_AGUA)</label
								>
								<input
									id="new_codigo"
									name="codigo"
									type="text"
									bind:value={newCodigo}
									placeholder="TIPO_MEDIDA_NUEVO"
									required
									class="h-10 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm uppercase transition-all focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
								/>
							</div>
							<div class="w-full space-y-2 sm:w-48">
								<label
									for="new_unidad"
									class="block font-body text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
									>Unidad Base (Ej: ºC, kg)</label
								>
								<input
									id="new_unidad"
									name="unidadBase"
									type="text"
									bind:value={newUnidad}
									placeholder="mm, °C, kg"
									required
									class="h-10 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm transition-all focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
								/>
							</div>
							<button
								type="submit"
								disabled={!newCodigo.trim() || !newUnidad.trim()}
								class="h-10 w-full rounded-lg bg-ocean-mid px-6 font-body text-sm font-medium text-white transition-all hover:bg-ocean-deep disabled:opacity-50 sm:w-auto"
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
									{#if editingId === tipo.id}
										<!-- Modo Edición -->
										<tr class="border-b border-border/20 bg-ocean-light/[0.03]">
											<td colspan="4" class="px-4 py-3">
												<form
													method="POST"
													action="?/update"
													use:enhance={handleAction}
													class="flex flex-wrap items-end gap-3"
												>
													<input type="hidden" name="id" value={tipo.id} />
													<div class="flex w-12 items-center px-2 text-xs text-muted-foreground">
														#{tipo.id}
													</div>

													<div class="block min-w-[150px] flex-1 space-y-1">
														<input
															name="codigo"
															type="text"
															bind:value={editCodigo}
															required
															class="h-9 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm uppercase focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
														/>
													</div>

													<div class="block w-32 space-y-1">
														<input
															name="unidadBase"
															type="text"
															bind:value={editUnidad}
															required
															class="h-9 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
														/>
													</div>

													<div class="ml-auto flex gap-1.5">
														<button
															type="submit"
															class="h-9 rounded-lg bg-ocean-mid px-3 font-body text-xs font-medium text-white transition-all hover:bg-ocean-deep"
															>Guardar</button
														>
														<button
															type="button"
															onclick={cancelEdit}
															class="h-9 rounded-lg border border-border/60 px-3 font-body text-xs transition-all hover:bg-secondary"
															>Cancelar</button
														>
													</div>
												</form>
											</td>
										</tr>
									{:else}
										<!-- Modo Vista -->
										<tr
											class="group border-b border-border/20 transition-colors hover:bg-secondary/20"
										>
											<td class="px-4 py-3 text-muted-foreground tabular-nums">#{tipo.id}</td>
											<td
												class="px-4 py-3 font-mono text-[13px] font-medium tracking-wide text-foreground"
												>{tipo.codigo}</td
											>
											<td class="px-4 py-3">
												<span
													class="rounded border border-b-2 border-border/70 bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
												>
													{tipo.unidadBase}
												</span>
											</td>
											<td class="px-4 py-3">
												<div
													class="flex items-center justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100"
												>
													<button
														type="button"
														onclick={() => startEdit(tipo)}
														class="rounded-md p-1.5 text-muted-foreground transition-all hover:bg-ocean-light/10 hover:text-ocean-light"
														title="Editar"
													>
														<svg
															class="h-4 w-4"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
															><path
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
															/></svg
														>
													</button>
													<form
														method="POST"
														action="?/delete"
														use:enhance={handleAction}
														class="inline"
													>
														<input type="hidden" name="id" value={tipo.id} />
														<button
															type="submit"
															class="rounded-md p-1.5 text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500"
															title="Eliminar"
														>
															<svg
																class="h-4 w-4"
																fill="none"
																viewBox="0 0 24 24"
																stroke="currentColor"
																><path
																	stroke-linecap="round"
																	stroke-linejoin="round"
																	stroke-width="2"
																	d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
																/></svg
															>
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
