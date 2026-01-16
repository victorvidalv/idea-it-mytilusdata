<!--
Subcomponente: Cálculo del día objetivo de cosecha.
Responsabilidad: Mostrar la derivación matemática del día objetivo.
-->
<script lang="ts">
	import type { ParametrosSigmoidal } from './proyeccionUtils';

	interface Props {
		diaObjetivo: number;
		tallaObjetivo: number;
		parametros: ParametrosSigmoidal;
	}

	let { diaObjetivo, tallaObjetivo, parametros }: Props = $props();

	// Cálculos intermedios para mostrar la derivación
	let inversoK = $derived((1 / parametros.k).toFixed(1));
	let ratioYT = $derived((parametros.L / tallaObjetivo).toFixed(4));
	let diferenciaRatio = $derived((parametros.L / tallaObjetivo - 1).toFixed(4));
	let lnDiferencia = $derived(Math.log(parametros.L / tallaObjetivo - 1).toFixed(4));
</script>

<div class="space-y-3">
	<h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
		<span>🎯</span> Cálculo del Día Objetivo
	</h4>
	<div class="rounded-lg border border-ocean-mid/20 bg-ocean-mid/5 p-4 space-y-3">
		<p class="text-xs text-muted-foreground leading-relaxed">
			Para determinar <strong>cuándo</strong> se alcanza la talla objetivo, se invierte la función logística.
			Dado que <span class="font-mono">f(t) = L / (1 + e<sup>-k(t-x₀)</sup>)</span>, despejamos <strong>t</strong>:
		</p>

		<div class="space-y-1.5 rounded-md bg-background/60 p-3">
			<p class="text-[10px] text-muted-foreground italic">Paso 1: Despejar el término exponencial</p>
			<p class="font-mono text-[11px] pl-2">1 + e<sup>-k(t-x₀)</sup> = L / y</p>

			<p class="text-[10px] text-muted-foreground italic mt-2">Paso 2: Aislar la exponencial</p>
			<p class="font-mono text-[11px] pl-2">e<sup>-k(t-x₀)</sup> = L/y − 1</p>

			<p class="text-[10px] text-muted-foreground italic mt-2">Paso 3: Aplicar logaritmo natural</p>
			<p class="font-mono text-[11px] pl-2">t = x₀ − (1/k) · ln(L/y − 1)</p>
		</div>

		<p class="text-[10px] text-muted-foreground">Sustituyendo los valores de tu modelo:</p>

		<div class="space-y-1 rounded-md bg-background/60 p-3">
			<p class="font-mono text-[11px]">
				t = {parametros.x0.toFixed(1)} − (1/{parametros.k.toFixed(4)}) · ln({parametros.L.toFixed(1)}/{tallaObjetivo} − 1)
			</p>
			<p class="font-mono text-[11px]">
				t = {parametros.x0.toFixed(1)} − {inversoK} · ln({ratioYT} − 1)
			</p>
			<p class="font-mono text-[11px]">
				t = {parametros.x0.toFixed(1)} − {inversoK} · ({lnDiferencia})
			</p>
		</div>

		<div class="flex items-center gap-2 pt-1">
			<span class="text-lg">🎯</span>
			<p class="font-mono text-sm font-bold text-ocean-mid">
				Día estimado ≈ {diaObjetivo}
			</p>
			<span class="text-[10px] text-muted-foreground">para alcanzar {tallaObjetivo} mm</span>
		</div>

		<p class="text-[9px] text-muted-foreground italic border-t border-ocean-mid/20 pt-2">
			⚠️ Esta estimación es válida solo si 0 &lt; y &lt; L. Cerca de la asíntota (y → L), pequeñas variaciones en los parámetros
			producen grandes cambios en el día estimado, ya que ∂t/∂y → ∞ cuando y → L.
		</p>
	</div>
</div>
