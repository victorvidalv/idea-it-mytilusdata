<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';

	export let data: any;

	const links = [
		{
			href: '/dashboard',
			label: 'Dashboard',
			icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
		},
		{
			href: '/centros',
			label: 'Centros de Cultivo',
			icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
		},
		{
			href: '/ciclos',
			label: 'Ciclos Productivos',
			icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
		},
		{
			href: '/registros',
			label: 'Registros y Datos',
			icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
		},
		{
			href: '/perfil/api-keys',
			label: 'Acceso API',
			icon: 'M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z'
		}
	];

	const adminLinks = [
		{
			href: '/admin/usuarios',
			label: 'Usuarios',
			icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
		},
		{
			href: '/admin/tipos-medicion',
			label: 'Tipos de Medida',
			icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
		},
		{
			href: '/admin/origenes',
			label: 'Orígenes de Datos',
			icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
		}
	];

	// Estado del menú mobile
	let mobileMenuOpen = false;

	// Estado del sidebar colapsado
	let sidebarCollapsed = false;

	// Función para toggle del sidebar
	function toggleSidebar() {
		sidebarCollapsed = !sidebarCollapsed;
	}

	// Mapa de colores para roles
	const rolStyle: Record<string, { color: string; label: string }> = {
		ADMIN: { color: 'text-red-400', label: 'Administrador' },
		INVESTIGADOR: { color: 'text-teal-glow', label: 'Investigador' },
		USUARIO: { color: 'text-white/40', label: 'Usuario' }
	};
</script>

