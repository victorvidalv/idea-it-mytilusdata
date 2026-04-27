<script lang="ts">
	import { enhance } from '$app/forms';

	export let ciclo: {
		id: number;
		activo: boolean | null;
		nombre: string;
		lugarNombre: string;
		fechaSiembra: string | null;
		fechaFinalizacion: string | null;
		isOwner: boolean;
	};
	export let canViewAll: boolean;
	export let formatDate: (d: string | null) => string;
	export let diasCultivo: (s: string | null, f: string | null) => string;
</script>

<tr class="group transition-colors hover:bg-secondary/20">
	<td class="px-5 py-3 text-center">
		<span class="font-mono text-sm text-muted-foreground">{ciclo.id}</span>
	</td>
	<td class="px-5 py-3">
		{#if ciclo.activo}
			<span
				class="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-600 dark:bg-teal-900/20 dark:text-teal-400"
			>
				<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500"></span>
				Activo
			</span>
		{:else}
			<span
				class="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
			>
				Finalizado
			</span>
		{/if}
	</td>
	<td class="px-5 py-3 font-medium text-foreground">{ciclo.nombre}</td>
	<td class="px-5 py-3 text-muted-foreground">
		<div class="flex items-center gap-1.5">
			<svg
				class="h-3.5 w-3.5 text-ocean-light/60"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
				/>
			</svg>
			{ciclo.lugarNombre}
		</div>
	</td>
	<td class="px-5 py-3 whitespace-nowrap text-muted-foreground">
		{formatDate(ciclo.fechaSiembra)}
		{#if ciclo.fechaFinalizacion}
			<span class="mx-1 text-muted-foreground/40">→</span>
			{formatDate(ciclo.fechaFinalizacion)}
		{/if}
	</td>
	<td class="px-5 py-3 text-center">
		<span class="font-medium text-ocean-light tabular-nums"
			>{diasCultivo(ciclo.fechaSiembra, ciclo.fechaFinalizacion)}</span
		>
	</td>
	<td class="px-5 py-3">
		{#if ciclo.isOwner}
			<div
				class="flex items-center justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100"
			>
				<form method="POST" action="?/toggleActive" use:enhance class="inline">
					<input type="hidden" name="cicloId" value={ciclo.id} />
					<input type="hidden" name="activo" value={!ciclo.activo} />
					<button
						type="submit"
						class="rounded-md px-2.5 py-1 font-body text-[11px] font-medium transition-all
						{ciclo.activo
							? 'text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/15'
							: 'text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/15'}"
					>
						{ciclo.activo ? 'Finalizar' : 'Reactivar'}
					</button>
				</form>
				<form
					method="POST"
					action="?/delete"
					use:enhance={() => {
						return async ({ update }) => {
							await update();
						};
					}}
					class="inline"
				>
					<input type="hidden" name="cicloId" value={ciclo.id} />
					<button
						type="submit"
						class="rounded-md p-1.5 text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500"
						title="Eliminar ciclo"
						onclick={(e) => {
							if (!confirm('¿Seguro que deseas eliminar este ciclo y todos sus datos asociados?'))
								e.preventDefault();
						}}
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							/></svg
						>
					</button>
				</form>
			</div>
		{:else if canViewAll}
			<div class="flex justify-end">
				<span class="font-body text-[10px] text-muted-foreground/50">Otro usuario</span>
			</div>
		{/if}
	</td>
</tr>
