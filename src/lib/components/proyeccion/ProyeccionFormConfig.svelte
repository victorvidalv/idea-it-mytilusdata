<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		tallaObjetivo: string;
		cargando: boolean;
		diasCount: number;
		onEjecutarProyeccion: () => void;
	}

	let { tallaObjetivo = $bindable(), cargando, diasCount, onEjecutarProyeccion }: Props = $props();
</script>

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
	<div class="flex items-end">
		<Button
			onclick={onEjecutarProyeccion}
			disabled={diasCount < 3 || cargando}
			class="h-11 rounded-xl bg-ocean-mid hover:bg-ocean-light"
		>
			{cargando ? 'Proyectando...' : 'Ejecutar Proyección'}
		</Button>
	</div>
</div>
