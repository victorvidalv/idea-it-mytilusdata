<script lang="ts">
	import CentroDeleteButton from './CentroDeleteButton.svelte';

	export let centroId: number;
	export let isOwner: boolean;
	export let totalCiclos: number;
	export let onEdit: () => void;
	export let onSuccess: (msg: string) => void;
	export let onError: (msg: string) => void;
</script>

{#if isOwner}
	<div
		class="flex items-center justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100"
	>
		<button
			type="button"
			onclick={onEdit}
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
		{#if totalCiclos === 0}
			<CentroDeleteButton {centroId} {onSuccess} {onError} />
		{/if}
	</div>
{/if}