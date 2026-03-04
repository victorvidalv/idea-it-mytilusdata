<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { Stats, Registro, TipoEstadistica } from './types';

	export let isInvestigador: boolean = false;
	export let stats: Stats;
	export let ultimaMedicion: Registro | null;

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('es-CL', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

{#if stats.total > 0}
	<div class="animate-fade-up delay-200">
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<!-- Total de mediciones -->
			<div class="card-hover group">
				<Card.Root class="border-border/50 transition-colors duration-300 hover:border-border">
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Card.Title class="font-body text-sm font-medium text-muted-foreground">
							{isInvestigador ? 'Total Mediciones Visualizadas' : 'Total Mediciones'}
						</Card.Title>
						<div
							class="flex h-9 w-9 items-center justify-center rounded-xl bg-ocean-light/10 transition-transform duration-300 group-hover:scale-110"
						>
							<svg
								class="h-[18px] w-[18px] text-ocean-light"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.75"
									d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
						</div>
					</Card.Header>
					<Card.Content>
						<div class="font-display text-3xl text-foreground">{stats.total}</div>
						<p class="mt-1 font-body text-xs text-muted-foreground">
							{isInvestigador ? 'registros filtrados' : 'registros visualizados'}
						</p>
					</Card.Content>
				</Card.Root>
			</div>

			<!-- Última medición -->
			{#if ultimaMedicion}
				<div class="card-hover group">
					<Card.Root class="border-border/50 transition-colors duration-300 hover:border-border">
						<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
							<Card.Title class="font-body text-sm font-medium text-muted-foreground"
								>Última Medición</Card.Title
							>
							<div
								class="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-glow/10 transition-transform duration-300 group-hover:scale-110"
							>
								<svg
									class="h-[18px] w-[18px] text-teal-glow"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="1.75"
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
						</Card.Header>
						<Card.Content>
							<div class="font-display text-xl text-foreground">
								{ultimaMedicion.valor}
								{ultimaMedicion.tipoUnidad}
							</div>
							<p class="mt-1 font-body text-xs text-muted-foreground">
								{ultimaMedicion.tipoCodigo} · {formatDate(ultimaMedicion.fechaMedicion)}
							</p>
						</Card.Content>
					</Card.Root>
				</div>
			{/if}

			<!-- Stats por tipo -->
			{#each stats.porTipo.slice(0, 2) as tipoStat (tipoStat.codigo)}
				<div class="card-hover group">
					<Card.Root class="border-border/50 transition-colors duration-300 hover:border-border">
						<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
							<Card.Title class="font-body text-sm font-medium text-muted-foreground"
								>{tipoStat.codigo}</Card.Title
							>
							<span
								class="rounded-md bg-secondary px-1.5 py-0.5 font-body text-[10px] font-semibold text-muted-foreground"
							>
								{tipoStat.unidad}
							</span>
						</Card.Header>
						<Card.Content>
							<div class="font-display text-xl text-foreground">x̄ {tipoStat.promedio}</div>
							<div class="mt-1.5 flex items-center gap-3 font-body text-xs text-muted-foreground">
								<span class="flex items-center gap-1">
									<svg
										class="h-3 w-3 text-teal-glow"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 15l7-7 7 7"
										/>
									</svg>
									Max: {tipoStat.max}
								</span>
								<span class="flex items-center gap-1">
									<svg
										class="h-3 w-3 text-destructive"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M19 9l-7 7-7-7"
										/>
									</svg>
									Min: {tipoStat.min}
								</span>
								<span class="opacity-60">{tipoStat.cuenta} reg.</span>
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			{/each}
		</div>
	</div>

	<!-- Tabla de resumen completa si hay más de 2 tipos -->
	{#if stats.porTipo.length > 2}
		<div class="animate-fade-up delay-300">
			<Card.Root class="border-border/50">
				<Card.Header>
					<Card.Title class="font-display text-lg">Resumen por Tipo de Medición</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="overflow-x-auto">
						<table class="w-full font-body text-sm">
							<thead>
								<tr class="border-b border-border/50">
									<th class="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Tipo</th>
									<th class="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Registros</th>
									<th class="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Promedio</th>
									<th class="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Mínimo</th>
									<th class="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Máximo</th>
								</tr>
							</thead>
							<tbody>
								{#each stats.porTipo as tipoStat (tipoStat.codigo)}
									<tr class="border-b border-border/30 transition-colors hover:bg-secondary/30">
										<td class="px-3 py-2.5 font-medium text-foreground">
											{tipoStat.codigo}
											<span class="ml-1 text-xs text-muted-foreground">({tipoStat.unidad})</span>
										</td>
										<td class="px-3 py-2.5 text-right text-muted-foreground">{tipoStat.cuenta}</td>
										<td class="px-3 py-2.5 text-right font-medium text-foreground">{tipoStat.promedio}</td>
										<td class="px-3 py-2.5 text-right text-muted-foreground">{tipoStat.min}</td>
										<td class="px-3 py-2.5 text-right text-muted-foreground">{tipoStat.max}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}
{/if}