<script lang="ts">
	import type { BibliotecaRecord } from '$lib/server/biblioteca/queries';
	import {
		formatFecha,
		formatNumero,
		getPuntosCount,
		getDiasArray,
		calcularPrediccion,
		getR2BadgeClass,
		getErrorClass
	} from './biblioteca-utils';

	export let record: BibliotecaRecord;
	export let isExpanded: boolean;
	export let onToggle: () => void;

	function handleDelete(event: Event): void {
		if (!confirm('¿Estás seguro de eliminar este registro?')) {
			event.preventDefault();
		}
	}
</script>

<tr class="hover:bg-gray-50 cursor-pointer" onclick={onToggle}>
	<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
		{record.codigoReferencia}
	</td>
	<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
		{record.cicloId}
	</td>
	<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
		{getPuntosCount(record.puntosJson)} puntos
	</td>
	<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
		{formatNumero(record.parametrosCalculados.L, 2)} mm
	</td>
	<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
		{formatNumero(record.parametrosCalculados.k)}
	</td>
	<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
		{formatNumero(record.parametrosCalculados.x0, 1)} días
	</td>
	<td class="px-6 py-4 whitespace-nowrap text-sm">
		<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {getR2BadgeClass(record.parametrosCalculados.r2)}">
			{formatNumero(record.parametrosCalculados.r2, 3)}
		</span>
	</td>
	<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
		{formatFecha(record.createdAt)}
	</td>
	<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
		<form method="POST" action="?/delete" onclick={(e) => e.stopPropagation()} onsubmit={handleDelete}>
			<input type="hidden" name="id" value={record.id} />
			<button type="submit" class="text-red-600 hover:text-red-900">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
				</svg>
			</button>
		</form>
	</td>
</tr>

{#if isExpanded}
	<tr class="bg-gray-50">
		<td colspan="9" class="px-6 py-4">
			<div class="text-sm">
				<h4 class="font-medium text-gray-900 mb-3">Mediciones del ciclo</h4>
				<div class="overflow-x-auto">
					<table class="min-w-full text-xs">
						<thead>
							<tr class="border-b border-gray-200">
								<th class="px-3 py-2 text-left font-medium text-gray-600">Día</th>
								<th class="px-3 py-2 text-left font-medium text-gray-600">Talla (mm)</th>
								<th class="px-3 py-2 text-left font-medium text-gray-600">Predicción (mm)</th>
								<th class="px-3 py-2 text-left font-medium text-gray-600">Error (mm)</th>
							</tr>
						</thead>
						<tbody>
							{#each getDiasArray(record.puntosJson) as { dia, talla }}
								{@const prediccion = calcularPrediccion(
									record.parametrosCalculados.L,
									record.parametrosCalculados.k,
									record.parametrosCalculados.x0,
									dia
								)}
								{@const error = Math.abs(talla - prediccion)}
								<tr class="border-b border-gray-100">
									<td class="px-3 py-2">{dia}</td>
									<td class="px-3 py-2">{talla.toFixed(2)}</td>
									<td class="px-3 py-2">{prediccion.toFixed(2)}</td>
									<td class="px-3 py-2 {getErrorClass(error)}">{error.toFixed(2)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				{#if record.metadatos}
					<div class="mt-3 text-xs text-gray-500">
						<span class="font-medium">Metadatos:</span>
						{record.metadatos.origen || 'N/A'}
					</div>
				{/if}
			</div>
		</td>
	</tr>
{/if}