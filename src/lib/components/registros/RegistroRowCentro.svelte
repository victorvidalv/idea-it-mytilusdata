<script lang="ts">
	export let centroNombre: string;
	export let cicloNombre: string | null | undefined;
</script>

<p class="font-medium text-foreground">{centroNombre}</p>
{#if cicloNombre}
	<p class="mt-0.5 text-xs text-muted-foreground">{cicloNombre}</p>
{:else}
	<span
		class="mt-0.5 inline-flex items-center rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
		>Solo Centro</span
	>
{/if}