<script lang="ts">
	import { enhance } from '$app/forms';

	export let centroId: number;
	export let onSuccess: (msg: string) => void;
	export let onError: (msg: string) => void;

	function handleConfirm(e: Event) {
		if (!confirm('¿Seguro que deseas eliminar este centro?')) {
			e.preventDefault();
		}
	}

	function handleResult(result: { type: string; data?: { message?: string } }) {
		if (result.type === 'success') {
			// @ts-expect-error - message comes from action result
			onSuccess(result.data?.message || 'Centro eliminado');
		} else if (result.type === 'failure') {
			// @ts-expect-error - message comes from action result
			onError(result.data?.message || 'Error al eliminar');
		}
	}
</script>

<form
	method="POST"
	action="?/delete"
	use:enhance={() => {
		return async ({ result, update }) => {
			handleResult(result as { type: string; data?: { message?: string } });
			await update();
		};
	}}
	class="inline"
>
	<input type="hidden" name="centroId" value={centroId} />
	<button
		type="submit"
		class="rounded-md p-1.5 text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500"
		title="Eliminar"
		onclick={handleConfirm}
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