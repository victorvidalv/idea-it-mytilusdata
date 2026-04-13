<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card';
	import type { SubmitFunction } from '@sveltejs/kit';

	export let onSubmit: SubmitFunction;

	let nombre = '';
</script>

<div class="animate-fade-up">
	<Card.Root class="border-border/50">
		<Card.Content class="pt-6">
			<form
				method="POST"
				action="?/create"
				use:enhance={onSubmit}
				class="flex flex-col items-end gap-4 sm:flex-row"
			>
				<div class="w-full space-y-2 sm:flex-1">
					<label
						for="new_nombre"
						class="block font-body text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
						>Nombre del origen (Ej: API Externa, Satélite)</label
					>
					<input
						id="new_nombre"
						name="nombre"
						type="text"
						bind:value={nombre}
						placeholder="Nombre del nuevo origen..."
						required
						class="h-10 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm transition-all focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
					/>
				</div>
				<button
					type="submit"
					disabled={!nombre.trim()}
					class="h-10 w-full rounded-lg bg-ocean-mid px-6 font-body text-sm font-medium text-white transition-all hover:bg-ocean-deep disabled:opacity-50 sm:w-auto"
				>
					Guardar
				</button>
			</form>
		</Card.Content>
	</Card.Root>
</div>