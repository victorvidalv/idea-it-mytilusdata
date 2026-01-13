<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';

	export let form: any;
	
	let loading = false;

	$: if (form?.success) {
		toast.success('¡Enlace enviado!', {
			description: 'Revisa tu bandeja de entrada para acceder a la plataforma.'
		});
		loading = false;
	} else if (form?.error || form?.missing) {
		toast.error('Error', {
			description: form?.message || 'Hubo un error al procesar tu solicitud.'
		});
		loading = false;
	}
</script>

<svelte:head>
	<title>Iniciar Sesión | Plataforma Idea 2025</title>
</svelte:head>

<div class="min-h-screen flex relative overflow-hidden">
	<!-- Panel izquierdo: Visual -->
	<div class="hidden lg:flex lg:w-1/2 bg-ocean-gradient relative overflow-hidden items-end p-12">
		<div class="absolute inset-0 bg-ocean-mesh"></div>
		
		<!-- Círculos decorativos -->
		<div class="absolute top-[20%] left-[15%] w-72 h-72 rounded-full border border-white/[0.06] animate-float"></div>
		<div class="absolute top-[50%] right-[10%] w-48 h-48 rounded-full border border-teal-glow/10 animate-float delay-300"></div>
		<div class="absolute bottom-[25%] left-[40%] w-32 h-32 rounded-full bg-ocean-light/[0.05] blur-2xl animate-float delay-500"></div>

		<!-- Texto decorativo -->
		<div class="relative z-10 animate-fade-up">
			<p class="text-sm font-body font-medium text-white/30 uppercase tracking-[0.3em] mb-4">Acceso seguro</p>
			<h2 class="text-5xl font-display text-white/90 leading-tight mb-4">
				Control de<br />
				<span class="text-gradient-ocean italic">tus cultivos</span>
			</h2>
			<p class="text-white/40 font-body text-sm max-w-sm leading-relaxed">
				Ingresa desde cualquier dispositivo para monitorear la evolución de tus centros de cultivo en tiempo real.
			</p>
		</div>
	</div>

	<!-- Panel derecho: Formulario -->
	<div class="flex-1 flex items-center justify-center p-6 bg-background">
		<div class="w-full max-w-sm animate-fade-up">
			<!-- Logo -->
			<div class="mb-10 text-center">
				<div class="inline-flex items-center gap-3 mb-6">
					<div class="h-10 w-10 rounded-xl bg-ocean-gradient flex items-center justify-center shadow-lg shadow-ocean-mid/20">
						<div class="h-4 w-4 bg-white/90 rounded-sm"></div>
					</div>
					<span class="text-xl font-display text-foreground">Idea 2025</span>
				</div>
				<p class="text-sm text-muted-foreground font-body">
					Ingresa sin contraseña usando tu correo electrónico
				</p>
			</div>

			{#if form?.success}
				<div class="animate-fade-up space-y-6">
					<div class="relative overflow-hidden rounded-xl bg-teal-glow/10 border border-teal-glow/20 p-5">
						<div class="flex items-start gap-3">
							<div class="h-8 w-8 rounded-full bg-teal-glow/20 flex items-center justify-center flex-shrink-0 mt-0.5">
								<svg class="w-4 h-4 text-teal-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
								</svg>
							</div>
							<div>
								<p class="text-sm font-medium text-foreground mb-1">Revisa tu correo</p>
								<p class="text-xs text-muted-foreground leading-relaxed">
									Hemos enviado un enlace mágico a tu bandeja de entrada. Haz clic en él para acceder a la plataforma.
								</p>
							</div>
						</div>
					</div>
					<Button variant="outline" class="w-full" on:click={() => { form = null; }}>
						Ingresar con otro correo
					</Button>
				</div>
			{:else}
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
						<Label for="nombre" class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Nombre Completo</Label>
						<Input 
							id="nombre" 
							name="nombre" 
							type="text" 
							placeholder="Juan Pérez" 
							required 
							disabled={loading}
							value={form?.nombre || ''}
							class="h-11 rounded-xl bg-secondary/50 border-border/50 focus:border-ocean-light focus:ring-ocean-light/20 transition-all"
						/>
					</div>
					<div class="space-y-2">
						<Label for="email" class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Correo Electrónico</Label>
						<Input 
							id="email" 
							name="email" 
							type="email" 
							placeholder="juan@ejemplo.com" 
							required 
							disabled={loading}
							value={form?.email || ''}
							class="h-11 rounded-xl bg-secondary/50 border-border/50 focus:border-ocean-light focus:ring-ocean-light/20 transition-all"
						/>
					</div>
					<Button 
						type="submit" 
						class="w-full h-11 rounded-xl bg-ocean-mid hover:bg-ocean-deep text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-ocean-mid/20" 
						disabled={loading}
					>
						{#if loading}
							<svg class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
							</svg>
							Enviando...
						{:else}
							Enviar enlace mágico
							<svg class="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
							</svg>
						{/if}
					</Button>
				</form>
			{/if}

			<div class="mt-10 pt-6 border-t border-border/50 text-center">
				<p class="text-xs text-muted-foreground/60 font-body">
					Plataforma Mitilicultura — IdeaIT 2025
				</p>
			</div>
		</div>
	</div>
</div>
