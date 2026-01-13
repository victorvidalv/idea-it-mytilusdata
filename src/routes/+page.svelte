<script lang="ts">
	import { Button } from '$lib/components/ui/button';
</script>

<svelte:head>
	<title>Plataforma Idea 2025 — Mitilicultura Inteligente</title>
	<meta name="description" content="Plataforma digital para la optimización e inteligencia en cultivos de mejillón chileno. Monitoreo, predicción y análisis con tecnología de vanguardia." />
</svelte:head>

<div class="min-h-screen relative overflow-hidden bg-ocean-gradient">
	<!-- Mesh de fondo -->
	<div class="absolute inset-0 bg-ocean-mesh"></div>

	<!-- Partículas decorativas -->
	<div class="absolute inset-0 pointer-events-none overflow-hidden">
		<div class="absolute top-[15%] left-[10%] w-64 h-64 rounded-full bg-teal-glow/[0.04] blur-3xl animate-float"></div>
		<div class="absolute top-[60%] right-[8%] w-80 h-80 rounded-full bg-ocean-light/[0.06] blur-3xl animate-float delay-300"></div>
		<div class="absolute bottom-[10%] left-[40%] w-48 h-48 rounded-full bg-ocean-mid/[0.05] blur-2xl animate-float delay-500"></div>
	</div>

	<!-- Noise overlay sutil -->
	<div class="absolute inset-0 opacity-[0.03]" style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"></div>

	<div class="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 text-center">
		<!-- Logo / marca -->
		<div class="animate-fade-up mb-10">
			<div class="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.05] glass">
				<div class="h-2.5 w-2.5 rounded-full bg-teal-glow animate-pulse"></div>
				<span class="text-sm font-body font-medium text-white/70 tracking-widest uppercase">Plataforma Activa</span>
			</div>
		</div>

		<!-- Título principal -->
		<h1 class="animate-fade-up delay-150 text-5xl md:text-7xl lg:text-8xl font-display font-normal text-white leading-[1.05] max-w-4xl mb-6">
			Mitilicultura
			<br />
			<span class="text-gradient-ocean italic">Inteligente</span>
		</h1>

		<p class="animate-fade-up delay-300 text-lg md:text-xl text-white/50 max-w-xl mb-12 font-body font-light leading-relaxed">
			Optimización basada en datos para el cultivo de 
			<span class="text-white/70 font-medium">Mytilus chilensis</span>. 
			Monitoreo, predicción y análisis en tiempo real.
		</p>

		<!-- CTA -->
		<div class="animate-fade-up delay-400 flex flex-col sm:flex-row gap-4">
			<a 
				href="/auth/login"
				class="group relative inline-flex items-center gap-2 px-8 py-3.5 text-sm font-medium text-ocean-deep bg-white rounded-xl hover:bg-foam-white transition-all duration-300 hover:shadow-lg hover:shadow-white/20 hover:-translate-y-0.5"
			>
				Ingresar a la plataforma
				<svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
				</svg>
			</a>
			<a 
				href="/dashboard"
				class="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-medium text-white/70 border border-white/15 rounded-xl hover:bg-white/[0.06] hover:text-white hover:border-white/25 transition-all duration-300"
			>
				Ir al Dashboard
			</a>
		</div>

		<!-- Indicadores de fondo -->
		<div class="animate-fade-up delay-500 mt-20 grid grid-cols-3 gap-8 md:gap-16">
			<div class="text-center">
				<p class="text-2xl md:text-3xl font-display text-white/90">TRL 7</p>
				<p class="text-xs text-white/30 mt-1 font-body uppercase tracking-wider">Validación</p>
			</div>
			<div class="text-center">
				<p class="text-2xl md:text-3xl font-display text-white/90">85%+</p>
				<p class="text-xs text-white/30 mt-1 font-body uppercase tracking-wider">Precisión</p>
			</div>
			<div class="text-center">
				<p class="text-2xl md:text-3xl font-display text-white/90">&lt;2s</p>
				<p class="text-xs text-white/30 mt-1 font-body uppercase tracking-wider">Respuesta</p>
			</div>
		</div>
	</div>

	<!-- Borde degradado inferior -->
	<div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
</div>
