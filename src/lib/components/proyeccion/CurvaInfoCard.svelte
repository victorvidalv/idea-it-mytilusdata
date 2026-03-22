<!--
Tarjeta informativa para mostrar la curva usada en la proyección.
-->
<script lang="ts">
	import * as Card from '$lib/components/ui/card';

	interface Props {
		curvaUsada: { id: number; codigoReferencia: string; sse: number; esCurvaLocal: boolean; r2?: number };
	}

	let { curvaUsada }: Props = $props();
</script>

<Card.Root class="border-border/50">
	<Card.Header>
		<Card.Title class="font-display text-lg">Curva utilizada para la proyección</Card.Title>
	</Card.Header>
	<Card.Content>
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<div class="space-y-1">
				<p class="text-xs font-medium text-muted-foreground">Referencia</p>
				<p class="font-mono text-sm">{curvaUsada.codigoReferencia}</p>
			</div>
			<div class="space-y-1">
				<p class="text-xs font-medium text-muted-foreground">SSE (Error)</p>
				<p class="font-mono text-sm">{curvaUsada.sse.toFixed(2)}</p>
			</div>
			{#if curvaUsada.r2 !== undefined}
				<div class="space-y-1">
					<p class="text-xs font-medium text-muted-foreground">R² (Bondad ajuste)</p>
					<p class="font-mono text-sm">{curvaUsada.r2.toFixed(3)}</p>
				</div>
			{/if}
			<div class="space-y-1">
				<p class="text-xs font-medium text-muted-foreground">Tipo</p>
				<p class="font-mono text-sm">{curvaUsada.esCurvaLocal ? 'Ajuste local' : 'Biblioteca'}</p>
			</div>
		</div>
	</Card.Content>
</Card.Root>
