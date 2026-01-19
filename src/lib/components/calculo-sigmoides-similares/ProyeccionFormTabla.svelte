<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		fechas: string[];
		dias: number[];
		tallas: number[];
		onEliminarPunto: (fecha: string) => void;
	}

	let { fechas, dias, tallas, onEliminarPunto }: Props = $props();
</script>

{#if fechas.length > 0}
	<div class="space-y-2">
		<Label class="text-xs font-medium tracking-wider text-muted-foreground uppercase">
			Datos ingresados ({fechas.length})
		</Label>
		<div class="max-h-48 overflow-y-auto rounded-lg border border-border/50">
			<table class="w-full text-sm">
				<thead class="bg-secondary/30 text-muted-foreground">
					<tr>
						<th class="px-3 py-2 text-left font-medium">Fecha</th>
						<th class="px-3 py-2 text-left font-medium">Día</th>
						<th class="px-3 py-2 text-left font-medium">Talla (mm)</th>
						<th class="px-3 py-2 text-right font-medium">Acciones</th>
					</tr>
				</thead>
				<tbody>
					{#each fechas as fecha, i}
						<tr class="border-t border-border/30">
							<td class="px-3 py-2">{fecha}</td>
							<td class="px-3 py-2">{dias[i]}</td>
							<td class="px-3 py-2">{tallas[i].toFixed(1)}</td>
							<td class="px-3 py-2 text-right">
								<Button
									variant="ghost"
									size="sm"
									onclick={() => onEliminarPunto(fecha)}
									class="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
								>
									Eliminar
								</Button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{/if}
