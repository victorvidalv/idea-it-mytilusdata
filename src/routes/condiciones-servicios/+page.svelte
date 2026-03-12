<svelte:head>
	<title>Términos y Condiciones | MytilusData</title>
	<meta
		name="description"
		content="Términos y Condiciones de Servicio y Política de Privacidad de MytilusData.cl"
	/>
</svelte:head>

<div
	class="relative min-h-screen overflow-hidden bg-background px-4 py-12 text-foreground sm:px-6 lg:px-8"
>
	<!-- Decoración del fondo premium (glassmorphism/blur effect) -->
	<div class="pointer-events-none absolute inset-0 overflow-hidden">
		<div
			class="absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-ocean-light/[0.04] blur-[100px]"
		></div>
		<div
			class="absolute bottom-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full bg-teal-glow/[0.04] blur-[100px]"
		></div>
	</div>

	<div class="relative z-10 mx-auto max-w-4xl">
		<!-- Header de Navegación -->
		<div class="mb-12 flex items-start gap-4 sm:items-center">
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a
				href="/auth/login"
				aria-label="Volver"
				class="group mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/40 bg-card/50 text-muted-foreground backdrop-blur-md transition-all hover:bg-secondary/60 hover:text-foreground sm:mt-0"
			>
				<svg
					class="h-5 w-5 transition-transform group-hover:-translate-x-1"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 19l-7-7m0 0l7-7m-7 7h18"
					/>
				</svg>
			</a>
			<div>
				<h1
					class="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text font-display text-3xl font-bold tracking-tight text-transparent sm:text-4xl"
				>
					Términos y Condiciones de Servicio y Política de Privacidad
				</h1>
				<p class="mt-2 font-display text-lg font-medium text-foreground/80">MytilusData.cl</p>
			</div>
		</div>

		<!-- Card de Metadatos -->
		<div
			class="mb-10 grid gap-4 rounded-3xl border border-border/40 bg-card/60 p-6 backdrop-blur-xl sm:grid-cols-3 sm:p-8"
		>
			<div class="space-y-1">
				<p class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Versión</p>
				<p class="font-medium text-foreground">2.0</p>
			</div>
			<div class="space-y-1">
				<p class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
					Fecha de Vigencia
				</p>
				<p class="font-medium text-foreground">25 de febrero de 2026</p>
			</div>
			<div class="space-y-1 sm:col-span-3">
				<p class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
					Marco Legal
				</p>
				<p class="text-sm leading-relaxed text-foreground/80">
					Ley 19.496, Ley 19.628 (y su reforma Ley 21.719), Ley 21.459 y Ley Marco de
					Ciberseguridad.
				</p>
			</div>
		</div>

		<!-- Contenido Principal -->
		<div class="space-y-8">
			<SectionIdentidad />
			<SectionLegitimacion />
			<SectionDerechosArcop />
			<SectionSeguridad />
			<SectionPropiedadIntelectual />
			<SectionProteccionConsumidor />
			<SectionGobernanza />
		</div>

		<!-- Footer / Action Area -->
		<div class="mt-12 flex justify-center pb-12">
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a
				href="/auth/login"
				class="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none disabled:pointer-events-none disabled:opacity-50"
			>
				Volver a Iniciar Sesión
			</a>
		</div>
	</div>
</div>

<script lang="ts">
	import {
		SectionIdentidad,
		SectionLegitimacion,
		SectionDerechosArcop,
		SectionSeguridad,
		SectionPropiedadIntelectual,
		SectionProteccionConsumidor,
		SectionGobernanza
	} from '$lib/components/legal';
</script>