<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';

	export let data: any;
	export let form: any;

	let showForm = false;

	$: if (form?.success) {
		toast.success('¡Operación exitosa!', { description: form?.message });
		showForm = false;
	} else if (form?.error) {
		toast.error('Error', { description: form?.message });
	}

	// Estadísticas
	$: activos = data.ciclos.filter((c: any) => c.activo).length;
	$: finalizados = data.ciclos.filter((c: any) => !c.activo).length;

	// Formatear fecha
	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '—';
		return new Date(dateStr).toLocaleDateString('es-CL', { 
			day: '2-digit', month: 'short', year: 'numeric' 
		});
	}

	// Calcular días de cultivo
	function diasCultivo(fechaSiembra: string | null, fechaFin: string | null): string {
		if (!fechaSiembra) return '—';
		const inicio = new Date(fechaSiembra);
		const fin = fechaFin ? new Date(fechaFin) : new Date();
		const dias = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
		return `${dias}d`;
	}
</script>

<svelte:head>
	<title>Ciclos Productivos | Plataforma Idea 2025</title>
</svelte:head>

<div class="space-y-8">
	<!-- Encabezado -->
	<div class="animate-fade-up flex flex-col sm:flex-row sm:items-end justify-between gap-4">
		<div>
			<p class="text-xs font-body font-medium text-muted-foreground uppercase tracking-[0.2em] mb-2">
				{#if data.canViewAll}Vista General{:else}Mis Ciclos{/if}
			</p>
			<h1 class="text-3xl md:text-4xl font-display text-foreground leading-tight">
				Ciclos <span class="text-gradient-ocean">Productivos</span>
			</h1>
			<p class="text-muted-foreground font-body text-sm mt-2">
				{activos} activo{activos !== 1 ? 's' : ''} · {finalizados} finalizado{finalizados !== 1 ? 's' : ''}
			</p>
		</div>
		<Button 
			onclick={() => showForm = !showForm}
			class="bg-ocean-mid hover:bg-ocean-deep text-white rounded-xl h-10 px-5 font-body text-sm transition-all duration-300 hover:shadow-lg hover:shadow-ocean-mid/20 hover:-translate-y-0.5 self-start sm:self-auto"
			disabled={data.centros.length === 0}
		>
			{#if showForm}
				<svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
				Cancelar
			{:else}
				<svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				Nuevo Ciclo
			{/if}
		</Button>
	</div>

	<!-- Aviso si no hay centros -->
	{#if data.centros.length === 0}
		<div class="animate-fade-up">
			<Card.Root class="border-border/50 bg-ocean-light/[0.04] border-ocean-light/15">
				<Card.Content class="flex items-start gap-3 py-4">
					<div class="h-8 w-8 rounded-xl bg-ocean-light/15 flex items-center justify-center flex-shrink-0">
						<svg class="w-4 h-4 text-ocean-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<div>
						<p class="text-sm font-body font-medium text-foreground">Primero registre un centro</p>
						<p class="text-xs text-muted-foreground font-body mt-0.5">
							Necesita al menos un centro de cultivo para poder crear ciclos productivos.
							<a href="/centros" class="text-ocean-light hover:underline">Ir a Centros →</a>
						</p>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	<!-- Formulario para crear ciclo -->
	{#if showForm && data.centros.length > 0}
		<div class="animate-fade-up">
			<Card.Root class="border-border/50 overflow-hidden">
				<Card.Header>
					<Card.Title class="font-display text-lg">Iniciar Ciclo Productivo</Card.Title>
					<Card.Description class="font-body text-xs">Vincule un nuevo ciclo a un centro de cultivo existente</Card.Description>
				</Card.Header>
				<Card.Content>
					<form method="POST" action="?/create" use:enhance class="space-y-5">
						<div class="grid gap-5 md:grid-cols-3">
							<!-- Nombre del ciclo -->
							<div class="space-y-2">
								<Label for="nombre" class="text-xs font-medium uppercase tracking-wider text-muted-foreground font-body">Nombre del Ciclo</Label>
								<Input 
									id="nombre" 
									name="nombre" 
									type="text" 
									placeholder="Ej: Siembra Primavera 2025"
									required 
									class="h-11 rounded-xl bg-secondary/50 border-border/50 focus:border-ocean-light focus:ring-ocean-light/20 transition-all font-body"
								/>
							</div>

							<!-- Centro de cultivo -->
							<div class="space-y-2">
								<Label for="lugarId" class="text-xs font-medium uppercase tracking-wider text-muted-foreground font-body">Centro de Cultivo</Label>
								<select
									id="lugarId"
									name="lugarId"
									required
									class="w-full h-11 rounded-xl bg-secondary/50 border border-border/50 px-3 text-sm font-body focus:border-ocean-light focus:ring-1 focus:ring-ocean-light/20 transition-all"
								>
									<option value="" disabled selected>Seleccionar centro...</option>
									{#each data.centros as centro (centro.id)}
										<option value={centro.id}>{centro.nombre}</option>
									{/each}
								</select>
							</div>

							<!-- Fecha de siembra -->
							<div class="space-y-2">
								<Label for="fechaSiembra" class="text-xs font-medium uppercase tracking-wider text-muted-foreground font-body">Fecha de Siembra</Label>
								<Input 
									id="fechaSiembra" 
									name="fechaSiembra" 
									type="date"
									required
									class="h-11 rounded-xl bg-secondary/50 border-border/50 focus:border-ocean-light focus:ring-ocean-light/20 transition-all font-body"
								/>
							</div>
						</div>

						<div class="flex justify-end gap-3">
							<Button type="button" variant="outline" onclick={() => showForm = false} class="rounded-xl font-body">
								Cancelar
							</Button>
							<Button 
								type="submit" 
								class="bg-ocean-mid hover:bg-ocean-deep text-white rounded-xl font-body transition-all duration-300 hover:shadow-lg hover:shadow-ocean-mid/20"
							>
								<svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								Iniciar Ciclo
							</Button>
						</div>
					</form>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	<!-- Lista de ciclos -->
	{#if data.ciclos.length === 0 && data.centros.length > 0}
		<div class="animate-fade-up delay-150">
			<Card.Root class="border-border/50 border-dashed">
				<Card.Content class="flex flex-col items-center justify-center py-16">
					<div class="h-16 w-16 rounded-2xl bg-teal-glow/10 flex items-center justify-center mb-4">
						<svg class="w-8 h-8 text-teal-glow/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
					</div>
					<p class="text-sm font-body font-medium text-foreground mb-1">Sin ciclos productivos</p>
					<p class="text-xs text-muted-foreground font-body">Inicie su primer ciclo de cultivo</p>
				</Card.Content>
			</Card.Root>
		</div>
	{:else if data.ciclos.length > 0}
		<div class="space-y-3 animate-fade-up delay-150">
			{#each data.ciclos as ciclo, i (ciclo.id)}
				<div class="card-hover" style="animation-delay: {i * 40}ms">
					<Card.Root class="border-border/50 overflow-hidden group">
						<Card.Content class="py-4">
							<div class="flex items-center gap-4">
								<!-- Indicador de estado -->
								<div class="flex-shrink-0">
									<div class="h-11 w-11 rounded-xl flex items-center justify-center {ciclo.activo ? 'bg-teal-glow/10' : 'bg-secondary/60'}">
										{#if ciclo.activo}
											<div class="h-3 w-3 rounded-full bg-teal-glow animate-pulse"></div>
										{:else}
											<svg class="w-5 h-5 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
											</svg>
										{/if}
									</div>
								</div>

								<!-- Info del ciclo -->
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2 mb-0.5">
										<h3 class="text-sm font-body font-semibold text-foreground truncate">{ciclo.nombre}</h3>
										{#if ciclo.activo}
											<span class="text-[10px] font-body font-semibold text-teal-glow bg-teal-glow/10 px-2 py-0.5 rounded-full flex-shrink-0">Activo</span>
										{:else}
											<span class="text-[10px] font-body font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full flex-shrink-0">Finalizado</span>
										{/if}
									</div>
									<div class="flex items-center gap-3 text-xs text-muted-foreground font-body">
										<span class="inline-flex items-center gap-1">
											<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
											</svg>
											{ciclo.lugarNombre}
										</span>
										<span>|</span>
										<span>Siembra: {formatDate(ciclo.fechaSiembra)}</span>
										{#if ciclo.fechaFinalizacion}
											<span>→ {formatDate(ciclo.fechaFinalizacion)}</span>
										{/if}
										<span class="text-ocean-light font-medium">
											{diasCultivo(ciclo.fechaSiembra, ciclo.fechaFinalizacion)}
										</span>
										{#if !ciclo.isOwner && data.canViewAll}
											<span class="text-ocean-light/60">· Otro usuario</span>
										{/if}
									</div>
								</div>

								<!-- Acciones -->
								{#if ciclo.isOwner}
									<div class="flex items-center gap-1 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
										<form method="POST" action="?/toggleActive" use:enhance class="inline">
											<input type="hidden" name="cicloId" value={ciclo.id} />
											<input type="hidden" name="activo" value={!ciclo.activo} />
											<button 
												type="submit"
												class="text-xs font-body font-medium px-3 py-1.5 rounded-lg transition-all duration-200
													{ciclo.activo 
														? 'text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/15' 
														: 'text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/15'}"
											>
												{ciclo.activo ? 'Finalizar' : 'Reactivar'}
											</button>
										</form>
										<form method="POST" action="?/delete" use:enhance class="inline">
											<input type="hidden" name="cicloId" value={ciclo.id} />
											<button 
												type="submit"
												class="p-1.5 rounded-lg text-muted-foreground/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/15 transition-all"
												title="Eliminar ciclo"
											>
												<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
												</svg>
											</button>
										</form>
									</div>
								{/if}
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			{/each}
		</div>
	{/if}
</div>
