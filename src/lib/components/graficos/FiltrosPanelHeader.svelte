<script lang="ts">
	import type { Usuario } from './types';

	export let isInvestigador: boolean = false;
	export let usuarios: Usuario[] | undefined = undefined;
	export let selectedUserId: string;
</script>

<div class="animate-fade-up flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
	<div>
		<p class="mb-2 font-body text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
			{isInvestigador ? 'Área Investigador' : 'Análisis Visual'}
		</p>
		<h1 class="font-display text-3xl leading-tight text-foreground md:text-4xl">
			{#if isInvestigador}
				Análisis y <span class="text-gradient-ocean">Gráficos Globales</span>
			{:else}
				<span class="text-gradient-ocean">Gráficos</span> de Datos
			{/if}
		</h1>
		<p class="mt-2 font-body text-sm text-muted-foreground">
			{#if isInvestigador}
				Visualiza la evolución de las mediciones filtradas por usuario a lo largo del tiempo
			{:else}
				Visualiza la evolución de tus mediciones a lo largo del tiempo
			{/if}
		</p>
	</div>
	<div class="sm:self-end">
		{#if isInvestigador && usuarios}
			<select
				bind:value={selectedUserId}
				class="w-full rounded-xl border border-border bg-background px-4 py-2 font-body text-sm text-foreground focus:border-teal-glow focus:ring-1 focus:ring-teal-glow focus:outline-none sm:w-64"
			>
				<option value="">Selecciona un Usuario</option>
				<option value="all">Todos los Usuarios</option>
				{#each usuarios as usr (usr.id)}
					<option value={usr.id.toString()}>{usr.nombre}</option>
				{/each}
			</select>
		{/if}
	</div>
</div>