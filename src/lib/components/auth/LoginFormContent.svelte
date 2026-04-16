<script lang="ts">
	import LoginSuccessState from './LoginSuccessState.svelte';
	import LoginRegistrationForm from './LoginRegistrationForm.svelte';
	import LoginDefaultState from './LoginDefaultState.svelte';
	import { isSuccess, requiresRegistration, type LoginFormState } from './loginFormState';

	export let form: LoginFormState;
	export let loading: boolean;
	export let turnstileLoaded: boolean;
	export let onReset: () => void;
</script>

{#if isSuccess(form)}
	<LoginSuccessState {onReset} />
{:else if requiresRegistration(form)}
	<LoginRegistrationForm {form} {loading} {turnstileLoaded} />
{:else}
	<LoginDefaultState {form} {loading} />
{/if}