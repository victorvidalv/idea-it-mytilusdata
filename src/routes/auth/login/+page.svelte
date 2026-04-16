<script lang="ts">
	import toast from 'svelte-french-toast';
	import LoginVisualPanel from '$lib/components/auth/LoginVisualPanel.svelte';
	import LoginFooter from '$lib/components/auth/LoginFooter.svelte';
	import LoginHeader from '$lib/components/auth/LoginHeader.svelte';
	import LoginBackLink from '$lib/components/auth/LoginBackLink.svelte';
	import LoginFormContent from '$lib/components/auth/LoginFormContent.svelte';
	import { turnstileEnabled, initTurnstileCallback, resetTurnstile } from '$lib/components/auth/turnstile';
	import { hasFormError } from '$lib/components/auth/loginFormState';

	export let form: import('./$types').ActionData;

	let loading = false;
	let turnstileWidgetId: string | undefined;

	// Inicializar callback global de Turnstile
	initTurnstileCallback();

	// Efecto reactivo para manejar respuestas del formulario
	$: if (form?.success) {
		toast.success('¡Enlace enviado! Revisa tu bandeja de entrada para acceder a la plataforma.');
		loading = false;
	} else if (hasFormError(form)) {
		const errorMsg = form?.message || 'Hubo un error al procesar tu solicitud.';
		toast.error('Error: ' + errorMsg);
		loading = false;
		resetTurnstile(turnstileWidgetId);
	}

	function handleResetForm() {
		form = null;
	}
</script>

<svelte:head>
	<title>Iniciar Sesión | MytilusData</title>
	{#if turnstileEnabled}
		<script
			src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit"
			async
			defer
		></script>
	{/if}
</svelte:head>

<div class="relative flex min-h-screen overflow-hidden">
	<LoginVisualPanel />

	<div class="relative flex flex-1 items-center justify-center bg-background p-6">
		<div class="absolute top-6 left-6 z-20 sm:top-8 sm:left-8">
			<LoginBackLink />
		</div>

		<div class="animate-fade-up mt-8 w-full max-w-sm sm:mt-0">
			<LoginHeader />

			<LoginFormContent
				{form}
				{loading}
				turnstileLoaded={true}
				onReset={handleResetForm}
			/>

			<LoginFooter />
		</div>
	</div>
</div>