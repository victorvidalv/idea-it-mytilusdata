<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	export let loading: boolean;
	export let loadingText: string;
	export let defaultText: string;
	export let disabled: boolean = false;
	export let showArrow: boolean = true;
</script>

<Button
	type="submit"
	class="h-11 w-full rounded-xl bg-ocean-mid font-medium text-white transition-all duration-300 hover:bg-ocean-deep hover:shadow-lg hover:shadow-ocean-mid/20"
	{disabled}
>
	{#if loading}
		<svg class="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
			<circle
				class="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				stroke-width="4"
			></circle>
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
			></path>
		</svg>
		{loadingText}
	{:else}
		{defaultText}
		{#if showArrow}
			<svg class="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 7l5 5m0 0l-5 5m5-5H6"
				/>
			</svg>
		{/if}
	{/if}
</Button>