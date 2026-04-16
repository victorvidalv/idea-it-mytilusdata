<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import TipoMedicionRow from './TipoMedicionRow.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	export let tipos: { id: number; codigo: string; unidadBase: string }[];
	export let editingId: number | null;
	export let editCodigo: string;
	export let editUnidad: string;
	export let onStartEdit: (tipo: { id: number; codigo: string; unidadBase: string }) => void;
	export let onCancelEdit: () => void;
	export let onSubmit: SubmitFunction;
</script>

<div class="animate-fade-up delay-100">
	<Card.Root class="overflow-hidden border-border/50">
		<div class="overflow-x-auto">
			<table class="w-full font-body text-sm">
				<thead>
					<tr class="border-b border-border/40 bg-secondary/30">
						<th
							class="w-16 px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
							>ID</th
						>
						<th
							class="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
							>Código</th
						>
						<th
							class="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
							>Unidad Base</th
						>
						<th
							class="w-32 px-4 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase"
							>Acciones</th
						>
					</tr>
				</thead>
				<tbody>
					{#if tipos.length === 0}
						<tr>
							<td colspan="4" class="py-8 text-center font-body text-muted-foreground">
								No hay tipos de medición registrados. Pense que la base de datos se sembraba
								automáticamente, revisa eso.
							</td>
						</tr>
					{:else}
						{#each tipos as tipo (tipo.id)}
							<TipoMedicionRow
								{tipo}
								isEditing={editingId === tipo.id}
								{editCodigo}
								{editUnidad}
								{onStartEdit}
								{onCancelEdit}
								{onSubmit}
							/>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</Card.Root>
</div>