<svelte:head>
	<title>Acerca del Proyecto | MytilusData</title>
	<meta
		name="description"
		content="Conoce más sobre el proyecto MytilusData, una plataforma financiada por ANID para la mitilicultura chilena."
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
					Conocer más del Proyecto
				</h1>
				<p class="mt-2 font-display text-lg font-medium text-foreground/80">MytilusData.cl</p>
			</div>
		</div>

		<!-- Card de Metadatos (ANID) -->
		<div
			class="mb-10 grid gap-4 rounded-3xl border border-border/40 bg-card/60 p-6 backdrop-blur-xl sm:p-8"
		>
			<div class="space-y-4">
				<div
					class="inline-flex items-center rounded-full border border-ocean-light/30 bg-ocean-light/10 px-3 py-1 text-sm font-medium text-ocean-mid"
				>
					Proyecto ANID
				</div>
				<p class="text-sm leading-relaxed text-foreground/80 sm:text-base">
					El proyecto consiste en el desarrollo de una plataforma digital integral diseñada para
					optimizar la gestión productiva y técnica de los cultivos de <em>Mytilus chilensis</em> (mejillón
					chileno). Su arquitectura se centra en la transformación de datos brutos en decisiones estratégicas
					mediante el uso de análisis predictivo avanzado.
				</p>
			</div>
		</div>

		<!-- Contenido Principal -->
		<div class="space-y-8">
			<!-- Eje Técnico -->
			<section
				class="group rounded-3xl border border-border/30 bg-card/40 p-6 shadow-sm backdrop-blur-lg transition-all hover:border-border/60 hover:bg-card/60 sm:p-10"
			>
				<div class="mb-6 flex items-center gap-4">
					<div
						class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
							/>
						</svg>
					</div>
					<h2 class="font-display text-xl font-semibold tracking-tight sm:text-2xl">Eje Técnico</h2>
				</div>
				<div class="space-y-4 text-muted-foreground sm:text-lg sm:leading-relaxed">
					<p>
						La solución integra tres módulos operativos: un sistema de registro de datos
						estandarizado, un motor de modelado predictivo basado en <em>machine learning</em> y funciones
						sigmoidales (con precisión superior al 85%), y un panel de análisis interactivo para la visualización
						de tendencias y simulación de escenarios. Incluye además una API REST para garantizar la interoperabilidad
						con sistemas externos.
					</p>
				</div>
			</section>

			<!-- Eje Operativo -->
			<section
				class="group rounded-3xl border border-border/30 bg-card/40 p-6 shadow-sm backdrop-blur-lg transition-all hover:border-border/60 hover:bg-card/60 sm:p-10"
			>
				<div class="mb-6 flex items-center gap-4">
					<div
						class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-ocean-light/10 text-ocean-mid"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<h2 class="font-display text-xl font-semibold tracking-tight sm:text-2xl">
						Eje Operativo
					</h2>
				</div>
				<div class="space-y-4 text-muted-foreground sm:text-lg sm:leading-relaxed">
					<p>
						Implementa un protocolo de monitoreo sistemático que estandariza la captura de variables
						críticas como talla, biomasa y densidad. Esto permite a los productores pasar de una
						gestión basada en muestreos limitados a una planificación de cosechas basada en datos
						dinámicos y proyecciones de crecimiento valvar.
					</p>
				</div>
			</section>

			<!-- Eje Económico -->
			<section
				class="group rounded-3xl border border-border/30 bg-card/40 p-6 shadow-sm backdrop-blur-lg transition-all hover:border-border/60 hover:bg-card/60 sm:p-10"
			>
				<div class="mb-6 flex items-center gap-4">
					<div
						class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-green-500/10 text-green-600 dark:text-green-500"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
							/>
						</svg>
					</div>
					<h2 class="font-display text-xl font-semibold tracking-tight sm:text-2xl">
						Eje Económico
					</h2>
				</div>
				<div class="space-y-4 text-muted-foreground sm:text-lg sm:leading-relaxed">
					<p>
						El sistema busca reducir la incertidumbre financiera mediante la identificación del
						momento óptimo de cosecha, maximizando el rendimiento en carne y la estandarización del
						producto final según los calibres demandados por los mercados internacionales. Se
						orienta especialmente a mejorar la competitividad de las PYMES mitilicultoras mediante
						un modelo de acceso democratizado.
					</p>
				</div>
			</section>

			<!-- Propuesta de Valor -->
			<section
				class="group rounded-3xl border border-border/30 bg-primary/5 p-6 shadow-sm backdrop-blur-lg transition-all hover:border-primary/30 hover:bg-primary/10 sm:p-10"
			>
				<div class="mb-6 flex items-center gap-4">
					<div
						class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
							/>
						</svg>
					</div>
					<h2 class="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
						Propuesta de Valor
					</h2>
				</div>
				<p class="text-foreground/90 sm:text-lg sm:leading-relaxed">
					La solución permite a productores e investigadores colaborar en un entorno seguro y
					encriptado, facilitando la toma de decisiones informadas para elevar los estándares de
					sostenibilidad y trazabilidad de la industria acuícola chilena.
				</p>
			</section>
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
