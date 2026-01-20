<script lang="ts">
	import { enhance } from '$app/forms';

	export let centro: {
		id: number;
		nombre: string;
		latitud?: number | null;
		longitud?: number | null;
		totalCiclos: number;
		isOwner: boolean;
		createdAt?: string | null;
	};
	export let editingId: number | null;
	export let canViewAll: boolean;
	export let onEdit: (c: unknown) => void;
	export let onCancel: () => void;
	export let onSuccess: (msg: string) => void;
	export let onError: (msg: string) => void;

	let editNombre = '';
	let editLat = '';
	let editLng = '';

	$: isEditing = editingId === centro.id;

	$: if (isEditing && editNombre === '') {
		editNombre = centro.nombre;
		editLat = centro.latitud?.toString() ?? '';
		editLng = centro.longitud?.toString() ?? '';
	}

	function handleEdit() {
		onEdit(centro);
	}
</script>

{#if isEditing}
	<!-- Fila en modo edición -->
	<tr class="border-b border-border/20 bg-ocean-light/[0.03]">
		<td colspan="6" class="px-4 py-3">
			<form
				method="POST"
				action="?/update"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success') {
							// @ts-expect-error - message comes from action result
							onSuccess(result.data?.message || 'Centro actualizado');
						} else if (result.type === 'failure') {
							// @ts-expect-error - message comes from action result
							onError(result.data?.message || 'Error al actualizar');
						}
						await update();
					};
				}}
				class="flex flex-wrap items-end gap-3"
			>
				<input type="hidden" name="centroId" value={centro.id} />
				<div class="min-w-[150px] flex-1 space-y-1">
					<label
						for="edit-nombre-{centro.id}"
						class="block text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
						>Nombre</label
					>
					<input
						id="edit-nombre-{centro.id}"
						name="nombre"
						type="text"
						bind:value={editNombre}
						required
						class="h-9 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
					/>
				</div>
				<div class="w-28 space-y-1">
					<label
						for="edit-lat-{centro.id}"
						class="block text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
						>Latitud</label
					>
					<input
						id="edit-lat-{centro.id}"
						name="latitud"
						type="text"
						bind:value={editLat}
						placeholder="-41.4689"
						class="h-9 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm tabular-nums focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
					/>
				</div>
				<div class="w-28 space-y-1">
					<label
						for="edit-lng-{centro.id}"
						class="block text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
						>Longitud</label
					>
					<input
						id="edit-lng-{centro.id}"
						name="longitud"
						type="text"
						bind:value={editLng}
						placeholder="-72.9411"
						class="h-9 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm tabular-nums focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
					/>
				</div>
				<div class="flex gap-1.5">
					<button
						type="submit"
						class="h-9 rounded-lg bg-ocean-mid px-3 font-body text-xs font-medium text-white transition-all hover:bg-ocean-deep"
						>Guardar</button
					>
					<button
						type="button"
						onclick={onCancel}
						class="h-9 rounded-lg border border-border/60 px-3 font-body text-xs transition-all hover:bg-secondary"
						>Cancelar</button
					>
				</div>
			</form>
		</td>
	</tr>
{:else}
	<!-- Fila normal -->
	<tr class="group border-b border-border/20 transition-colors hover:bg-secondary/20">
		<td class="px-4 py-3">
			<span class="font-medium text-foreground">{centro.nombre}</span>
			{#if !centro.isOwner && canViewAll}
				<span class="ml-1.5 text-[10px] text-ocean-light">otro</span>
			{/if}
		</td>
		<td class="px-4 py-3 text-muted-foreground tabular-nums">{centro.latitud?.toFixed(4) ?? '—'}</td
		>
		<td class="px-4 py-3 text-muted-foreground tabular-nums"
			>{centro.longitud?.toFixed(4) ?? '—'}</td
		>
		<td class="px-4 py-3 text-center">
			<span
				class="inline-flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-medium {centro.totalCiclos >
				0
					? 'bg-teal-glow/10 text-teal-glow'
					: 'bg-secondary text-muted-foreground'}">{centro.totalCiclos}</span
			>
		</td>
		<td class="px-4 py-3 text-xs text-muted-foreground">
			{#if centro.createdAt}
				{new Date(centro.createdAt).toLocaleDateString('es-CL', {
					day: '2-digit',
					month: 'short',
					year: 'numeric'
				})}
			{:else}
				—
			{/if}
		</td>
		<td class="px-4 py-3">
			{#if centro.isOwner}
				<div
					class="flex items-center justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100"
				>
					<button
						type="button"
						onclick={handleEdit}
						class="rounded-md p-1.5 text-muted-foreground transition-all hover:bg-ocean-light/10 hover:text-ocean-light"
						title="Editar"
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
							/></svg
						>
					</button>
					{#if centro.totalCiclos === 0}
						<form
							method="POST"
							action="?/delete"
							use:enhance={() => {
								return async ({ result, update }) => {
									if (result.type === 'success') {
										// @ts-expect-error - message comes from action result
										onSuccess(result.data?.message || 'Centro eliminado');
									} else if (result.type === 'failure') {
										// @ts-expect-error - message comes from action result
										onError(result.data?.message || 'Error al eliminar');
									}
									await update();
								};
							}}
							class="inline"
						>
							<input type="hidden" name="centroId" value={centro.id} />
							<button
								type="submit"
								class="rounded-md p-1.5 text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500"
								title="Eliminar"
								onclick={(e) => {
									if (!confirm('¿Seguro que deseas eliminar este centro?')) e.preventDefault();
								}}
							>
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									/></svg
								>
							</button>
						</form>
					{/if}
				</div>
			{/if}
		</td>
	</tr>
{/if}
