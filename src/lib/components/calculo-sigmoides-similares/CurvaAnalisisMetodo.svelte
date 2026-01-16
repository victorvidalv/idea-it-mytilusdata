<div
	class="space-y-3 rounded-xl border border-ocean-mid/20 bg-gradient-to-br from-ocean-mid/5 to-transparent p-4"
>
	<h4 class="flex items-center gap-2 text-sm font-semibold text-foreground">
		Método de ajuste por perfil sigmoidal de referencia
	</h4>
	<p class="text-xs leading-relaxed text-muted-foreground">
		El sistema estima una curva logística de crecimiento. Si existen suficientes mediciones, ajusta
		directamente los parámetros <strong>L</strong>, <strong>k</strong> y <strong>x₀</strong>. Si el
		ajuste local no es confiable, compara la forma normalizada de tus datos con perfiles históricos
		de la biblioteca y usa el perfil más compatible como referencia.
	</p>
	<div class="grid gap-2 pt-1 sm:grid-cols-3">
		<div class="rounded-lg border border-border/40 bg-background/50 p-3">
			<p class="text-[10px] font-semibold text-foreground">Mínimo técnico</p>
			<p class="mt-1 text-[10px] leading-relaxed text-muted-foreground">
				Se requieren 5 mediciones para evitar un ajuste subdeterminado de tres parámetros.
			</p>
		</div>
		<div class="rounded-lg border border-border/40 bg-background/50 p-3">
			<p class="text-[10px] font-semibold text-foreground">Comparación de forma</p>
			<p class="mt-1 text-[10px] leading-relaxed text-muted-foreground">
				Los datos y perfiles históricos se normalizan a [0,1] y se comparan por SSE normalizado.
			</p>
		</div>
		<div class="rounded-lg border border-border/40 bg-background/50 p-3">
			<p class="text-[10px] font-semibold text-foreground">Escala biológica</p>
			<p class="mt-1 text-[10px] leading-relaxed text-muted-foreground">
				La forma temporal se conserva y la asíntota L se recalcula por mínimos cuadrados
				restringidos.
			</p>
		</div>
	</div>
</div>
