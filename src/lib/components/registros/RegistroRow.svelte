<script lang="ts">
	import RegistroEditForm from './RegistroEditForm.svelte';
	import RegistroRowContent from './RegistroRowContent.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { RegistroRowData, RegistroPageData, EditState } from './registro-row-types';

	export let reg: RegistroRowData;
	export let data: RegistroPageData;
	export let editState: EditState;
	export let handleAction: SubmitFunction;
	export let formatDateTime: (d: string | Date | null) => string;

	$: isEditing = editState.editingId === reg.id;
</script>

{#if isEditing}
	<RegistroEditForm {reg} {data} onCancel={editState.onCancel} {handleAction} />
{:else}
	<RegistroRowContent
		{reg}
		{formatDateTime}
		{handleAction}
		onEdit={editState.onEdit}
	/>
{/if}