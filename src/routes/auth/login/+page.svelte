<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';
	import toast from 'svelte-french-toast';

	export let form: import('./$types').ActionData;

	let loading = false;
	let turnstileLoaded = false;

	// Verificar si Turnstile está configurado
	const turnstileEnabled = !!PUBLIC_TURNSTILE_SITE_KEY;

	$: if (form?.success) {
		toast.success('¡Enlace enviado! Revisa tu bandeja de entrada para acceder a la plataforma.');
		loading = false;
	} else if (
		form?.error ||
		form?.missing ||
		form?.rateLimited ||
		form?.cooldownActive ||
		form?.captchaError
	) {
		toast.error('Error: ' + (form?.message || 'Hubo un error al procesar tu solicitud.'));
		loading = false;
		// Refresh Turnstile on error so the user can try again
		if (
			typeof window !== 'undefined' &&
			typeof (window as any).turnstile !== 'undefined' &&
			turnstileWidgetId !== undefined
		) {
			(window as any).turnstile.reset(turnstileWidgetId);
		}
	}

	// Callback cuando Turnstile se carga
	function onTurnstileLoad() {
		turnstileLoaded = true;
	}

	// Exponer el callback globalmente para el script de Turnstile
	if (typeof window !== 'undefined') {
		(window as any).onTurnstileLoad = onTurnstileLoad;
	}

	let turnstileWidgetId: string | undefined;

	// Svelte action para renderizar el widget explícitamente cuando el elemento se monta
	function turnstileAction(node: HTMLElement) {
		if (!turnstileEnabled) return;

		const interval = setInterval(() => {
			if (typeof (window as any).turnstile !== 'undefined') {
				clearInterval(interval);
				turnstileWidgetId = (window as any).turnstile.render(node, {
					sitekey: PUBLIC_TURNSTILE_SITE_KEY,
					theme: 'light'
				});
			}
		}, 100);

		return {
			destroy() {
				clearInterval(interval);
				if (turnstileWidgetId !== undefined && typeof (window as any).turnstile !== 'undefined') {
					(window as any).turnstile.remove(turnstileWidgetId);
				}
			}
		};
	}
</script>

