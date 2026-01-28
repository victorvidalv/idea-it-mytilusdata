<!--
Sección desplegable con análisis detallado del modelo predictivo.
Refactorizado para eliminar referencias a sigmoides y ajuste local.
-->
<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import CurvaMetricasCalidad from './CurvaMetricasCalidad.svelte';
	import CurvaCalculoObjetivo from './CurvaCalculoObjetivo.svelte';
	import CurvaFuncionesAjustadas from './CurvaFuncionesAjustadas.svelte';
	import CurvaAnalisisMetodo from './CurvaAnalisisMetodo.svelte';
	import CurvaAnalisisModelo from './CurvaAnalisisModelo.svelte';
	import type { CurvaUsada, Metadatos } from './ProyeccionComponentTypes';

	interface Props {
		curvaUsada: CurvaUsada;
		metadatos?: Metadatos;
		mediciones?: { dia: number; talla: number }[];
	}

	let { curvaUsada, metadatos, mediciones = [] }: Props = $props();

	function tieneParametrosLogisticos(parametros: CurvaUsada['parametros']): boolean {
		const values = parametros as Record<string, unknown> | undefined;
		return typeof values?.L === 'number' && typeof values?.k === 'number' && typeof values?.x0 === 'number';
	}
</script>

<Card.Root class="border-border/50">
	<details class="group">
		<summary class="cursor-pointer list-none">
			<Card.Header class="group-open:pb-2">
				<div class="flex items-center justify-between">
					<Card.Title class="font-display text-lg">Análisis del modelo</Card.Title>
					<span class="text-xs text-muted-foreground transition-transform group-open:rotate-180"
						>▼</span
					>
				</div>
				<Card.Description class="font-body text-xs"
					>Información técnica del modelo predictivo</Card.Description
				>
			</Card.Header>
		</summary>

		<Card.Content class="space-y-6 pt-0">
			<CurvaAnalisisMetodo />
			<CurvaAnalisisModelo />

			<CurvaFuncionesAjustadas {curvaUsada} {mediciones} {metadatos} />

			<div class="space-y-3">
				<h4 class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
					Métricas de calidad
				</h4>
			<CurvaMetricasCalidad
				r2={curvaUsada.r2}
				sse={curvaUsada.sse}
				totalPuntos={metadatos?.totalPuntos ?? mediciones.length}
				parametros={curvaUsada.parametros}
				modeloUsado={metadatos?.modeloUsado}
			/>
			</div>

			{#if metadatos?.diaObjetivo && metadatos.tallaObjetivo && tieneParametrosLogisticos(curvaUsada.parametros)}
				<CurvaCalculoObjetivo
					diaObjetivo={metadatos.diaObjetivo}
					tallaObjetivo={metadatos.tallaObjetivo}
					parametros={curvaUsada.parametros as any}
				/>
			{/if}
		</Card.Content>
	</details>
</Card.Root>
