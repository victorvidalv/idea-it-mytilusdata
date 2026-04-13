<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import CopyIcon from '@lucide/svelte/icons/copy';

	export let apiKey: string;
	export let isKeyVisible: boolean;
	export let onToggleVisibility: () => void;
	export let onCopy: () => void;
</script>

<div
	class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/30 bg-secondary/30 p-5 sm:flex-nowrap"
>
	<div class="w-full flex-1 space-y-2">
		<Label class="text-xs font-medium tracking-wider text-muted-foreground uppercase"
			>Clave de Acceso</Label
		>
		<div class="flex items-center gap-2">
			<Input
				type={isKeyVisible ? 'text' : 'password'}
				value={apiKey}
				readonly
				class="h-11 rounded-xl border-border/50 bg-background font-mono text-sm"
			/>
			<Button
				variant="outline"
				class="h-11 shrink-0 rounded-xl px-4"
				onclick={onToggleVisibility}
			>
				{isKeyVisible ? 'Ocultar' : 'Mostrar'}
			</Button>
			<Button
				variant="default"
				class="h-11 shrink-0 rounded-xl bg-ocean-mid px-4 hover:bg-ocean-deep"
				onclick={onCopy}
			>
				<CopyIcon class="mr-2 h-4 w-4" />
				Copiar
			</Button>
		</div>
	</div>
</div>