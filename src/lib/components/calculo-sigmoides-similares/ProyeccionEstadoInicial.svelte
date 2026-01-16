<script lang="ts">
	import { Activity, AlertCircle, LineChart } from 'lucide-svelte';

	interface Props {
		totalPuntos: number;
		minimoPuntos?: number;
		error?: string;
	}

	let { totalPuntos, minimoPuntos = 5, error = '' }: Props = $props();

	let faltantes = $derived(Math.max(0, minimoPuntos - totalPuntos));
	let listo = $derived(totalPuntos >= minimoPuntos);
</script>

<div class="relative overflow-hidden rounded-xl border border-border/50 bg-card/80 shadow-sm">
	<div
		class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-ocean-mid via-ocean-light to-emerald-500"
	></div>
	<div class="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
		<div class="space-y-4 p-5 sm:p-6">
			<div class="flex items-start gap-3">
				<div class="rounded-lg bg-ocean-light/10 p-2 text-ocean-light">
					{#if error}
						<AlertCircle class="h-5 w-5" />
					{:else}
						<LineChart class="h-5 w-5" />
					{/if}
				</div>
				<div class="min-w-0">
					<p class="font-display text-base font-semibold text-foreground">
						{error
							? 'No se pudo generar la proyección'
							: listo
								? 'Listo para proyectar'
								: 'Faltan mediciones para proyectar'}
					</p>
					<p class="mt-1 text-sm leading-relaxed text-muted-foreground">
						{#if error}
							{error}
						{:else if listo}
							Ejecuta la proyección para ajustar el perfil logístico, estimar el día objetivo y
							visualizar el rango esperado.
						{:else}
							El ajuste requiere al menos {minimoPuntos} pares día-talla. Agrega {faltantes}
							{faltantes === 1 ? ' medición adicional' : ' mediciones adicionales'} para habilitar la
							predicción.
						{/if}
					</p>
				</div>
			</div>

			<div class="grid gap-3 sm:grid-cols-3">
				<div class="rounded-lg border border-border/40 bg-secondary/20 p-3">
					<p class="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
						Mediciones
					</p>
					<p class="mt-1 font-mono text-lg font-semibold">{totalPuntos}/{minimoPuntos}</p>
				</div>
				<div class="rounded-lg border border-border/40 bg-secondary/20 p-3">
					<p class="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
						Modelo
					</p>
					<p class="mt-1 text-sm font-semibold">Logístico restringido</p>
				</div>
				<div class="rounded-lg border border-border/40 bg-secondary/20 p-3">
					<p class="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
						Salida
					</p>
					<p class="mt-1 text-sm font-semibold">Mediana y rango 95%</p>
				</div>
			</div>
		</div>

		<div class="border-t border-border/40 bg-secondary/10 p-5 lg:border-t-0 lg:border-l">
			<div class="space-y-3">
				<div class="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
					<Activity class="h-4 w-4 text-ocean-light" />
					<span>Lectura esperada del gráfico</span>
				</div>
				<div class="space-y-2 text-xs text-muted-foreground">
					<div class="flex items-center gap-2">
						<span class="h-2.5 w-2.5 rounded-full bg-ocean-mid"></span>
						<span>puntos reales ingresados o cargados desde registros</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="h-1 w-6 border-t-2 border-dashed border-slate-400"></span>
						<span>perfil histórico de referencia</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="h-1 w-6 rounded-full bg-ocean-light"></span>
						<span>predicción central del crecimiento</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="h-3 w-6 rounded-sm border border-amber-600/40 bg-amber-400/20"></span>
						<span>rango mínimo-máximo esperado</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
