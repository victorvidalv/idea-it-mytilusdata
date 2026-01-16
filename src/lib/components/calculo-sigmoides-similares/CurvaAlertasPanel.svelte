<!--
Panel de alertas de confiabilidad del modelo de crecimiento.
-->
<script lang="ts">
	import type { Alerta } from './curva-alertas';

	interface Props {
		alertas: Alerta[];
	}

	let { alertas }: Props = $props();
</script>

{#if alertas.length > 0}
	<div class="space-y-2">
		{#each alertas as alerta}
			<div class="flex gap-3 rounded-lg border p-3 {alerta.tipo === 'warning'
					? 'border-yellow-500/30 bg-yellow-500/5'
					: 'border-blue-500/30 bg-blue-500/5'}">
				<span class="text-sm mt-0.5 shrink-0">{alerta.tipo === 'warning' ? '⚠️' : 'ℹ️'}</span>
				<div>
					<p class="text-xs font-semibold {alerta.tipo === 'warning' ? 'text-yellow-600' : 'text-blue-600'}">
						{alerta.titulo}
					</p>
					<p class="text-xs text-muted-foreground mt-0.5 leading-relaxed">{alerta.mensaje}</p>
				</div>
			</div>
		{/each}
	</div>
{/if}
