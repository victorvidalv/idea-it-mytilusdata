<script lang="ts">
	export let data: import('../../../routes/(app)/$types').LayoutData;
	export let links: { href: string; label: string; icon: string }[];
	export let investigadorLinks: { href: string; label: string; icon: string }[];
	export let mobileMenuOpen: boolean;
	export let toggleMobileMenu: () => void;

	const rolStyle: Record<string, { color: string; label: string }> = {
		ADMIN: { color: 'text-red-400', label: 'Administrador' },
		INVESTIGADOR: { color: 'text-teal-glow', label: 'Investigador' },
		USUARIO: { color: 'text-muted-foreground', label: 'Usuario' }
	};

	let userMenuOpen = false;

	function toggleUserMenu() {
		userMenuOpen = !userMenuOpen;
	}
</script>

<header
	class="relative z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/50 px-4 backdrop-blur-xl md:px-8"
>
	<div class="flex items-center gap-4">
		<!-- Botón Menu Mobile -->
		<button
			class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-secondary md:hidden"
			onclick={toggleMobileMenu}
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

		<div class="flex items-center gap-2 md:hidden">
			<div class="bg-ocean-gradient flex h-6 w-6 items-center justify-center rounded-lg">
				<div class="h-3 w-3 rounded-sm bg-white/80"></div>
			</div>
			<span class="font-display text-base">MytilusData</span>
		</div>
	</div>

	<!-- Perfil Superior Derecho -->
	<div class="relative flex items-center gap-3">
		<button
			class="flex items-center gap-3 rounded-full p-1 pr-3 text-left transition-colors hover:bg-secondary/50"
			onclick={toggleUserMenu}
		>
			<div
				class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-ocean-light/10 font-display text-sm text-ocean-light shadow-sm"
			>
				{data.user?.nombre?.charAt(0).toUpperCase() || 'U'}
			</div>
			<div class="hidden flex-col items-start md:flex">
				<span class="font-body text-sm leading-none font-medium text-foreground"
					>{data.user?.nombre || 'Usuario'}</span
				>
				<span
					class="mt-1 font-body text-[10px] font-semibold tracking-wider uppercase {rolStyle[
						data.user?.rol ?? ''
					]?.color || 'text-muted-foreground'} leading-none"
				>
					{rolStyle[data.user?.rol ?? '']?.label || 'Usuario'}
				</span>
			</div>
			<svg
				class="ml-1 hidden h-3.5 w-3.5 text-muted-foreground transition-transform md:block {userMenuOpen
					? 'rotate-180'
					: ''}"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</button>

		{#if userMenuOpen}
			<div
				class="animate-fade-in absolute top-[110%] right-0 z-50 mt-2 w-56 transform rounded-xl border border-border bg-card p-1 shadow-xl shadow-black/10"
			>
				<!-- Overlay para click out - se cierra al hacer click fuera -->
				<div class="fixed inset-0 z-[-1]" onclick={toggleUserMenu} aria-hidden="true"></div>

				<div class="mb-1 border-b border-border/50 px-3 py-3">
					<p class="truncate font-body text-sm font-medium text-foreground">{data.user?.nombre}</p>
					<p class="truncate font-body text-xs text-muted-foreground">{data.user?.email}</p>
				</div>

				<a
					href="/perfil"
					class="flex w-full items-center gap-2 rounded-lg px-2 py-2 font-body text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
					onclick={toggleUserMenu}
				>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
						/>
					</svg>
					Mi Perfil
				</a>

				<form
					method="POST"
					action="/auth/logout"
					class="mt-1 w-full border-t border-border/50 pt-1"
				>
					<button
						type="submit"
						class="flex w-full items-center gap-2 rounded-lg px-2 py-2 font-body text-sm text-red-500/80 transition-colors hover:bg-red-500/10 hover:text-red-500"
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
							/>
						</svg>
						Cerrar Sesión
					</button>
				</form>
			</div>
		{/if}
	</div>
</header>

<!-- Menú mobile overlay -->
{#if mobileMenuOpen}
	<div
		class="animate-fade-in fixed inset-0 z-50 bg-black/60 md:hidden"
		onclick={toggleMobileMenu}
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
				{#if data.user?.rol === 'INVESTIGADOR'}
					{#each investigadorLinks as link (link.href)}
						<a
							href={link.href}
							class="flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-white/70 transition-colors hover:bg-white/10"
							onclick={toggleMobileMenu}
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
				{:else}
					{#each links as link (link.href)}
						<a
							href={link.href}
							class="flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-white/70 transition-colors hover:bg-white/10"
							onclick={toggleMobileMenu}
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
				{/if}
			</nav>
		</div>
	</div>
{/if}
