<svelte:head>
	<title>Condiciones del Servicio | Plataforma Idea 2025</title>
</svelte:head>

<div
	class="relative min-h-screen overflow-hidden bg-background px-6 py-12 text-foreground lg:px-12"
>
	<div class="animate-fade-up relative z-10 mx-auto max-w-3xl">
		<div class="mb-10 flex items-center gap-4">
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a
				href="/auth/login"
				aria-label="Volver a Iniciar Sesión"
				class="inline-flex items-center justify-center rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
			>
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 19l-7-7m0 0l7-7m-7 7h18"
					/>
				</svg>
			</a>
			<div>
				<h1 class="font-display text-3xl text-foreground">Condiciones del Servicio</h1>
				<p class="mt-1 text-sm text-muted-foreground">
					Última actualización: 23 de febrero de 2025
				</p>
			</div>
		</div>

		<div
			class="prose prose-sm sm:prose-base dark:prose-invert max-w-none space-y-8 rounded-2xl border border-border/50 bg-card p-8 shadow-sm"
		>
			<section>
				<h2 class="mb-3 text-xl font-semibold">1. Aceptación de los Términos</h2>
				<p class="leading-relaxed text-muted-foreground">
					Al acceder y utilizar la Plataforma Idea 2025, aceptas estar sujeto a estas Condiciones
					del Servicio. Si no estás de acuerdo con alguna de las partes, no debes crear una cuenta o
					utilizar nuestros servicios.
				</p>
			</section>

			<section>
				<h2 class="mb-3 text-xl font-semibold">2. Uso de la Plataforma</h2>
				<p class="leading-relaxed text-muted-foreground">
					La plataforma está diseñada para el control y la gestión de centros de cultivo. Te
					comprometes a proporcionar información verdadera y precisa durante el registro.
				</p>
			</section>

			<section>
				<h2 class="mb-3 text-xl font-semibold">3. Privacidad y Datos</h2>
				<p class="leading-relaxed text-muted-foreground">
					Respetamos tu privacidad. Solo recopilamos los datos estrictamente necesarios (nombre y
					correo electrónico) para garantizar el funcionamiento de tu cuenta mediante enlaces
					mágicos, sin usar contraseñas.
				</p>
			</section>

			<section>
				<h2 class="mb-3 text-xl font-semibold">4. Modificaciones del Servicio</h2>
				<p class="leading-relaxed text-muted-foreground">
					Nos reservamos el derecho de modificar o discontinuar el servicio (o cualquier parte de
					este) temporal o de forma permanente, con o sin previo aviso en cualquier momento.
				</p>
			</section>
		</div>
	</div>

	<!-- Decoración del fondo -->
	<div
		class="pointer-events-none absolute top-0 right-0 h-1/3 w-1/3 rounded-full bg-ocean-light/[0.03] blur-[100px]"
	></div>
	<div
		class="pointer-events-none absolute bottom-0 left-0 h-1/4 w-1/4 rounded-full bg-teal-glow/[0.03] blur-[100px]"
	></div>
</div>
