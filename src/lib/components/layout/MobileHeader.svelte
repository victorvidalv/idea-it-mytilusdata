<script lang="ts">
	export let data: import('../../../routes/(app)/$types').LayoutData;
	export let links: { href: string; label: string; icon: string }[];
	export let mobileMenuOpen: boolean;
	export let toggleMobileMenu: () => void;
</script>

<header
	class="flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden"
>
	<button
		class="rounded-lg p-1.5 transition-colors hover:bg-secondary"
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
			</nav>
		</div>
	</div>
{/if}
