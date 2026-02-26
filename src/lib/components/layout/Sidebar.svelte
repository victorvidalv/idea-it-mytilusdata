<script lang="ts">
	import { page } from '$app/stores';

	export let data: import('../../../routes/(app)/$types').LayoutData;
	export let links: { href: string; label: string; icon: string }[];
	export let adminLinks: { href: string; label: string; icon: string }[];
	export let investigadorLinks: { href: string; label: string; icon: string }[];
	export let sidebarCollapsed: boolean;
	export let toggleSidebar: () => void;
</script>

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
					>MytilusData</span
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

		{#if data.user?.rol === 'INVESTIGADOR'}
			{#each investigadorLinks as link (link.href)}
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
		{:else}
			{#each links as link (link.href)}
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
		{/if}

		{#if data.user?.rol === 'ADMIN'}
			<div class="mt-5 border-t border-white/[0.06] pt-5">
				<p
					class="px-3 pb-2 font-body text-[10px] font-semibold tracking-[0.2em] text-white/25 uppercase {sidebarCollapsed
						? 'sr-only'
						: ''}"
				>
					Administración
				</p>
				{#each adminLinks as adminLink (adminLink.href)}
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
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
		</button>
	</div>
</aside>
