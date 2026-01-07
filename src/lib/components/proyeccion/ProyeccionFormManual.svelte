<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		nuevoDia: string;
		nuevaTalla: string;
		onAgregarPunto: () => void;
		handleKeydown: (e: KeyboardEvent) => void;
	}

	let {
		nuevoDia = $bindable(),
		nuevaTalla = $bindable(),
		onAgregarPunto,
		handleKeydown
	}: Props = $props();
</script>

<div class="flex flex-col gap-4 sm:flex-row">
	<div class="flex-1 space-y-2">
		<Label class="text-xs font-medium tracking-wider text-muted-foreground uppercase">Día</Label>
		<Input
			type="number"
			placeholder="Ej: 0, 30, 60..."
			bind:value={nuevoDia}
			onkeydown={handleKeydown}
			min="0"
			class="h-11 rounded-xl border-border/50 bg-secondary/50 transition-all focus:border-ocean-light focus:ring-ocean-light/20"
		/>
	</div>
	<div class="flex-1 space-y-2">
		<Label class="text-xs font-medium tracking-wider text-muted-foreground uppercase">
			Talla (mm)
		</Label>
		<Input
			type="number"
			step="0.1"
			placeholder="Ej: 25.5"
			bind:value={nuevaTalla}
			onkeydown={handleKeydown}
			min="0"
			max="200"
			class="h-11 rounded-xl border-border/50 bg-secondary/50 transition-all focus:border-ocean-light focus:ring-ocean-light/20"
		/>
	</div>
	<div class="flex items-end">
		<Button
			onclick={onAgregarPunto}
			disabled={nuevoDia === '' || nuevaTalla === ''}
			class="h-11 rounded-xl bg-ocean-mid hover:bg-ocean-light"
		>
			Agregar
		</Button>
	</div>
</div>
