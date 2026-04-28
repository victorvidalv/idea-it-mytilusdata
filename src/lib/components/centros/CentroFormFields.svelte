<script lang="ts">
	interface Props {
		centroId: number;
		nombre: string;
		latitud: string;
		longitud: string;
	}

	let { centroId, nombre = $bindable(), latitud = $bindable(), longitud = $bindable() }: Props = $props();
</script>

<div class="flex flex-wrap items-end gap-3">
	<div class="min-w-[150px] flex-1 space-y-1">
		<label
			for="edit-nombre-{centroId}"
			class="block text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
		>
			Nombre
		</label>
		<input
			id="edit-nombre-{centroId}"
			name="nombre"
			type="text"
			bind:value={nombre}
			required
			class="h-9 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
		/>
	</div>
	<div class="w-28 space-y-1">
		<label
			for="edit-lat-{centroId}"
			class="block text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
		>
			Latitud
		</label>
		<input
			id="edit-lat-{centroId}"
			name="latitud"
			type="text"
			bind:value={latitud}
			placeholder="-41.4689"
			class="h-9 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm tabular-nums focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
		/>
	</div>
	<div class="w-28 space-y-1">
		<label
			for="edit-lng-{centroId}"
			class="block text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
		>
			Longitud
		</label>
		<input
			id="edit-lng-{centroId}"
			name="longitud"
			type="text"
			bind:value={longitud}
			placeholder="-72.9411"
			class="h-9 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm tabular-nums focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
		/>
	</div>
	<slot name="actions" />
</div>