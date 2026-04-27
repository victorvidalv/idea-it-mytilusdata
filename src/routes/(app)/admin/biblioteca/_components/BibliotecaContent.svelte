<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { BibliotecaRecord } from '$lib/server/biblioteca/queries';

	export let records: BibliotecaRecord[];
	export let onSubmit: SubmitFunction;
	export let isLoading = false;

	let expandedId: number | null = null;

	function toggleExpand(id: number) {
		expandedId = expandedId === id ? null : id;
	}

	function formatFecha(fecha: Date | null): string {
		if (!fecha) return '-';
		return new Date(fecha).toLocaleDateString('es-CL', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatNumero(valor: number | undefined | null, decimales = 4): string {
		if (valor === undefined || valor === null) return '-';
		return valor.toFixed(decimales);
	}

	function getPuntosCount(puntosJson: BibliotecaRecord['puntosJson']): number {
		return Object.keys(puntosJson).length;
	}

	function getDiasArray(puntosJson: BibliotecaRecord['puntosJson']): { dia: number; talla: number }[] {
		return Object.entries(puntosJson)
			.map(([dia, talla]) => ({ dia: parseInt(dia, 10), talla }))
			.sort((a, b) => a.dia - b.dia);
	}

	function handleDelete(event: Event): void {
		if (!confirm('¿Estás seguro de eliminar este registro?')) {
			event.preventDefault();
		}
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
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Código
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Ciclo ID
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Puntos
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							L (asíntota)
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							k (tasa)
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							x₀ (punto inflexión)
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							R²
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Fecha
						</th>
						<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
							Acciones
						</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each records as record (record.id)}
						<tr class="hover:bg-gray-50 cursor-pointer" onclick={() => toggleExpand(record.id)}>
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
								<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {record.parametrosCalculados.r2 && record.parametrosCalculados.r2 >= 0.85 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
									{formatNumero(record.parametrosCalculados.r2, 3)}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								{formatFecha(record.createdAt)}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
								<form method="POST" action="?/delete" onclick={(e) => e.stopPropagation()} onsubmit={handleDelete}>
									<input type="hidden" name="id" value={record.id} />
									<button
										type="submit"
										class="text-red-600 hover:text-red-900"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
										</svg>
									</button>
								</form>
							</td>
						</tr>
						{#if expandedId === record.id}
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
														{@const prediccion = record.parametrosCalculados.L / (1 + Math.exp(-record.parametrosCalculados.k * (dia - record.parametrosCalculados.x0)))}
														{@const error = Math.abs(talla - prediccion)}
														<tr class="border-b border-gray-100">
															<td class="px-3 py-2">{dia}</td>
															<td class="px-3 py-2">{talla.toFixed(2)}</td>
															<td class="px-3 py-2">{prediccion.toFixed(2)}</td>
															<td class="px-3 py-2 {error > 5 ? 'text-red-600' : 'text-green-600'}">{error.toFixed(2)}</td>
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
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>