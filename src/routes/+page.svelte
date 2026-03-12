<script lang="ts">
	import HomeEntitiesSection from '$lib/components/home/HomeEntitiesSection.svelte';
</script>

<svelte:head>
	<title>MytilusData — Mitilicultura Inteligente</title>
	<meta
		name="description"
		content="Plataforma digital para la optimización e inteligencia en cultivos de mejillón chileno. Monitoreo, predicción y análisis con tecnología de vanguardia."
	/>
</svelte:head>

<div class="bg-ocean-gradient relative min-h-screen overflow-hidden">
	<!-- Mesh de fondo -->
	<div class="bg-ocean-mesh absolute inset-0"></div>

	<!-- Partículas decorativas -->
	<div class="pointer-events-none absolute inset-0 overflow-hidden">
		<div
			class="animate-float absolute top-[15%] left-[10%] h-64 w-64 rounded-full bg-teal-glow/[0.04] blur-3xl"
		></div>
		<div
			class="animate-float absolute top-[60%] right-[8%] h-80 w-80 rounded-full bg-ocean-light/[0.06] blur-3xl delay-300"
		></div>
		<div
			class="animate-float absolute bottom-[10%] left-[40%] h-48 w-48 rounded-full bg-ocean-mid/[0.05] blur-2xl delay-500"
		></div>
	</div>

	<!-- Noise overlay sutil -->
	<div
		class="absolute inset-0 opacity-[0.03]"
		style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"
	></div>

	<div class="relative z-10 flex min-h-screen flex-col items-center justify-center p-6 text-center">
		<!-- Logo / marca -->
		<div class="animate-fade-up mb-10">
			<div
				class="glass inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-5 py-2.5"
			>
				<div class="h-2.5 w-2.5 animate-pulse rounded-full bg-teal-glow"></div>
				<span class="font-body text-sm font-medium tracking-widest text-white/70 uppercase"
					>Plataforma Activa: V 01</span
				>
			</div>
		</div>

		<!-- Título principal -->
		<h1
			class="animate-fade-up mb-6 max-w-4xl font-display text-5xl leading-[1.05] font-normal text-white delay-150 md:text-7xl lg:text-8xl"
		>
			Mitilicultura
			<br />
			<span class="text-gradient-ocean italic">Inteligente</span>
		</h1>

		<p
			class="animate-fade-up mb-12 max-w-xl font-body text-lg leading-relaxed font-light text-white/50 delay-300 md:text-xl"
		>
			Optimización basada en datos para el cultivo de
			<span class="font-medium text-white/70">Mytilus chilensis</span>. Monitoreo, predicción y
			análisis.
		</p>

		<!-- CTA -->
		<div class="animate-fade-up flex flex-col gap-4 delay-400 sm:flex-row">
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a
				href="/auth/login"
				class="group relative inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-medium text-ocean-deep transition-all duration-300 hover:-translate-y-0.5 hover:bg-foam-white hover:shadow-lg hover:shadow-white/20"
			>
				Ingresar a la plataforma
				<svg
					class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 7l5 5m0 0l-5 5m5-5H6"
					/>
				</svg>
			</a>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a
				href="/acerca-de"
				class="inline-flex items-center gap-2 rounded-xl border border-white/15 px-8 py-3.5 text-sm font-medium text-white/70 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
			>
				Conocer más del proyecto
			</a>
		</div>

		<HomeEntitiesSection />
	</div>

	<!-- Borde degradado inferior -->
	<div
		class="absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
	></div>
</div>