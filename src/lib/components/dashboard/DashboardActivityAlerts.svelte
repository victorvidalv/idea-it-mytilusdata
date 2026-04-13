<script lang="ts">
	import * as Card from '$lib/components/ui/card';
</script>

<Card.Root class="border-border/50 md:col-span-3">
	<Card.Header>
		<Card.Title class="font-display text-lg">Actividad Reciente</Card.Title>
		<Card.Description class="font-body text-xs"
			>Notificaciones que requieren su atención</Card.Description
		>
	</Card.Header>
	<Card.Content>
		<div class="space-y-4">
			<!-- Alerta de bienvenida -->
			<div
				class="flex items-start gap-3 rounded-xl border border-ocean-light/10 bg-ocean-light/[0.06] p-3"
			>
				<div
					class="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-ocean-light/15"
				>
					<svg
						class="h-4 w-4 text-ocean-light"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<div>
					<p class="font-body text-sm font-medium text-foreground">Complete su perfil</p>
					<p class="mt-0.5 font-body text-xs leading-relaxed text-muted-foreground">
						Registre su primer centro de cultivo para comenzar a monitorear datos.
					</p>
				</div>
			</div>

			<!-- Alerta de modelo -->
			<div
				class="flex items-start gap-3 rounded-xl border border-teal-glow/10 bg-teal-glow/[0.04] p-3"
			>
				<div
					class="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-teal-glow/15"
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
							d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
						/>
					</svg>
				</div>
				<div>
					<p class="font-body text-sm font-medium text-foreground">Modelo predictivo</p>
					<p class="mt-0.5 font-body text-xs leading-relaxed text-muted-foreground">
						Se requieren al menos 10 mediciones para activar las proyecciones sigmoidales.
					</p>
				</div>
			</div>
		</div>
	</Card.Content>
</Card.Root>