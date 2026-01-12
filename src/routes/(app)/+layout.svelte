<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';

	export let data: any;
	
	const links = [
		{ href: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
		{ href: '/centros', label: 'Centros de Cultivo', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
		{ href: '/ciclos', label: 'Ciclos Productivos', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
		{ href: '/registros', label: 'Registros y Datos', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
	];

	const adminLinks = [
		{ href: '/admin/usuarios', label: 'Usuarios', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
		{ href: '/admin/tipos-medicion', label: 'Tipos de Medida', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
		{ href: '/admin/origenes', label: 'Orígenes de Datos', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' }
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

<div class="min-h-screen flex bg-background">
	<!-- Sidebar -->
	<aside
		class="bg-ocean-gradient border-r border-white/[0.06] hidden md:flex flex-col flex-shrink-0 relative overflow-hidden transition-all duration-300 ease-in-out {sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'}"
	>
		<!-- Fondo sutil -->
		<div class="absolute inset-0 bg-ocean-mesh pointer-events-none"></div>
		

		<!-- Logo -->
		<div class="relative z-10 p-5 flex items-center gap-3 {sidebarCollapsed ? 'justify-center px-3' : ''}">
			<div class="h-9 w-9 rounded-xl bg-white/10 glass flex items-center justify-center flex-shrink-0">
				<div class="h-4 w-4 bg-white/80 rounded-sm"></div>
			</div>
			{#if !sidebarCollapsed}
				<div class="overflow-hidden">
					<span class="font-display text-white text-lg leading-none whitespace-nowrap">Idea 2025</span>
					<p class="text-[10px] text-white/30 font-body mt-0.5 tracking-wider uppercase whitespace-nowrap">Mitilicultura</p>
				</div>
			{/if}
		</div>

		<!-- Navegación principal -->
		<nav class="relative z-10 flex-1 px-3 py-4 space-y-0.5">
			<p class="px-3 pb-2 text-[10px] font-body font-semibold text-white/25 uppercase tracking-[0.2em] {sidebarCollapsed ? 'sr-only' : ''}">Principal</p>
			{#each links as link, i}
				<a
					href={link.href}
					class="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium transition-all duration-200 {sidebarCollapsed ? 'justify-center' : ''}
						{$page.url.pathname.startsWith(link.href)
							? 'bg-white/10 text-white shadow-sm shadow-black/10'
							: 'text-white/50 hover:text-white/80 hover:bg-white/[0.05]'}"
					title={sidebarCollapsed ? link.label : ''}
				>
					<svg class="w-[18px] h-[18px] flex-shrink-0 transition-colors duration-200 {$page.url.pathname.startsWith(link.href) ? 'text-teal-glow' : 'text-white/30 group-hover:text-white/50'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d={link.icon} />
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
				<div class="pt-5 mt-5 border-t border-white/[0.06]">
					<p class="px-3 pb-2 text-[10px] font-body font-semibold text-white/25 uppercase tracking-[0.2em] {sidebarCollapsed ? 'sr-only' : ''}">Administración</p>
					{#each adminLinks as adminLink}
						<a
							href={adminLink.href}
							class="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium transition-all duration-200 {sidebarCollapsed ? 'justify-center' : ''}
								{$page.url.pathname.startsWith(adminLink.href)
									? 'bg-red-500/15 text-red-300 shadow-sm shadow-black/10'
									: 'text-white/50 hover:text-red-300/80 hover:bg-red-500/[0.06]'}"
							title={sidebarCollapsed ? adminLink.label : ''}
						>
							<svg class="w-[18px] h-[18px] flex-shrink-0 transition-colors {$page.url.pathname.startsWith(adminLink.href) ? 'text-red-400' : 'text-white/30 group-hover:text-red-400/60'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d={adminLink.icon} />
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
		<div class="relative z-10 p-4 border-t border-white/[0.06] flex flex-col gap-2 {sidebarCollapsed ? 'items-center' : ''}">
			<!-- Ahora es un link clickeable hacia la configuración -->
			<a href="/perfil" class="flex items-center gap-3 p-1 rounded-xl hover:bg-white/[0.05] transition-colors group cursor-pointer {sidebarCollapsed ? 'justify-center' : ''}">
				<div class="h-9 w-9 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors flex items-center justify-center text-sm font-display text-white/80 flex-shrink-0 shadow-sm" title={sidebarCollapsed ? data.user?.nombre || 'Usuario' : ''}>
					{data.user?.nombre?.charAt(0).toUpperCase() || 'U'}
				</div>
				{#if !sidebarCollapsed}
					<div class="flex-1 min-w-0 overflow-hidden">
						<p class="text-sm font-body font-medium text-white/90 truncate group-hover:text-white transition-colors">{data.user?.nombre || 'Usuario'}</p>
						<p class="text-[11px] font-body text-white/30 truncate">{data.user?.email || ''}</p>
						<span class="text-[10px] font-body font-semibold {rolStyle[data.user?.rol]?.color || 'text-white/40'}">
							{rolStyle[data.user?.rol]?.label || 'Usuario'}
						</span>
					</div>
					<svg class="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors shrink-0 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
					</svg>
				{/if}
			</a>
			<form method="POST" action="/auth/logout" class="w-full">
				<button
					type="submit"
					class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-body font-medium text-white/40 border border-white/[0.08] hover:bg-white/[0.05] hover:text-white/60 hover:border-white/15 transition-all duration-200"
					title={sidebarCollapsed ? 'Cerrar Sesión' : ''}
				>
					<svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
					</svg>
					{#if !sidebarCollapsed}
						<span>Cerrar Sesión</span>
					{/if}
				</button>
			</form>
		</div>

		<!-- Botón de toggle (Bottom) -->
		<div class="relative z-10 p-2 border-t border-white/[0.06] flex {sidebarCollapsed ? 'justify-center' : 'justify-end'}">
			<button
				onclick={toggleSidebar}
				class="h-8 w-8 rounded-lg bg-white/[0.03] hover:bg-white/10 border border-white/[0.05] flex items-center justify-center text-white/40 hover:text-white transition-all duration-200"
				aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
				title={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
			>
				<svg class="w-4 h-4 transition-transform duration-300 {sidebarCollapsed ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
			</button>
		</div>
	</aside>

	<!-- Contenido principal -->
	<main class="flex-1 flex flex-col min-h-0 overflow-hidden">
		<!-- Header mobile -->
		<header class="h-14 border-b border-border bg-background flex md:hidden items-center justify-between px-4">
			<button 
				class="p-1.5 rounded-lg hover:bg-secondary transition-colors"
				onclick={() => mobileMenuOpen = !mobileMenuOpen}
				aria-label="Abrir menú de navegación"
			>
				<svg class="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			</button>
			<div class="flex items-center gap-2">
				<div class="h-6 w-6 rounded-lg bg-ocean-gradient flex items-center justify-center">
					<div class="h-3 w-3 bg-white/80 rounded-sm"></div>
				</div>
				<span class="font-display text-base">Idea 2025</span>
			</div>
			<div class="h-8 w-8 rounded-xl bg-secondary flex items-center justify-center text-xs font-display">
				{data.user?.nombre?.charAt(0).toUpperCase() || 'U'}
			</div>
		</header>

		<!-- Menú mobile overlay -->
		{#if mobileMenuOpen}
			<div 
				class="fixed inset-0 z-50 bg-black/60 md:hidden animate-fade-in" 
				onclick={() => mobileMenuOpen = false}
				onkeypress={() => {}}
				role="button"
				tabindex="-1"
			>
				<div class="w-[280px] h-full bg-ocean-gradient p-4 animate-slide-in-left" onclick={(e) => e.stopPropagation()} onkeypress={() => {}} role="presentation">
					<nav class="space-y-1 mt-4">
						{#each links as link}
							<a 
								href={link.href}
								class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body text-white/70 hover:bg-white/10 transition-colors"
								onclick={() => mobileMenuOpen = false}
							>
								<svg class="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d={link.icon} />
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
