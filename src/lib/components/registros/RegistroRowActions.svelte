<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';

	export let registroId: number;
	export let isOwner: boolean;
	export let handleAction: SubmitFunction;
	export let onEdit: () => void;

	function handleDeleteClick(e: Event) {
		if (!confirm('¿Seguro que deseas eliminar este registro?')) {
			e.preventDefault();
		}
	}
</script>

{#if isOwner}
	<div
		class="flex items-center justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100"
	>
		<button
			type="button"
			class="rounded-md p-1.5 text-muted-foreground transition-all hover:bg-ocean-light/10 hover:text-ocean-light"
			title="Editar registro"
			onclick={onEdit}
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
			<input type="hidden" name="id" value={registroId} />
			<button
				type="submit"
				class="rounded-md p-1.5 text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500"
				title="Eliminar registro"
				onclick={handleDeleteClick}
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