<script lang="ts">
	import CentroRowActions from './CentroRowActions.svelte';

	export let centro: {
		id: number;
		nombre: string;
		latitud?: number | null;
		longitud?: number | null;
		totalCiclos: number;
		isOwner: boolean;
		createdAt?: string | null;
	};
	export let canViewAll: boolean;
	export let onEdit: () => void;
	export let onSuccess: (msg: string) => void;
	export let onError: (msg: string) => void;

	// Funciones auxiliares para formateo
	function formatCoord(value: number | null | undefined): string {
		return value?.toFixed(4) ?? '—';
	}

	function formatDate(dateStr: string | null | undefined): string {
		if (!dateStr) return '—';
		return new Date(dateStr).toLocaleDateString('es-CL', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}

	function getCiclosBadgeClass(count: number): string {
		return count > 0
			? 'bg-teal-glow/10 text-teal-glow'
			: 'bg-secondary text-muted-foreground';
	}
</script>

<tr class="group border-b border-border/20 transition-colors hover:bg-secondary/20">
	<td class="px-4 py-3">
		<span class="font-medium text-foreground">{centro.nombre}</span>
		{#if !centro.isOwner && canViewAll}
			<span class="ml-1.5 text-[10px] text-ocean-light">otro</span>
		{/if}
	</td>
	<td class="px-4 py-3 text-muted-foreground tabular-nums">{formatCoord(centro.latitud)}</td>
	<td class="px-4 py-3 text-muted-foreground tabular-nums">{formatCoord(centro.longitud)}</td>
	<td class="px-4 py-3 text-center">
		<span
			class="inline-flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-medium {getCiclosBadgeClass(centro.totalCiclos)}"
		>
			{centro.totalCiclos}
		</span>
	</td>
	<td class="px-4 py-3 text-xs text-muted-foreground">
		{formatDate(centro.createdAt)}
	</td>
	<td class="px-4 py-3">
		<CentroRowActions
			centroId={centro.id}
			isOwner={centro.isOwner}
			totalCiclos={centro.totalCiclos}
			{onEdit}
			{onSuccess}
			{onError}
		/>
	</td>
</tr>