<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		iconPath: string;
		iconClass?: string;
		titleClass?: string;
		sectionClass?: string;
		children: Snippet;
	}

	let { title, iconPath, iconClass = '', titleClass = '', sectionClass = '', children }: Props = $props();
</script>

<section
	class="group rounded-3xl border border-border/30 bg-card/40 p-6 shadow-sm backdrop-blur-lg transition-all hover:border-border/60 hover:bg-card/60 sm:p-10 {sectionClass}"
>
	<div class="mb-6 flex items-center gap-4">
		<div
			class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl {iconClass}"
		>
			<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={iconPath} />
			</svg>
		</div>
		<h2 class="font-display text-xl font-semibold tracking-tight {titleClass}">{title}</h2>
	</div>
	{@render children()}
</section>