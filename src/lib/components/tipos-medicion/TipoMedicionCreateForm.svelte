<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card';
	import type { SubmitFunction } from '@sveltejs/kit';

	export let onSubmit: SubmitFunction;

	let codigo = '';
	let unidad = '';
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
						for="new_codigo"
						class="block font-body text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
						>Código identificador (Ej: TEMP_AGUA)</label
					>
					<input
						id="new_codigo"
						name="codigo"
						type="text"
						bind:value={codigo}
						placeholder="TIPO_MEDIDA_NUEVO"
						required
						class="h-10 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm uppercase transition-all focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
					/>
				</div>
				<div class="w-full space-y-2 sm:w-48">
					<label
						for="new_unidad"
						class="block font-body text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
						>Unidad Base (Ej: ºC, kg)</label
					>
					<input
						id="new_unidad"
						name="unidadBase"
						type="text"
						bind:value={unidad}
						placeholder="mm, °C, kg"
						required
						class="h-10 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm transition-all focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
					/>
				</div>
				<button
					type="submit"
					disabled={!codigo.trim() || !unidad.trim()}
					class="h-10 w-full rounded-lg bg-ocean-mid px-6 font-body text-sm font-medium text-white transition-all hover:bg-ocean-deep disabled:opacity-50 sm:w-auto"
				>
					Guardar
				</button>
			</form>
		</Card.Content>
	</Card.Root>
</div>