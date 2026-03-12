<script lang="ts">
	import { enhance } from '$app/forms';
	import { getRolConfig, type RolKey } from './rolConfig';

	export let usuario: {
		id: number;
		nombre: string | null;
		email: string;
		rol: string | null;
		activo: boolean | null;
		createdAt: string | null;
	};
	export let currentUserId: number | undefined;

	$: isCurrentUser = usuario.id === currentUserId;
	$: config = getRolConfig(usuario.rol);

	function formatDate(date: string | null): string {
		if (!date) return '—';
		return new Date(date).toLocaleDateString('es-CL', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<tr class="group border-b border-border/30 transition-colors duration-150 last:border-0 hover:bg-secondary/30">
	<!-- Info del usuario -->
	<td class="px-6 py-4">
		<div class="flex items-center gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-xl bg-ocean-mid/10 font-display text-xs {isCurrentUser
					? 'text-ocean-light ring-2 ring-ocean-light/20'
					: 'text-ocean-mid'}"
			>
				{usuario.nombre?.charAt(0).toUpperCase() || 'U'}
			</div>
			<div class="min-w-0">
				<p class="truncate font-medium text-foreground">
					{usuario.nombre}
					{#if isCurrentUser}
						<span class="ml-1 font-body text-[10px] text-ocean-light">(tú)</span>
					{/if}
				</p>
				<p class="truncate text-xs text-muted-foreground">{usuario.email}</p>
			</div>
		</div>
	</td>

	<!-- Rol -->
	<td class="px-4 py-4">
		{#if !isCurrentUser}
			<form method="POST" action="?/updateRole" use:enhance class="inline">
				<input type="hidden" name="userId" value={usuario.id} />
				<select
					name="rol"
					class="cursor-pointer rounded-lg border px-3 py-1.5 font-body text-xs font-semibold transition-all duration-200 hover:shadow-sm {config.bg} {config.color}"
					value={usuario.rol ?? 'USUARIO'}
					on:change={(e) => e.currentTarget.form?.requestSubmit()}
				>
					<option value="USUARIO">Usuario</option>
					<option value="INVESTIGADOR">Investigador</option>
					<option value="ADMIN">Administrador</option>
				</select>
			</form>
		{:else}
			<span class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-body text-xs font-semibold {config.bg} {config.color}">
				<span class="h-1.5 w-1.5 rounded-full {config.dot}"></span>
				{config.label}
			</span>
		{/if}
	</td>

	<!-- Estado -->
	<td class="px-4 py-4">
		{#if usuario.activo}
			<span class="inline-flex items-center gap-1.5 font-body text-xs font-medium text-green-600 dark:text-green-400">
				<span class="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
				Activo
			</span>
		{:else}
			<span class="inline-flex items-center gap-1.5 font-body text-xs font-medium text-muted-foreground">
				<span class="h-2 w-2 rounded-full bg-muted-foreground/40"></span>
				Inactivo
			</span>
		{/if}
	</td>

	<!-- Fecha -->
	<td class="px-4 py-4 font-body text-xs text-muted-foreground">
		{formatDate(usuario.createdAt)}
	</td>

	<!-- Acciones -->
	<td class="px-6 py-4 text-right">
		{#if !isCurrentUser}
			<form method="POST" action="?/toggleActive" use:enhance class="inline">
				<input type="hidden" name="userId" value={usuario.id} />
				<input type="hidden" name="activo" value={!usuario.activo} />
				<button
					type="submit"
					class="rounded-lg px-3 py-1.5 font-body text-xs font-medium transition-all duration-200
						{usuario.activo
						? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/15'
						: 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/15'}"
				>
					{usuario.activo ? 'Desactivar' : 'Activar'}
				</button>
			</form>
		{:else}
			<span class="text-xs text-muted-foreground/40">—</span>
		{/if}
	</td>
</tr>