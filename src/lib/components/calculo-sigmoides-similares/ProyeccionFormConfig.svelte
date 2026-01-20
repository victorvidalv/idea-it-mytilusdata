<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import type { ModeloPrediccion } from './ProyeccionComponentTypes';

	interface Props {
		tallaObjetivo: string;
		modeloSeleccionado?: string;
		modelosDisponibles?: ModeloPrediccion[];
		cargando: boolean;
		fechasCount: number;
		horizon?: number;
		onEjecutarProyeccion: () => void;
	}

	let {
		tallaObjetivo = $bindable(),
		modeloSeleccionado = $bindable(''),
		modelosDisponibles = [],
		cargando,
		fechasCount,
		horizon = $bindable(90),
		onEjecutarProyeccion
	}: Props = $props();

	const MIN_PUNTOS_PROYECCION = 5;
	let faltantes = $derived(Math.max(0, MIN_PUNTOS_PROYECCION - fechasCount));

	let modeloActivo = $derived(
		modelosDisponibles.find((m) => m.id === modeloSeleccionado)
	);

	let badgeTypeClass = $derived.by(() => {
		if (!modeloActivo) return '';
		switch (modeloActivo.modelType) {
			case 'Matematico': return 'bg-sky-500/10 text-sky-600';
			case 'ML': return 'bg-violet-500/10 text-violet-600';
			case 'Estadistico': return 'bg-teal-500/10 text-teal-600';
			default: return 'bg-slate-500/10 text-slate-600';
		}
	});

	let badgeStatusClass = $derived.by(() => {
		if (!modeloActivo) return '';
		switch (modeloActivo.status) {
			case 'Estable': return 'bg-emerald-500/10 text-emerald-600';
			case 'Experimental': return 'bg-amber-500/10 text-amber-600';
			default: return 'bg-slate-500/10 text-slate-600';
		}
	});
</script>

<div class="flex flex-col gap-4">
	{#if faltantes > 0}
		<div
			class="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300"
		>
			Faltan {faltantes}
			{faltantes === 1 ? 'medición' : 'mediciones'} para ejecutar la proyección. El mínimo técnico es
			{MIN_PUNTOS_PROYECCION} puntos.
		</div>
	{/if}

	<div class="flex flex-col gap-4 sm:flex-row">
		<div class="flex-1 space-y-2">
			<Label class="text-xs font-medium tracking-wider text-muted-foreground uppercase">
				Talla objetivo (mm) - Opcional
			</Label>
			<Input
				type="number"
				step="0.1"
				placeholder="Ej: 80"
				bind:value={tallaObjetivo}
				min="0"
				max="200"
				class="h-11 rounded-xl border-border/50 bg-secondary/50 transition-all focus:border-ocean-light focus:ring-ocean-light/20"
			/>
		</div>
		{#if modelosDisponibles.length > 0}
			<div class="flex-[2] space-y-2">
				<Label class="text-xs font-medium tracking-wider text-muted-foreground uppercase">
					Modelo de predicción
				</Label>
				<select
					bind:value={modeloSeleccionado}
					class="h-11 w-full rounded-xl border border-border/50 bg-secondary/50 px-3 text-sm transition-all focus:border-ocean-light focus:ring-ocean-light/20"
				>
					<option value="">Auto (recomendado)</option>
					{#each modelosDisponibles as modelo}
						<option value={modelo.id}>{modelo.nombre}</option>
					{/each}
				</select>
				{#if modeloActivo}
					<div class="space-y-1.5 rounded-lg border border-border/30 bg-secondary/20 p-2.5">
						<div class="flex flex-wrap items-center gap-1.5">
							<span
								class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium uppercase {badgeTypeClass}"
							>
								{modeloActivo.modelType}
							</span>
							<span
								class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium uppercase {badgeStatusClass}"
							>
								{modeloActivo.status}
							</span>
							<span class="text-[10px] text-muted-foreground">
								Min. {modeloActivo.minPoints} puntos
							</span>
						</div>
						<p class="text-[11px] leading-relaxed text-muted-foreground">
							{modeloActivo.descripcion}
						</p>
						<div class="flex flex-wrap gap-1">
							<span class="text-[10px] text-muted-foreground">Requiere:</span>
							{#each modeloActivo.featuresRequired as f}
								<span class="rounded bg-ocean-mid/10 px-1 py-0.5 text-[10px] text-ocean-mid">{f}</span>
							{/each}
							{#if modeloActivo.featuresOptional.length > 0}
								<span class="text-[10px] text-muted-foreground">Opcional:</span>
								{#each modeloActivo.featuresOptional as f}
									<span class="rounded bg-secondary px-1 py-0.5 text-[10px] text-muted-foreground">{f}</span>
								{/each}
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{/if}
		<div class="flex-1 space-y-2">
			<Label class="text-xs font-medium tracking-wider text-muted-foreground uppercase">
				Horizonte (días)
			</Label>
			<Input
				type="number"
				min="1"
				max="365"
				bind:value={horizon}
				class="h-11 rounded-xl border-border/50 bg-secondary/50 transition-all focus:border-ocean-light focus:ring-ocean-light/20"
			/>
			<p class="text-[10px] text-muted-foreground">Rango: 1 – 365 días</p>
		</div>
		<div class="flex items-end">
			<Button
				onclick={onEjecutarProyeccion}
				disabled={fechasCount < MIN_PUNTOS_PROYECCION || cargando}
				class="h-11 rounded-xl bg-ocean-mid hover:bg-ocean-light"
			>
				{cargando ? 'Proyectando...' : 'Ejecutar Proyección'}
			</Button>
		</div>
	</div>
</div>
