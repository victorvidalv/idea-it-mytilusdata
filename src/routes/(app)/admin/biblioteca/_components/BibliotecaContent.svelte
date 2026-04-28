<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { BibliotecaRecord } from '$lib/server/biblioteca/queries';
	import BibliotecaRow from './BibliotecaRow.svelte';

	export let records: BibliotecaRecord[];
	export let onSubmit: SubmitFunction;
	export let isLoading = false;

	let expandedId: number | null = null;

	function toggleExpand(id: number) {
		expandedId = expandedId === id ? null : id;
	}
</script>

<div class="space-y-6">
	<!-- Header con botón poblar -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900">Biblioteca de Curvas</h1>
			<p class="text-sm text-gray-500 mt-1">
				Parámetros sigmoidales calculados a partir de mediciones de talla/longitud
			</p>
		</div>
		<form method="POST" action="?/poblar" use:enhance={onSubmit}>
			<button
				type="submit"
				disabled={isLoading}
				class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				{#if isLoading}
					<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Procesando...
				{:else}
					<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
					</svg>
					Poblar Biblioteca
				{/if}
			</button>
		</form>
	</div>

	<!-- Tabla de registros -->
	{#if records.length === 0}
		<div class="bg-white rounded-lg shadow p-8 text-center">
			<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
			</svg>
			<h3 class="mt-2 text-sm font-medium text-gray-900">Sin registros</h3>
			<p class="mt-1 text-sm text-gray-500">
				No hay registros en la biblioteca. Haz clic en "Poblar Biblioteca" para generar curvas.
			</p>
		</div>
	{:else}
		<div class="bg-white shadow overflow-hidden sm:rounded-lg">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ciclo ID</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntos</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">L (asíntota)</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">k (tasa)</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">x₀ (punto inflexión)</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">R²</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
						<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each records as record (record.id)}
						<BibliotecaRow
							{record}
							isExpanded={expandedId === record.id}
							onToggle={() => toggleExpand(record.id)}
						/>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>