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
			<section
				class="group rounded-3xl border border-border/30 bg-card/40 p-6 shadow-sm backdrop-blur-lg transition-all hover:border-border/60 hover:bg-card/60 sm:p-10"
			>
				<div class="mb-6 flex items-center gap-4">
					<div
						class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
					>
						<span class="font-display text-lg font-bold">1</span>
					</div>
					<h2 class="font-display text-xl font-semibold tracking-tight sm:text-2xl">
						Identidad y Naturaleza del Proyecto
					</h2>
				</div>
				<div class="space-y-4 text-muted-foreground sm:text-lg sm:leading-relaxed">
					<p>
						<strong class="font-medium text-foreground">MytilusData</strong> es una plataforma de
						software como servicio (SaaS) orientada a la gestión de datos acuícolas, desarrollada
						por la
						<strong class="font-medium text-foreground">Universidad Santo Tomás (UST)</strong> bajo
						financiamiento de <strong class="font-medium text-foreground">ANID</strong> (Concurso de Investigación
						Tecnológica 2025).
					</p>
					<p>
						<strong class="font-medium text-foreground">Nivel de Madurez Tecnológica (TRL):</strong>
						La plataforma opera en niveles TRL 5-7. El usuario acepta que el servicio se encuentra en
						fase de validación técnica y operativa.
					</p>
				</div>
			</section>

			<section
				class="group rounded-3xl border border-border/30 bg-card/40 p-6 shadow-sm backdrop-blur-lg transition-all hover:border-border/60 hover:bg-card/60 sm:p-10"
			>
				<div class="mb-6 flex items-center gap-4">
					<div
						class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
					>
						<span class="font-display text-lg font-bold">2</span>
					</div>
					<h2 class="font-display text-xl font-semibold tracking-tight sm:text-2xl">
						Bases de Legitimación y Consentimiento <span class="text-lg text-muted-foreground"
							>(Ley 21.719)</span
						>
					</h2>
				</div>
				<p class="mb-5 text-muted-foreground sm:text-lg sm:leading-relaxed">
					En cumplimiento con el nuevo estándar de protección de datos:
				</p>
				<ul class="space-y-4 text-muted-foreground sm:text-lg sm:leading-relaxed">
					<li class="relative pl-6">
						<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
						<strong class="font-medium text-foreground">Consentimiento Explícito:</strong> La aceptación
						de estos términos requiere una acción positiva y separada de cualquier otra suscripción. No
						se admiten casillas pre-marcadas.
					</li>
					<li class="relative pl-6">
						<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
						<strong class="font-medium text-foreground">Finalidad Específica:</strong> Los datos recolectados
						(registros de biomasa, mediciones ambientales, geolocalización de centros) serán tratados
						exclusivamente para la gestión productiva del usuario y fines de investigación científica
						agregada y anonimizada.
					</li>
					<li class="relative pl-6">
						<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
						<strong class="font-medium text-foreground">Minimización:</strong> El sistema solo solicita
						los datos estrictamente necesarios para la ejecución del servicio y el cumplimiento de normativas
						de Sernapesca/Subpesca.
					</li>
				</ul>
			</section>

			<section
				class="group rounded-3xl border border-border/30 bg-card/40 p-6 shadow-sm backdrop-blur-lg transition-all hover:border-border/60 hover:bg-card/60 sm:p-10"
			>
				<div class="mb-6 flex items-center gap-4">
					<div
						class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
					>
						<span class="font-display text-lg font-bold">3</span>
					</div>
					<h2 class="font-display text-xl font-semibold tracking-tight sm:text-2xl">
						Derechos ARCO+P <span
							class="block text-sm font-normal text-muted-foreground sm:inline sm:text-lg"
							>(Acceso, Rectificación, Cancelación, Oposición y Portabilidad)</span
						>
					</h2>
				</div>
				<p class="mb-5 text-muted-foreground sm:text-lg sm:leading-relaxed">
					El usuario podrá ejercer sus derechos de forma gratuita mediante la interfaz de la
					plataforma o correo dirigido al <strong class="font-medium text-foreground"
						>Delegado de Protección de Datos (DPO)</strong
					>:
				</p>
				<ul class="space-y-4 text-muted-foreground sm:text-lg sm:leading-relaxed">
					<li class="relative pl-6">
						<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
						<strong class="font-medium text-foreground">Acceso:</strong> Obtener confirmación del tratamiento
						y copia de sus datos.
					</li>
					<li class="relative pl-6">
						<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
						<strong class="font-medium text-foreground">Rectificación:</strong> Corregir información inexacta
						en centros de cultivo o perfiles.
					</li>
					<li class="relative pl-6">
						<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
						<strong class="font-medium text-foreground">Supresión/Cancelación:</strong> Eliminación de
						datos cuando cese la base legal, salvo obligaciones legales de retención de registros sanitarios.
					</li>
					<li class="relative pl-6">
						<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
						<strong class="font-medium text-foreground">Oposición:</strong> Derecho a oponerse a tratamientos
						basados en interés legítimo.
					</li>
					<li class="relative pl-6">
						<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
						<strong class="font-medium text-foreground">Portabilidad:</strong> MytilusData garantiza la
						entrega de datos productivos en formatos estructurados (JSON/CSV) para su transferencia a
						otros proveedores, evitando el cautiverio tecnológico.
					</li>
				</ul>
			</section>

			<section
				class="group rounded-3xl border border-border/30 bg-card/40 p-6 shadow-sm backdrop-blur-lg transition-all hover:border-border/60 hover:bg-card/60 sm:p-10"
			>
				<div class="mb-6 flex items-center gap-4">
					<div
						class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
					>
						<span class="font-display text-lg font-bold">4</span>
					</div>
					<h2 class="font-display text-xl font-semibold tracking-tight sm:text-2xl">
						Seguridad, Ciberseguridad y Resiliencia <span class="text-lg text-muted-foreground"
							>(Ley 21.459)</span
						>
					</h2>
				</div>
				<ul class="space-y-4 text-muted-foreground sm:text-lg sm:leading-relaxed">
					<li class="relative pl-6">
						<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
						<strong class="font-medium text-foreground">Arquitectura de Seguridad:</strong> Implementación
						de protocolos Lucia Auth para gestión de sesiones y Drizzle ORM para prevención de inyecciones
						SQL.
					</li>
					<li class="relative pl-6">
						<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
						<strong class="font-medium text-foreground">API Keys:</strong> El usuario es el único responsable
						de la custodia de sus claves de API. La exposición de estas claves que facilite accesos ilícitos
						será responsabilidad del usuario bajo la Ley de Delitos Informáticos.
					</li>
					<li class="relative pl-6">
						<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
						<strong class="font-medium text-foreground">Notificación de Brechas:</strong> Ante cualquier
						vulneración a la integridad, disponibilidad o confidencialidad de los datos, MytilusData notificará
						a la Agencia de Protección de Datos Personales y a los usuarios afectados en un plazo máximo
						de 72 horas.
					</li>
					<li class="relative pl-6">
						<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
						<strong class="font-medium text-foreground">Integridad de Logs:</strong> Todas las transacciones
						son registradas en un sistema de auditoría inmutable (audit.ts), registrando IP, timestamp
						y actor, disponible para fines de cumplimiento y fiscalización.
					</li>
				</ul>
			</section>

			<section
				class="group rounded-3xl border border-border/30 bg-card/40 p-6 shadow-sm backdrop-blur-lg transition-all hover:border-border/60 hover:bg-card/60 sm:p-10"
			>
				<div class="mb-6 flex items-center gap-4">
					<div
						class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
					>
						<span class="font-display text-lg font-bold">5</span>
					</div>
					<h2 class="font-display text-xl font-semibold tracking-tight sm:text-2xl">
						Propiedad Intelectual y Activos Tecnológicos
					</h2>
				</div>
				<ul class="space-y-4 text-muted-foreground sm:text-lg sm:leading-relaxed">
					<li class="relative pl-6">
						<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
						<strong class="font-medium text-foreground">Software:</strong> La propiedad intelectual del
						código fuente, algoritmos y modelos predictivos pertenece a la Universidad Santo Tomás (Ley
						17.336). Se otorga una licencia de uso limitada, no exclusiva y revocable.
					</li>
					<li class="relative pl-6">
						<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
						<strong class="font-medium text-foreground">Datos del Cliente:</strong> El mitilicultor conserva
						la propiedad de los datos crudos ingresados.
					</li>
					<li class="relative pl-6">
						<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
						<strong class="font-medium text-foreground">Datos Derivados:</strong> MytilusData se reserva
						el derecho de propiedad sobre los análisis estadísticos y modelos de inteligencia artificial
						resultantes del procesamiento de datos agregados y anonimizados.
					</li>
				</ul>
			</section>

			<section
				class="group rounded-3xl border border-border/30 bg-card/40 p-6 shadow-sm backdrop-blur-lg transition-all hover:border-border/60 hover:bg-card/60 sm:p-10"
			>
				<div class="mb-6 flex items-center gap-4">
					<div
						class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
					>
						<span class="font-display text-lg font-bold">6</span>
					</div>
					<h2 class="font-display text-xl font-semibold tracking-tight sm:text-2xl">
						Protección al Consumidor y Cláusulas Abusivas <span
							class="text-lg text-muted-foreground">(Ley 19.496)</span
						>
					</h2>
				</div>
				<ul class="space-y-4 text-muted-foreground sm:text-lg sm:leading-relaxed">
					<li class="relative pl-6">
						<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
						<strong class="font-medium text-foreground">Continuidad del Servicio:</strong> Se garantiza
						un esfuerzo de diligencia profesional para la disponibilidad del servicio. Las suspensiones
						por mantenimiento serán notificadas con 24 horas de antelación.
					</li>
					<li class="relative pl-6">
						<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
						<strong class="font-medium text-foreground">Transparencia en Cambios:</strong> Cualquier modificación
						sustancial a estos términos requiere una nueva aceptación explícita del usuario. El uso continuo
						no constituye aceptación tácita.
					</li>
					<li class="relative pl-6">
						<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
						<strong class="font-medium text-foreground">Limitación de Responsabilidad:</strong> Dada la
						naturaleza TRL 5-7, la plataforma no se responsabiliza por daños indirectos o lucro cesante
						derivados de la indisponibilidad del servicio o errores en la captura de datos de sensores
						externos.
					</li>
				</ul>
			</section>

			<section
				class="group rounded-3xl border border-border/30 bg-card/40 p-6 shadow-sm backdrop-blur-lg transition-all hover:border-border/60 hover:bg-card/60 sm:p-10"
			>
				<div class="mb-6 flex items-center gap-4">
					<div
						class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
					>
						<span class="font-display text-lg font-bold">7</span>
					</div>
					<h2 class="font-display text-xl font-semibold tracking-tight sm:text-2xl">
						Gobernanza y Resolución de Conflictos
					</h2>
				</div>
				<ul class="space-y-4 text-muted-foreground sm:text-lg sm:leading-relaxed">
					<li class="relative pl-6">
						<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
						<strong class="font-medium text-foreground"
							>Delegado de Protección de Datos (DPO):</strong
						> Figura encargada de la supervisión del cumplimiento y enlace con la Agencia de Protección
						de Datos.
					</li>
					<li class="relative pl-6">
						<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
						<strong class="font-medium text-foreground">Jurisdicción:</strong> Las partes se someten a
						la jurisdicción de los tribunales competentes según el domicilio del consumidor (usuario),
						de acuerdo con el artículo 50 A de la Ley 19.496.
					</li>
					<li class="relative pl-6">
						<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
						<strong class="font-medium text-foreground">Idioma:</strong> La versión oficial y vinculante
						de este documento es en castellano.
					</li>
				</ul>
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
