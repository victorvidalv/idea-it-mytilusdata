<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		number: number;
		title: string;
		subtitle?: string;
		children: Snippet;
	}

	let { number, title, subtitle, children }: Props = $props();
</script>

<section
	class="group rounded-3xl border border-border/30 bg-card/40 p-6 shadow-sm backdrop-blur-lg transition-all hover:border-border/60 hover:bg-card/60 sm:p-10"
>
	<div class="mb-6 flex items-center gap-4">
		<div
			class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
		>
			<span class="font-display text-lg font-bold">{number}</span>
		</div>
		<h2 class="font-display text-xl font-semibold tracking-tight sm:text-2xl">
			{title}
			{#if subtitle}
				<span class="text-lg text-muted-foreground">{subtitle}</span>
			{/if}
		</h2>
	</div>
	{@render children()}
</section>