<div class="flex min-h-screen bg-background">
	<!-- Sidebar -->
	<aside
		class="bg-ocean-gradient relative hidden flex-shrink-0 flex-col overflow-hidden border-r border-white/[0.06] transition-all duration-300 ease-in-out md:flex {sidebarCollapsed
			? 'w-[72px]'
			: 'w-[260px]'}"
	>
		<!-- Fondo sutil -->
		<div class="bg-ocean-mesh pointer-events-none absolute inset-0"></div>

		<!-- Logo -->
		<div
			class="relative z-10 flex items-center gap-3 p-5 {sidebarCollapsed
				? 'justify-center px-3'
				: ''}"
		>
			<div
				class="glass flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/10"
			>
				<div class="h-4 w-4 rounded-sm bg-white/80"></div>
			</div>
			{#if !sidebarCollapsed}
				<div class="overflow-hidden">
					<span class="font-display text-lg leading-none whitespace-nowrap text-white"
						>Idea 2025</span
					>
					<p
						class="mt-0.5 font-body text-[10px] tracking-wider whitespace-nowrap text-white/30 uppercase"
					>
						Mitilicultura
					</p>
				</div>
			{/if}
		</div>

		<!-- Navegación principal -->
		<nav class="relative z-10 flex-1 space-y-0.5 px-3 py-4">
			<p
				class="px-3 pb-2 font-body text-[10px] font-semibold tracking-[0.2em] text-white/25 uppercase {sidebarCollapsed
					? 'sr-only'
					: ''}"
			>
				Principal
			</p>
			{#each links as link, i}
				<a
					href={link.href}
					class="group flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm font-medium transition-all duration-200 {sidebarCollapsed
						? 'justify-center'
						: ''}
						{$page.url.pathname.startsWith(link.href)
						? 'bg-white/10 text-white shadow-sm shadow-black/10'
						: 'text-white/50 hover:bg-white/[0.05] hover:text-white/80'}"
					title={sidebarCollapsed ? link.label : ''}
				>
					<svg
						class="h-[18px] w-[18px] flex-shrink-0 transition-colors duration-200 {$page.url.pathname.startsWith(
							link.href
						)
							? 'text-teal-glow'
							: 'text-white/30 group-hover:text-white/50'}"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.75"
							d={link.icon}
						/>
					</svg>
					{#if !sidebarCollapsed}
						<span class="whitespace-nowrap">{link.label}</span>
						{#if $page.url.pathname.startsWith(link.href)}
							<div class="ml-auto h-1.5 w-1.5 rounded-full bg-teal-glow"></div>
						{/if}
					{/if}
				</a>
			{/each}

			{#if data.user?.rol === 'ADMIN'}
				<div class="mt-5 border-t border-white/[0.06] pt-5">
					<p
						class="px-3 pb-2 font-body text-[10px] font-semibold tracking-[0.2em] text-white/25 uppercase {sidebarCollapsed
							? 'sr-only'
							: ''}"
					>
						Administración
					</p>
					{#each adminLinks as adminLink}
						<a
							href={adminLink.href}
							class="group flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm font-medium transition-all duration-200 {sidebarCollapsed
								? 'justify-center'
								: ''}
								{$page.url.pathname.startsWith(adminLink.href)
								? 'bg-red-500/15 text-red-300 shadow-sm shadow-black/10'
								: 'text-white/50 hover:bg-red-500/[0.06] hover:text-red-300/80'}"
							title={sidebarCollapsed ? adminLink.label : ''}
						>
							<svg
								class="h-[18px] w-[18px] flex-shrink-0 transition-colors {$page.url.pathname.startsWith(
									adminLink.href
								)
									? 'text-red-400'
									: 'text-white/30 group-hover:text-red-400/60'}"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.75"
									d={adminLink.icon}
								/>
							</svg>
							{#if !sidebarCollapsed}
								<span class="whitespace-nowrap">{adminLink.label}</span>
							{/if}
						</a>
					{/each}
				</div>
			{/if}
		</nav>

		<!-- Perfil de usuario -->
		<div
			class="relative z-10 flex flex-col gap-2 border-t border-white/[0.06] p-4 {sidebarCollapsed
				? 'items-center'
				: ''}"
		>
			<!-- Ahora es un link clickeable hacia la configuración -->
			<a
				href="/perfil"
				class="group flex cursor-pointer items-center gap-3 rounded-xl p-1 transition-colors hover:bg-white/[0.05] {sidebarCollapsed
					? 'justify-center'
					: ''}"
			>
				<div
					class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 font-display text-sm text-white/80 shadow-sm transition-colors group-hover:bg-white/20"
					title={sidebarCollapsed ? data.user?.nombre || 'Usuario' : ''}
				>
					{data.user?.nombre?.charAt(0).toUpperCase() || 'U'}
				</div>
				{#if !sidebarCollapsed}
					<div class="min-w-0 flex-1 overflow-hidden">
						<p
							class="truncate font-body text-sm font-medium text-white/90 transition-colors group-hover:text-white"
						>
							{data.user?.nombre || 'Usuario'}
						</p>
						<p class="truncate font-body text-[11px] text-white/30">{data.user?.email || ''}</p>
						<span
							class="font-body text-[10px] font-semibold {rolStyle[data.user?.rol]?.color ||
								'text-white/40'}"
						>
							{rolStyle[data.user?.rol]?.label || 'Usuario'}
						</span>
					</div>
					<svg
						class="mr-1 h-4 w-4 shrink-0 text-white/20 transition-colors group-hover:text-white/60"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
						/>
					</svg>
				{/if}
			</a>
			<form method="POST" action="/auth/logout" class="w-full">
				<button
					type="submit"
					class="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 font-body text-xs font-medium text-white/40 transition-all duration-200 hover:border-white/15 hover:bg-white/[0.05] hover:text-white/60"
					title={sidebarCollapsed ? 'Cerrar Sesión' : ''}
				>
					<svg
						class="h-3.5 w-3.5 flex-shrink-0"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
						/>
					</svg>
					{#if !sidebarCollapsed}
						<span>Cerrar Sesión</span>
					{/if}
				</button>
			</form>
		</div>

		<!-- Botón de toggle (Bottom) -->
		<div
			class="relative z-10 flex border-t border-white/[0.06] p-2 {sidebarCollapsed
				? 'justify-center'
				: 'justify-end'}"
		>
			<button
				onclick={toggleSidebar}
				class="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.05] bg-white/[0.03] text-white/40 transition-all duration-200 hover:bg-white/10 hover:text-white"
				aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
				title={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
			>
				<svg
					class="h-4 w-4 transition-transform duration-300 {sidebarCollapsed ? 'rotate-180' : ''}"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
			</button>
		</div>
	</aside>

	<!-- Contenido principal -->
	<main class="flex min-h-0 flex-1 flex-col overflow-hidden">
		<!-- Header mobile -->
		<header
			class="flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden"
		>
			<button
				class="rounded-lg p-1.5 transition-colors hover:bg-secondary"
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
				aria-label="Abrir menú de navegación"
			>
				<svg class="h-5 w-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
			</button>
			<div class="flex items-center gap-2">
				<div class="bg-ocean-gradient flex h-6 w-6 items-center justify-center rounded-lg">
					<div class="h-3 w-3 rounded-sm bg-white/80"></div>
				</div>
				<span class="font-display text-base">Idea 2025</span>
			</div>
			<div
				class="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary font-display text-xs"
			>
				{data.user?.nombre?.charAt(0).toUpperCase() || 'U'}
			</div>
		</header>

		<!-- Menú mobile overlay -->
		{#if mobileMenuOpen}
			<div
				class="animate-fade-in fixed inset-0 z-50 bg-black/60 md:hidden"
				onclick={() => (mobileMenuOpen = false)}
				onkeypress={() => {}}
				role="button"
				tabindex="-1"
			>
				<div
					class="bg-ocean-gradient animate-slide-in-left h-full w-[280px] p-4"
					onclick={(e) => e.stopPropagation()}
					onkeypress={() => {}}
					role="presentation"
				>
					<nav class="mt-4 space-y-1">
						{#each links as link}
							<a
								href={link.href}
								class="flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-white/70 transition-colors hover:bg-white/10"
								onclick={() => (mobileMenuOpen = false)}
							>
								<svg
									class="h-5 w-5 text-white/40"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="1.75"
										d={link.icon}
									/>
								</svg>
								{link.label}
							</a>
						{/each}
					</nav>
				</div>
			</div>
		{/if}

		<!-- Área de contenido con scroll -->
		<div class="flex-1 overflow-auto p-5 md:p-8 lg:p-10">
			<slot />
		</div>
	</main>
</div>
