<script lang="ts">
	import { enhance } from '$app/forms';
	import RegistroEditForm from './RegistroEditForm.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	export let reg: {
		id: number;
		centroId?: number | null;
		centroNombre: string;
		cicloId?: number | null;
		cicloNombre?: string | null;
		tipoId?: number | null;
		tipoNombre?: string | null;
		origenNombre?: string | null;
		valor: number;
		unidad?: string | null;
		fechaMedicion: Date | string | null;
		notas?: string | null;
		isOwner: boolean;
	};
	export let editingId: number | null;
	export let data: {
		centros: Array<{ id: number; nombre: string }>;
		ciclos: Array<{ id: number; nombre: string; lugarId: number }>;
		tipos: Array<{ id: number; codigo: string; unidadBase: string }>;
		origenes: Array<{ id: number; nombre: string }>;
	};
	export let onEdit: (reg: unknown) => void;
	export let onCancel: () => void;
	export let handleAction: SubmitFunction;
	export let formatDateTime: (d: string | Date | null) => string;

	$: isEditing = editingId === reg.id;

	function handleStartEdit() {
		onEdit(reg);
	}
</script>

{#if isEditing}
	<RegistroEditForm {reg} {data} {onCancel} {handleAction} />
{:else}
	<!-- Fila normal -->
	<tr class="group transition-colors hover:bg-secondary/20">
		<td class="px-5 py-3 whitespace-nowrap">
			<div class="flex items-center gap-2">
				<svg
					class="h-4 w-4 text-ocean-light/70"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
					/></svg
				>
				<span class="text-muted-foreground">{formatDateTime(reg.fechaMedicion)}</span>
			</div>
		</td>
		<td class="px-5 py-3">
			<p class="font-medium text-foreground">{reg.centroNombre}</p>
			{#if reg.cicloNombre}
				<p class="mt-0.5 text-xs text-muted-foreground">{reg.cicloNombre}</p>
			{:else}
				<span
					class="mt-0.5 inline-flex items-center rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
					>Solo Centro</span
				>
			{/if}
		</td>
		<td class="px-5 py-3">
			<p class="font-medium tracking-wide text-ocean-light">{reg.tipoNombre}</p>
		</td>
		<td class="px-5 py-3 text-right">
			<span class="font-semibold text-foreground tabular-nums"
				>{reg.valor.toLocaleString('es-CL', { maximumFractionDigits: 3 })}</span
			>
			<span class="ml-1 text-xs text-muted-foreground">{reg.unidad}</span>
		</td>
		<td class="px-5 py-3 text-sm text-muted-foreground">
			{reg.origenNombre}
			{#if reg.notas}
				<div class="mt-1 flex items-center gap-1 opacity-70" title={reg.notas}>
					<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
						/></svg
					>
					<span class="max-w-[120px] truncate text-[11px]">Tiene nota</span>
				</div>
			{/if}
		</td>
		<td class="px-5 py-3">
			{#if reg.isOwner}
				<div
					class="flex items-center justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100"
				>
					<button
						type="button"
						class="rounded-md p-1.5 text-muted-foreground transition-all hover:bg-ocean-light/10 hover:text-ocean-light"
						title="Editar registro"
						onclick={handleStartEdit}
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
					<form method="POST" action="?/delete" use:enhance={handleAction} class="inline">
						<input type="hidden" name="id" value={reg.id} />
						<button
							type="submit"
							class="rounded-md p-1.5 text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500"
							title="Eliminar registro"
							onclick={(e) => {
								if (!confirm('¿Seguro que deseas eliminar este registro?')) e.preventDefault();
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
				</div>
			{:else}
				<div class="flex justify-end opacity-50" title="Registro de otro usuario">
					<svg
						class="h-4 w-4 text-muted-foreground"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
						/></svg
					>
				</div>
			{/if}
		</td>
	</tr>
{/if}