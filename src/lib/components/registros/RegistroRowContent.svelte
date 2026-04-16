<script lang="ts">
	import RegistroRowActions from './RegistroRowActions.svelte';
	import RegistroRowCentro from './RegistroRowCentro.svelte';
	import RegistroRowOrigen from './RegistroRowOrigen.svelte';
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
	export let formatDateTime: (d: string | Date | null) => string;
	export let handleAction: SubmitFunction;
	export let onEdit: (reg: unknown) => void;

	function formatValor(valor: number): string {
		return valor.toLocaleString('es-CL', { maximumFractionDigits: 3 });
	}

	function handleStartEdit() {
		onEdit(reg);
	}
</script>

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
		<RegistroRowCentro centroNombre={reg.centroNombre} cicloNombre={reg.cicloNombre} />
	</td>
	<td class="px-5 py-3">
		<p class="font-medium tracking-wide text-ocean-light">{reg.tipoNombre}</p>
	</td>
	<td class="px-5 py-3 text-right">
		<span class="font-semibold text-foreground tabular-nums">{formatValor(reg.valor)}</span>
		<span class="ml-1 text-xs text-muted-foreground">{reg.unidad}</span>
	</td>
	<td class="px-5 py-3">
		<RegistroRowOrigen origenNombre={reg.origenNombre} notas={reg.notas} />
	</td>
	<td class="px-5 py-3">
		<RegistroRowActions
			registroId={reg.id}
			isOwner={reg.isOwner}
			{handleAction}
			onEdit={handleStartEdit}
		/>
	</td>
</tr>