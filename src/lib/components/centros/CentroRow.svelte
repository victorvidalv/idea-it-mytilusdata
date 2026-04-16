<script lang="ts">
	import CentroEditForm from './CentroEditForm.svelte';
	import CentroRowDisplay from './CentroRowDisplay.svelte';

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

	$: isEditing = editingId === centro.id;

	function handleEdit() {
		onEdit(centro);
	}
</script>

{#if isEditing}
	<CentroEditForm {centro} {onCancel} {onSuccess} {onError} />
{:else}
	<CentroRowDisplay
		{centro}
		{canViewAll}
		onEdit={handleEdit}
		{onSuccess}
		{onError}
	/>
{/if}