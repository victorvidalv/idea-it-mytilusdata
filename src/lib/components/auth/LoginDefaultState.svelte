<script lang="ts">
	import LoginEmailForm from './LoginEmailForm.svelte';
	import LoginRateLimitWarning from './LoginRateLimitWarning.svelte';
	import { isRateLimited, type LoginFormState } from './loginFormState';

	export let form: LoginFormState;
	export let loading: boolean;
</script>

{#if isRateLimited(form)}
	<LoginRateLimitWarning
		message={form?.message}
		remainingSeconds={form?.remainingSeconds}
	/>
{/if}

<LoginEmailForm {form} {loading} />