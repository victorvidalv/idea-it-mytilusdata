<script lang="ts">
	import { enhance } from '$app/forms';
	import CentroFormFields from './CentroFormFields.svelte';
	import CentroFormActions from './CentroFormActions.svelte';
	import CentroMapSelector from './CentroMapSelector.svelte';
	import { processFormResult, type FormResult } from './centro-form-utils';

	interface Centro {
		id: number;
		nombre: string;
		latitud?: number | null;
		longitud?: number | null;
	}

	interface Props {
		centro: Centro;
		onCancel: () => void;
		onSuccess: (msg: string) => void;
		onError: (msg: string) => void;
	}

	let { centro, onCancel, onSuccess, onError }: Props = $props();

	let editNombre = $state(centro.nombre);
	let editLat = $state(centro.latitud?.toString() ?? '');
	let editLng = $state(centro.longitud?.toString() ?? '');

	function handleMapSelect(coords: { lat: string; lng: string }) {
		editLat = coords.lat;
		editLng = coords.lng;
	}
</script>

<tr class="border-b border-border/20 bg-ocean-light/[0.03]">
	<td colspan="6" class="px-4 py-3">
		<form
			method="POST"
			action="?/update"
			use:enhance={() => {
				return async ({ result, update }) => {
					processFormResult(result as FormResult, { onSuccess, onError });
					await update();
				};
			}}
			class="space-y-3"
		>
			<input type="hidden" name="centroId" value={centro.id} />
			
			<CentroFormFields
				centroId={centro.id}
				bind:nombre={editNombre}
				bind:latitud={editLat}
				bind:longitud={editLng}
			>
				{#snippet actions()}
					<CentroFormActions {onCancel} />
				{/snippet}
			</CentroFormFields>

			<CentroMapSelector
				latitude={centro.latitud}
				longitude={centro.longitud}
				onSelect={handleMapSelect}
			/>
		</form>
	</td>
</tr>