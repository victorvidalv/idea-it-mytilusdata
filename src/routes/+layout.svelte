<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from 'svelte-french-toast';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<Toaster
	toastOptions={{
		style:
			'background: #0f172a; color: #f8fafc; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px;',
		className: 'font-body text-sm'
	}}
/>
{@render children()}
