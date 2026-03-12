<script lang="ts">
	export let message: string | undefined;
</script>

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
			{message || 'Verificación de seguridad fallida. Por favor, completa el CAPTCHA.'}
		</p>
	</div>
</div>