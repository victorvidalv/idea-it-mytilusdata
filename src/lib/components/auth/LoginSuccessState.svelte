<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	export let onReset: () => void;
</script>

<div class="animate-fade-up space-y-6">
	<div class="relative overflow-hidden rounded-xl border border-teal-glow/20 bg-teal-glow/10 p-5">
		<div class="flex items-start gap-3">
			<div
				class="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-glow/20"
			>
				<svg class="h-4 w-4 text-teal-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
	<Button variant="outline" class="w-full" onclick={onReset}>
		Ingresar con otro correo
	</Button>
</div>