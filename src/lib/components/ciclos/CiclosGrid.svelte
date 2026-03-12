<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import SvarDataGrid from '$lib/components/SvarDataGrid.svelte';
	import CicloRow from './CicloRow.svelte';
	import { formatDate, diasCultivo, getDuracionCiclo } from './ciclo-utils';

	export let ciclos: Array<{
		id: number;
		activo: boolean | null;
		nombre: string;
		lugarNombre: string;
		fechaSiembra: string | null;
		fechaFinalizacion: string | null;
		isOwner: boolean;
	}>;
	export let canViewAll: boolean;
</script>

<div class="animate-fade-up delay-150">
	<Card.Root class="overflow-hidden border-border/50">
		<SvarDataGrid
			data={ciclos}
			columns={[
				{ key: 'activo', label: 'Estado', sortable: true },
				{ key: 'nombre', label: 'Nombre', sortable: true },
				{ key: 'lugarNombre', label: 'Centro', sortable: true },
				{ key: 'fechaSiembra', label: 'Siembra', sortable: true },
				{
					key: 'duracion',
					label: 'Duración',
					sortable: true,
					align: 'center',
					accessor: getDuracionCiclo
				},
				{ key: 'acciones', label: 'Acciones', sortable: false, align: 'right' }
			]}
			searchKeys={['nombre', 'lugarNombre']}
			searchPlaceholder="Buscar ciclos..."
			emptyTitle="Sin ciclos productivos"
			emptyIcon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
			pageSize={10}
			let:items
		>
			{#each items as ciclo (ciclo.id)}
				<CicloRow {ciclo} {canViewAll} {formatDate} {diasCultivo} />
			{/each}
		</SvarDataGrid>
	</Card.Root>
</div>