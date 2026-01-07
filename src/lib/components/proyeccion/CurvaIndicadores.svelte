<!--
Tarjetas de indicadores clave del modelo de crecimiento.
Refactorizado a nivel atómico para cumplir con svelteqa (Complexity < 10).
-->
<script lang="ts">
	import * as Card from '$lib/components/ui/card';
    import CurvaIndicadorObjetivo from './CurvaIndicadorObjetivo.svelte';
	import { calificarR2, type CurvaUsada, type Metadatos } from './ProyeccionComponentTypes';

	interface Props {
		curvaUsada: CurvaUsada;
		metadatos?: Metadatos;
	}

	let { curvaUsada, metadatos }: Props = $props();

	let calidadR2 = $derived(calificarR2(curvaUsada.r2));
</script>

<Card.Root class="border-border/50">
	<Card.Content class="py-4">
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<div class="space-y-1">
				<p class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Método</p>
				<p class="font-mono text-sm font-semibold">{curvaUsada.esCurvaLocal ? 'Ajuste local' : 'Biblioteca'}</p>
			</div>

			{#if curvaUsada.r2 !== undefined && calidadR2}
				<div class="space-y-1">
					<p class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">R²</p>
					<p class="font-mono text-sm font-semibold">
						{curvaUsada.r2.toFixed(4)} <span class="text-xs {calidadR2.clase}">({calidadR2.texto})</span>
					</p>
				</div>
			{/if}

			{#if curvaUsada.parametros}
				<div class="space-y-1">
					<p class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Talla máx (L)</p>
					<p class="font-mono text-sm font-semibold text-ocean-mid">{curvaUsada.parametros.L.toFixed(1)} mm</p>
				</div>
			{/if}

			{#if metadatos}
                <CurvaIndicadorObjetivo {metadatos} {curvaUsada} />
			{/if}
		</div>
	</Card.Content>
</Card.Root>
