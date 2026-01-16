<div class="space-y-3">
	<h4 class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
		Modelo logístico sigmoidal
	</h4>
	<div class="space-y-2 rounded-lg border border-border/50 bg-secondary/20 p-3">
		<p class="text-xs leading-relaxed text-muted-foreground">
			El crecimiento biológico sigue una curva en "S": lento al inicio, acelerado en la fase media,
			y estabilización al acercarse al máximo. La <strong>función logística</strong> captura este comportamiento:
		</p>
		<div class="rounded-md bg-background/60 p-2 text-center">
			<p class="font-mono text-sm">f(t) = L / (1 + e<sup>-k·(t - x₀)</sup>)</p>
		</div>
		<div class="grid gap-2 pt-1 text-[10px] text-muted-foreground sm:grid-cols-3">
			<div class="border-l-2 border-ocean-mid/40 pl-2">
				<strong class="text-foreground">L</strong> — Talla máxima teórica (mm). Es la asíntota superior:
				el valor al que tiende la curva pero nunca alcanza exactamente.
			</div>
			<div class="border-l-2 border-ocean-mid/40 pl-2">
				<strong class="text-foreground">k</strong> — Tasa de crecimiento (1/día). Controla cuán rápida
				es la transición de lento a rápido. Valores mayores = transición más abrupta.
			</div>
			<div class="border-l-2 border-ocean-mid/40 pl-2">
				<strong class="text-foreground">x₀</strong> — Punto de inflexión (día). El momento de máxima velocidad
				de crecimiento. En este día la talla es exactamente L/2.
			</div>
		</div>
	</div>
</div>
