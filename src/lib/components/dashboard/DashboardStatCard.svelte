<script lang="ts">
	import * as Card from '$lib/components/ui/card';

	interface Props {
		label: string;
		value: number;
		empty: string;
		icon: string;
		accent: string;
		iconBg: string;
		delay: number;
	}

	let { label, value, empty, icon, accent, iconBg, delay }: Props = $props();
</script>

<div class="animate-fade-up delay-{delay} card-hover group">
	<Card.Root class="overflow-hidden border-border/50 transition-colors duration-300 hover:border-border">
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="font-body text-sm font-medium text-muted-foreground">{label}</Card.Title>
			<div
				class="h-9 w-9 rounded-xl {iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
			>
				<svg class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d={icon} />
				</svg>
			</div>
		</Card.Header>
		<Card.Content>
			<div class="font-display text-3xl text-foreground">{value}</div>
			<p class="mt-1 font-body text-xs text-muted-foreground">
				{value === 0 ? empty : `${value} registrado${value > 1 ? 's' : ''}`}
			</p>
			<div class="mt-4 h-1 overflow-hidden rounded-full bg-secondary/80">
				<div
					class="h-full rounded-full bg-gradient-to-r {accent} transition-all duration-700"
					style="width: {Math.min(value * 10, 100)}%"
				></div>
			</div>
		</Card.Content>
	</Card.Root>
</div>