<svelte:head>
	<title>Iniciar Sesión | Plataforma Idea 2025</title>
	{#if turnstileEnabled}
		<script
			src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit"
			async
			defer
		></script>
	{/if}
</svelte:head>

<div class="relative flex min-h-screen overflow-hidden">
	<!-- Panel izquierdo: Visual -->
	<div class="bg-ocean-gradient relative hidden items-end overflow-hidden p-12 lg:flex lg:w-1/2">
		<div class="bg-ocean-mesh absolute inset-0"></div>

		<!-- Círculos decorativos -->
		<div
			class="animate-float absolute top-[20%] left-[15%] h-72 w-72 rounded-full border border-white/[0.06]"
		></div>
		<div
			class="animate-float absolute top-[50%] right-[10%] h-48 w-48 rounded-full border border-teal-glow/10 delay-300"
		></div>
		<div
			class="animate-float absolute bottom-[25%] left-[40%] h-32 w-32 rounded-full bg-ocean-light/[0.05] blur-2xl delay-500"
		></div>

		<!-- Texto decorativo -->
		<div class="animate-fade-up relative z-10">
			<p class="mb-4 font-body text-sm font-medium tracking-[0.3em] text-white/30 uppercase">
				Acceso seguro
			</p>
			<h2 class="mb-4 font-display text-5xl leading-tight text-white/90">
				Control de<br />
				<span class="text-gradient-ocean italic">tus cultivos</span>
			</h2>
			<p class="max-w-sm font-body text-sm leading-relaxed text-white/40">
				Ingresa desde cualquier dispositivo para monitorear la evolución de tus centros de cultivo
				en tiempo real.
			</p>
		</div>
	</div>

	<!-- Panel derecho: Formulario -->
	<div class="flex flex-1 items-center justify-center bg-background p-6">
		<div class="animate-fade-up w-full max-w-sm">
			<!-- Logo -->
			<div class="mb-10 text-center">
				<div class="mb-6 inline-flex items-center gap-3">
					<div
						class="bg-ocean-gradient flex h-10 w-10 items-center justify-center rounded-xl shadow-lg shadow-ocean-mid/20"
					>
						<div class="h-4 w-4 rounded-sm bg-white/90"></div>
					</div>
					<span class="font-display text-xl text-foreground">Idea 2025</span>
				</div>
				<p class="font-body text-sm text-muted-foreground">
					Ingresa sin contraseña usando tu correo electrónico
				</p>
			</div>

			{#if form?.success}
				<div class="animate-fade-up space-y-6">
					<div
						class="relative overflow-hidden rounded-xl border border-teal-glow/20 bg-teal-glow/10 p-5"
					>
						<div class="flex items-start gap-3">
							<div
								class="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-glow/20"
							>
								<svg
									class="h-4 w-4 text-teal-glow"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									/>
								</svg>
							</div>
							<div>
								<p class="mb-1 text-sm font-medium text-foreground">Revisa tu correo</p>
								<p class="text-xs leading-relaxed text-muted-foreground">
									Hemos enviado un enlace mágico a tu bandeja de entrada. Haz clic en él para
									acceder a la plataforma.
								</p>
							</div>
						</div>
					</div>
					<Button
						variant="outline"
						class="w-full"
						onclick={() => {
							form = null;
						}}
					>
						Ingresar con otro correo
					</Button>
				</div>
			{:else if form?.requiresRegistration}
				<div class="animate-fade-up space-y-4">
					<div class="mb-6">
						<p class="mb-1 text-sm font-medium text-foreground">Casi listo</p>
						<p class="text-xs text-muted-foreground">
							Completa tus datos para crear tu cuenta y acceder a la plataforma.
						</p>
					</div>

					<!-- Mensaje de error de CAPTCHA -->
					{#if form?.captchaError}
						<div class="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
							<div class="flex items-start gap-3">
								<svg
									class="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								</svg>
								<p class="text-sm text-red-500">
									{form?.message ||
										'Verificación de seguridad fallida. Por favor, completa el CAPTCHA.'}
								</p>
							</div>
						</div>
					{/if}

					<form
						method="POST"
						use:enhance={() => {
							loading = true;
							return async ({ update }) => {
								await update();
								loading = false;
							};
						}}
						class="space-y-5"
					>
						<input type="hidden" name="email" value={form?.email || ''} />
						<div class="space-y-2">
							<Label
								for="nombre"
								class="text-xs font-medium tracking-wider text-muted-foreground uppercase"
								>Nombre Completo</Label
							>
							<Input
								id="nombre"
								name="nombre"
								type="text"
								placeholder="Juan Pérez"
								required
								disabled={loading}
								value={form?.nombre || ''}
								class="h-11 rounded-xl border-border/50 bg-secondary/50 transition-all focus:border-ocean-light focus:ring-ocean-light/20"
							/>
						</div>

						<div
							class="flex flex-row items-start space-y-0 space-x-3 rounded-xl border border-border/50 bg-secondary/20 p-4"
						>
							<input
								type="checkbox"
								id="terms"
								name="terms"
								required
								disabled={loading}
								class="mt-1 h-4 w-4 rounded border-border/50 bg-secondary/50 text-ocean-mid focus:ring-ocean-light/20"
							/>
							<div class="space-y-1 text-sm leading-none">
								<Label for="terms" class="cursor-pointer font-medium">Acepto las condiciones</Label>
								<p class="text-xs leading-normal text-muted-foreground">
									Al continuar, aceptas las <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
									<a
										href="/condiciones-servicios"
										target="_blank"
										class="font-semibold text-ocean-light transition-colors hover:text-ocean-mid hover:underline"
										>Condiciones del Servicio</a
									> de la plataforma.
								</p>
							</div>
						</div>

						<!-- Widget de Cloudflare Turnstile -->
						{#if turnstileEnabled}
							<div class="flex justify-center">
								<div use:turnstileAction></div>
							</div>
						{/if}

						<Button
							type="submit"
							class="h-11 w-full rounded-xl bg-ocean-mid font-medium text-white transition-all duration-300 hover:bg-ocean-deep hover:shadow-lg hover:shadow-ocean-mid/20"
							disabled={loading || (turnstileEnabled && !turnstileLoaded)}
						>
							{#if loading}
								<svg class="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
									<circle
										class="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										stroke-width="4"
									></circle>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
									></path>
								</svg>
								Creando cuenta...
							{:else}
								Crear cuenta y recibir enlace
								<svg class="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13 7l5 5m0 0l-5 5m5-5H6"
									/>
								</svg>
							{/if}
						</Button>
					</form>
				</div>
			{:else}
				<!-- Mensaje de error de rate limiting -->
				{#if form?.rateLimited || form?.cooldownActive}
					<div class="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
						<div class="flex items-start gap-3">
							<svg
								class="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<div>
								<p class="mb-1 text-sm font-medium text-foreground">Espera un momento</p>
								<p class="text-xs leading-relaxed text-muted-foreground">
									{form?.message ||
										'Demasiados intentos. Por favor, espera antes de intentar nuevamente.'}
								</p>
								{#if form?.remainingSeconds}
									<p class="mt-2 text-xs font-medium text-amber-500">
										Tiempo restante: {form.remainingSeconds} segundos
									</p>
								{/if}
							</div>
						</div>
					</div>
				{/if}

				<form
					method="POST"
					use:enhance={() => {
						loading = true;
						return async ({ update }) => {
							await update();
							loading = false;
						};
					}}
					class="space-y-5"
				>
					<div class="space-y-2">
						<Label
							for="email"
							class="text-xs font-medium tracking-wider text-muted-foreground uppercase"
							>Correo Electrónico</Label
						>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="juan@ejemplo.com"
							required
							disabled={loading}
							value={form?.email || ''}
							class="h-11 rounded-xl border-border/50 bg-secondary/50 transition-all focus:border-ocean-light focus:ring-ocean-light/20"
						/>
					</div>
					<Button
						type="submit"
						class="h-11 w-full rounded-xl bg-ocean-mid font-medium text-white transition-all duration-300 hover:bg-ocean-deep hover:shadow-lg hover:shadow-ocean-mid/20"
						disabled={loading}
					>
						{#if loading}
							<svg class="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
								></path>
							</svg>
							Enviando...
						{:else}
							Enviar enlace mágico
							<svg class="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 7l5 5m0 0l-5 5m5-5H6"
								/>
							</svg>
						{/if}
					</Button>
				</form>
			{/if}

			<div class="mt-10 border-t border-border/50 pt-6 text-center">
				<p class="font-body text-xs text-muted-foreground/60">
					Plataforma Mitilicultura — IdeaIT 2025
				</p>
			</div>
		</div>
	</div>
</div>
