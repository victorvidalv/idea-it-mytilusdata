<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';

	export let data: any;
	
	const links = [
		{ href: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
		{ href: '/centros', label: 'Centros de Cultivo', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
		{ href: '/ciclos', label: 'Ciclos Productivos', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
	];

	// Enlace de administración visible solo para ADMIN
	const adminLink = { href: '/admin/usuarios', label: 'Administrar Usuarios', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' };
</script>

<div class="min-h-screen flex bg-slate-50 dark:bg-slate-950">
	<!-- Sidebar -->
	<aside class="w-64 border-r bg-white dark:bg-slate-900 hidden md:flex flex-col">
		<div class="p-6 border-b flex items-center gap-2">
			<div class="h-6 w-6 rounded-full bg-slate-900 dark:bg-slate-50 flex items-center justify-center">
				<div class="h-3 w-3 bg-white dark:bg-slate-900 rounded-sm"></div>
			</div>
			<span class="font-bold text-lg">Idea 2025</span>
		</div>
		<nav class="flex-1 p-4 space-y-1">
			{#each links as link}
				<a 
					href={link.href} 
					class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors {$page.url.pathname.startsWith(link.href) ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-50'}"
				>
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={link.icon} />
					</svg>
					{link.label}
				</a>
			{/each}

			{#if data.user?.rol === 'ADMIN'}
				<div class="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
					<p class="px-3 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Administración</p>
					<a 
						href={adminLink.href} 
						class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors {$page.url.pathname.startsWith(adminLink.href) ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'text-slate-600 hover:bg-red-50 hover:text-red-700 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400'}"
					>
						<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={adminLink.icon} />
						</svg>
						{adminLink.label}
					</a>
				</div>
			{/if}
		</nav>
		
		<!-- User Profile -->
		<div class="p-4 border-t">
			<div class="flex items-center gap-3 mb-4">
				<div class="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm font-medium">
					{data.user?.nombre?.charAt(0).toUpperCase() || 'U'}
				</div>
				<div class="flex-1 truncate">
					<p class="text-sm font-medium truncate">{data.user?.nombre || 'Usuario'}</p>
					<p class="text-xs text-slate-500 truncate">{data.user?.email || ''}</p>
					{#if data.user?.rol === 'ADMIN'}
						<span class="text-[10px] font-semibold text-red-600 dark:text-red-400">Administrador</span>
					{:else if data.user?.rol === 'INVESTIGADOR'}
						<span class="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Investigador</span>
					{:else}
						<span class="text-[10px] font-semibold text-slate-400">Usuario</span>
					{/if}
				</div>
			</div>
			<form method="POST" action="/auth/logout">
				<Button variant="outline" class="w-full text-xs justify-start h-8" type="submit">
					<svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="十七 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
					</svg>
					Cerrar Sesión
				</Button>
			</form>
		</div>
	</aside>

	<!-- Main Content Area -->
	<main class="flex-1 flex flex-col min-h-0 overflow-hidden">
		<!-- Mobile Header -->
		<header class="h-14 border-b bg-white dark:bg-slate-900 flex md:hidden items-center justify-between px-4">
			<div class="flex items-center gap-2">
				<div class="h-6 w-6 rounded-full bg-slate-900 dark:bg-slate-50 flex items-center justify-center">
					<div class="h-3 w-3 bg-white dark:bg-slate-900 rounded-sm"></div>
				</div>
				<span class="font-bold">Idea 2025</span>
			</div>
			<div class="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm font-medium">
				{data.user?.nombre?.charAt(0).toUpperCase() || 'U'}
			</div>
		</header>

		<!-- Content Scroll Area -->
		<div class="flex-1 overflow-auto p-4 md:p-8">
			<slot />
		</div>
	</main>
</div>
