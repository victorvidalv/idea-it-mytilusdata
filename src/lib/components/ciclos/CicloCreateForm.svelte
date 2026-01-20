<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import SearchableSelect from '$lib/components/SearchableSelect.svelte';

	export let data: {
		centros: Array<{ id: number | string; nombre: string }>;
	};
	export let onCancel: () => void;

	let selectedLugarId = '';
</script>

<div class="animate-fade-up">
	<Card.Root class="overflow-hidden border-border/50">
		<Card.Header>
			<Card.Title class="font-display text-lg">Iniciar Ciclo Productivo</Card.Title>
			<Card.Description class="font-body text-xs"
				>Vincule un nuevo ciclo a un centro de cultivo existente</Card.Description
			>
		</Card.Header>
		<Card.Content>
			<form method="POST" action="?/create" use:enhance class="space-y-5">
				<div class="grid gap-5 md:grid-cols-3">
					<!-- Nombre del ciclo -->
					<div class="space-y-2">
						<Label
							for="nombre"
							class="font-body text-xs font-medium tracking-wider text-muted-foreground uppercase"
							>Nombre del Ciclo</Label
						>
						<Input
							id="nombre"
							name="nombre"
							type="text"
							placeholder="Ej: Siembra Primavera 2025"
							required
							class="h-11 rounded-xl border-border/50 bg-secondary/50 font-body transition-all focus:border-ocean-light focus:ring-ocean-light/20"
						/>
					</div>

					<!-- Centro de cultivo -->
					<div class="space-y-2">
						<Label
							for="lugarId"
							class="font-body text-xs font-medium tracking-wider text-muted-foreground uppercase"
							>Centro de Cultivo</Label
						>
						<SearchableSelect
							id="lugarId"
							name="lugarId"
							bind:value={selectedLugarId}
							required
							placeholder="Seleccionar centro..."
							options={data.centros.map((c) => ({
								value: c.id,
								label: c.nombre
							}))}
						/>
					</div>

					<!-- Fecha de siembra -->
					<div class="space-y-2">
						<Label
							for="fechaSiembra"
							class="font-body text-xs font-medium tracking-wider text-muted-foreground uppercase"
							>Fecha de Siembra</Label
						>
						<Input
							id="fechaSiembra"
							name="fechaSiembra"
							type="date"
							required
							class="h-11 rounded-xl border-border/50 bg-secondary/50 font-body transition-all focus:border-ocean-light focus:ring-ocean-light/20"
						/>
					</div>
				</div>

				<div class="flex justify-end gap-3">
					<Button type="button" variant="outline" onclick={onCancel} class="rounded-xl font-body">
						Cancelar
					</Button>
					<Button
						type="submit"
						class="rounded-xl bg-ocean-mid font-body text-white transition-all duration-300 hover:bg-ocean-deep hover:shadow-lg hover:shadow-ocean-mid/20"
					>
						<svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
						Iniciar Ciclo
					</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
