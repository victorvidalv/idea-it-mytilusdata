<script lang="ts">
	import { enhance } from '$app/forms';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import LoginSubmitButton from './LoginSubmitButton.svelte';
	import LoginCaptchaError from './LoginCaptchaError.svelte';
	import { turnstileEnabled, createTurnstileAction } from './turnstile';

	export let form: {
		email?: string;
		nombre?: string;
		captchaError?: boolean;
		message?: string;
	} | null;
	export let loading: boolean;
	export let turnstileLoaded: boolean;

	let turnstileWidgetId: string | undefined;
</script>

<div class="animate-fade-up space-y-4">
	<div class="mb-6">
		<p class="mb-1 text-sm font-medium text-foreground">Casi listo</p>
		<p class="text-xs text-muted-foreground">
			Completa tus datos para crear tu cuenta y acceder a la plataforma.
		</p>
	</div>

	{#if form?.captchaError}
		<LoginCaptchaError message={form?.message} />
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
			>
				Nombre Completo
			</Label>
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
					Al continuar, aceptas las
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a
						href="/condiciones-servicios"
						target="_blank"
						class="font-semibold text-ocean-light transition-colors hover:text-ocean-mid hover:underline"
					>
						Condiciones del Servicio
					</a>
					de la plataforma.
				</p>
			</div>
		</div>

		{#if turnstileEnabled}
			<div class="flex justify-center">
				<div use:createTurnstileAction></div>
			</div>
		{/if}

		<LoginSubmitButton
			{loading}
			loadingText="Creando cuenta..."
			defaultText="Crear cuenta y recibir enlace"
			disabled={loading || (turnstileEnabled && !turnstileLoaded)}
		/>
	</form>
</div>