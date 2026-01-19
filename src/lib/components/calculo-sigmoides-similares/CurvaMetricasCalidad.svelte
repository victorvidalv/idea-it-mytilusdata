<!--
Subcomponente: Métricas de calidad del modelo predictivo.
Responsabilidad: Mostrar tarjetas con métricas de calidad de la proyección.
-->
<script lang="ts">
	interface Props {
		r2?: number;
		sse?: number;
		totalPuntos: number;
		parametros?: Record<string, number>;
		modeloUsado?: string;
	}

	let { r2, sse, totalPuntos, parametros, modeloUsado }: Props = $props();

	// Calcular velocidad máxima según el modelo usado
	function calcularVelocidadMaxima(params: Record<string, number> | undefined, modelo: string | undefined): { valor: number; dia?: number; descripcion: string } | undefined {
		if (!params) return undefined;
		const slug = modelo || '';

		// Logístico: vmax = L * k / 4 en t = x0
		if (slug.includes('logistic') || (params.L !== undefined && params.k !== undefined && params.x0 !== undefined)) {
			return {
				valor: (params.L * params.k) / 4,
				dia: params.x0,
				descripcion: `Máxima velocidad en inflexión (día ${params.x0?.toFixed(0)})`
			};
		}

		// Von Bertalanffy: vmax = Linf * K / e en t = t0 + 1/K
		if (slug.includes('bertalanffy') || (params.Linf !== undefined && params.K !== undefined)) {
			return {
				valor: (params.Linf * params.K) / Math.E,
				descripcion: `Máxima velocidad de crecimiento`
			};
		}

		// Gompertz: vmax = a * b * c / e en t = ln(b)/c
		if (slug.includes('gompertz') || (params.a !== undefined && params.b !== undefined && params.c !== undefined)) {
			return {
				valor: (params.a * params.b * params.c) / Math.E,
				descripcion: `Máxima velocidad de crecimiento`
			};
		}

		return undefined;
	}

	let velocidadInfo = $derived(calcularVelocidadMaxima(parametros, modeloUsado));

	// Calificación del R²
	function calificarR2(r2: number): { texto: string; clase: string } {
		if (r2 >= 0.98) return { texto: 'Excelente', clase: 'text-green-500' };
		if (r2 >= 0.95) return { texto: 'Muy bueno', clase: 'text-emerald-500' };
		if (r2 >= 0.90) return { texto: 'Bueno', clase: 'text-blue-500' };
		if (r2 >= 0.85) return { texto: 'Aceptable', clase: 'text-yellow-500' };
		return { texto: 'Bajo', clase: 'text-red-500' };
	}
</script>

<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
	{#if r2 !== undefined}
		{@const calidad = calificarR2(r2)}
		<div class="rounded-lg border border-border/30 bg-secondary/10 p-2.5 space-y-0.5">
			<p class="text-[10px] text-muted-foreground font-semibold">R² — Coef. de determinación</p>
			<p class="font-mono text-xs font-semibold">{r2.toFixed(4)} <span class={calidad.clase}>({calidad.texto})</span></p>
			<p class="text-[9px] text-muted-foreground">Proporción de varianza explicada por el modelo. 1.0 = ajuste perfecto.</p>
		</div>
	{/if}

	{#if sse !== undefined}
		<div class="rounded-lg border border-border/30 bg-secondary/10 p-2.5 space-y-0.5">
			<p class="text-[10px] text-muted-foreground font-semibold">RMSE — Error cuadrático medio</p>
			<p class="font-mono text-xs font-semibold">{sse.toFixed(2)} mm</p>
			<p class="text-[9px] text-muted-foreground">Raíz del error cuadrático medio. Menor = mejor.</p>
		</div>
	{/if}

	<div class="rounded-lg border border-border/30 bg-secondary/10 p-2.5 space-y-0.5">
		<p class="text-[10px] text-muted-foreground font-semibold">n — Puntos de datos</p>
		<p class="font-mono text-xs font-semibold">{totalPuntos}</p>
		<p class="text-[9px] text-muted-foreground">Mínimo 5 puntos para proyección estable.</p>
	</div>

	{#if velocidadInfo}
		<div class="rounded-lg border border-border/30 bg-secondary/10 p-2.5 space-y-0.5">
			<p class="text-[10px] text-muted-foreground font-semibold">v<sub>máx</sub> — Vel. crecimiento</p>
			<p class="font-mono text-xs font-semibold">{velocidadInfo.valor.toFixed(3)} mm/día</p>
			<p class="text-[9px] text-muted-foreground">{velocidadInfo.descripcion}</p>
		</div>
	{/if}
</div>
