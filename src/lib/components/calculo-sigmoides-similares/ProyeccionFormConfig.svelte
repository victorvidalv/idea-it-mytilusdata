<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		tallaObjetivo: string;
		modeloSeleccionado?: string;
		modelosDisponibles?: Array<{ id: string; nombre: string; descripcion: string }>;
		cargando: boolean;
		fechasCount: number;
		onEjecutarProyeccion: () => void;
	}

	let { tallaObjetivo = $bindable(), modeloSeleccionado = $bindable(''), modelosDisponibles = [], cargando, fechasCount, onEjecutarProyeccion }: Props = $props();

	const MIN_PUNTOS_PROYECCION = 5;
	let faltantes = $derived(Math.max(0, MIN_PUNTOS_PROYECCION - fechasCount));
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
			<div class="flex-1 space-y-2">
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
			</div>
		{/if}
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
