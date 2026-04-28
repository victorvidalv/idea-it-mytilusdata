<script lang="ts">
	interface Props {
		onCancel: () => void;
	}

	let { onCancel }: Props = $props();
</script>

<div class="flex gap-1.5">
	<button
		type="submit"
		class="h-9 rounded-lg bg-ocean-mid px-3 font-body text-xs font-medium text-white transition-all hover:bg-ocean-deep"
	>
		Guardar
	</button>
	<button
		type="button"
		onclick={onCancel}
		class="h-9 rounded-lg border border-border/60 px-3 font-body text-xs transition-all hover:bg-secondary"
	>
		Cancelar
	</button>
</div>