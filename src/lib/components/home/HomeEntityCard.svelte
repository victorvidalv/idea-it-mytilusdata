<script lang="ts">
	interface Props {
		name: string;
		role: string;
		description: string;
	}

	let { name, role, description }: Props = $props();
</script>

<div
	class="group w-full rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-left backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.04] sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-1rem)]"
>
	<h3
		class="font-display text-lg font-medium text-white/90 transition-colors group-hover:text-white"
	>
		{name}
	</h3>
	<p class="mt-1 font-body text-xs font-semibold tracking-wider text-teal-glow/80 uppercase">
		{role}
	</p>
	<p
		class="mt-3 font-body text-sm leading-relaxed text-white/50 transition-colors group-hover:text-white/70"
	>
		{description}
	</p>
</div>