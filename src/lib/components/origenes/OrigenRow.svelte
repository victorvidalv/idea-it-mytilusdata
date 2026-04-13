<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';

	export let origen: { id: number; nombre: string };
	export let isEditing: boolean;
	export let editNombre: string;
	export let onStartEdit: (origen: { id: number; nombre: string }) => void;
	export let onCancelEdit: () => void;
	export let onSubmit: SubmitFunction;
</script>

{#if isEditing}
	<!-- Modo Edición -->
	<tr class="border-b border-border/20 bg-ocean-light/[0.03]">
		<td colspan="3" class="px-4 py-3">
			<form
				method="POST"
				action="?/update"
				use:enhance={onSubmit}
				class="flex flex-wrap items-end gap-3"
			>
				<input type="hidden" name="id" value={origen.id} />
				<div class="flex w-12 items-center px-2 text-xs text-muted-foreground">
					#{origen.id}
				</div>

				<div class="block min-w-[150px] flex-1 space-y-1">
					<input
						name="nombre"
						type="text"
						bind:value={editNombre}
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
						onclick={onCancelEdit}
						class="h-9 rounded-lg border border-border/60 px-3 font-body text-xs transition-all hover:bg-secondary"
						>Cancelar</button
					>
				</div>
			</form>
		</td>
	</tr>
{:else}
	<!-- Modo Vista -->
	<tr class="group border-b border-border/20 transition-colors hover:bg-secondary/20">
		<td class="w-16 px-4 py-3 text-muted-foreground tabular-nums">#{origen.id}</td>
		<td class="px-4 py-3 text-[13px] font-medium tracking-wide text-foreground"
			>{origen.nombre}</td
		>
		<td class="px-4 py-3">
			<div
				class="flex items-center justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100"
			>
				<button
					type="button"
					onclick={() => onStartEdit(origen)}
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
				<form method="POST" action="?/delete" use:enhance={onSubmit} class="inline">
					<input type="hidden" name="id" value={origen.id} />
					<button
						type="submit"
						class="rounded-md p-1.5 text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500"
						title="Eliminar"
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
			</div>
		</td>
	</tr>
{/if}