<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import OrigenRow from './OrigenRow.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	export let origenes: { id: number; nombre: string }[];
	export let editingId: number | null;
	export let editNombre: string;
	export let onStartEdit: (origen: { id: number; nombre: string }) => void;
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
							>Nombre / Descripción</th
						>
						<th
							class="w-32 px-4 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase"
							>Acciones</th
						>
					</tr>
				</thead>
				<tbody>
					{#if origenes.length === 0}
						<tr>
							<td colspan="3" class="py-8 text-center font-body text-muted-foreground">
								No hay orígenes de datos registrados.
							</td>
						</tr>
					{:else}
						{#each origenes as origen (origen.id)}
							<OrigenRow
								{origen}
								isEditing={editingId === origen.id}
								{editNombre}
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