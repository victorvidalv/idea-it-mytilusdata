<script lang="ts">
	import { enhance } from '$app/forms';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import LoginSubmitButton from './LoginSubmitButton.svelte';

	export let form: { email?: string } | null;
	export let loading: boolean;
</script>

<form
	method="POST"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			await update();
			loading = false;
		};
	}}
	class="space-y-5"
>
	<div class="space-y-2">
		<Label
			for="email"
			class="text-xs font-medium tracking-wider text-muted-foreground uppercase"
		>
			Correo Electrónico
		</Label>
		<Input
			id="email"
			name="email"
			type="email"
			placeholder="juan@ejemplo.com"
			required
			disabled={loading}
			value={form?.email || ''}
			class="h-11 rounded-xl border-border/50 bg-secondary/50 transition-all focus:border-ocean-light focus:ring-ocean-light/20"
		/>
	</div>
	<LoginSubmitButton
		{loading}
		loadingText="Enviando..."
		defaultText="Enviar enlace mágico"
	/>
</form>