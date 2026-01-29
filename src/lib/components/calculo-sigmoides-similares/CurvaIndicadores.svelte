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

	// Extraer talla máxima según el modelo usado
	function getTallaMaxima(parametros: Record<string, number> | undefined, modeloUsado: string | undefined): number | undefined {
		if (!parametros) return undefined;
		const slug = modeloUsado || '';
		// Schnute: usar L calculado (asíntota), no confundir con Gompertz
		if (slug.includes('schnute')) return parametros.L;
		if (slug.includes('logistic') || parametros.L !== undefined) return parametros.L;
		if (slug.includes('bertalanffy') || parametros.Linf !== undefined) return parametros.Linf;
		if (slug.includes('gompertz') || parametros.a !== undefined) return parametros.a;
		return undefined;
	}

	let tallaMax = $derived(getTallaMaxima(curvaUsada.parametros, metadatos?.modeloUsado));
</script>

<Card.Root class="border-border/50">
	<Card.Content class="py-4">
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<div class="space-y-1">
				<p class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Modelo</p>
				<p class="font-mono text-sm font-semibold">{metadatos?.modeloUsado || 'Predictivo'}</p>
			</div>

			{#if curvaUsada.r2 !== undefined && calidadR2}
				<div class="space-y-1">
					<p class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">R²</p>
					<p class="font-mono text-sm font-semibold">
						{curvaUsada.r2.toFixed(4)} <span class="text-xs {calidadR2.clase}">({calidadR2.texto})</span>
					</p>
				</div>
			{/if}

			{#if tallaMax !== undefined}
				<div class="space-y-1">
					<p class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Talla máx estimada</p>
					<p class="font-mono text-sm font-semibold text-ocean-mid">{tallaMax.toFixed(1)} mm</p>
				</div>
			{/if}

			{#if metadatos}
                <CurvaIndicadorObjetivo {metadatos} {curvaUsada} />
			{/if}
		</div>
	</Card.Content>
</Card.Root>
