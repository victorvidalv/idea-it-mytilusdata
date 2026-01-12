<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
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

<div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
	<Card.Root class="w-full max-w-sm">
		<Card.Header class="space-y-1">
			<Card.Title class="text-2xl font-bold flex justify-center items-center gap-2">
				<div class="h-6 w-6 rounded-full bg-slate-900 dark:bg-slate-50 flex items-center justify-center">
					<div class="h-3 w-3 bg-white dark:bg-slate-900 rounded-sm"></div>
				</div>
				Plataforma Idea
			</Card.Title>
			<Card.Description class="text-center">
				Ingresa sin contraseña usando tu correo
			</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if form?.success}
				<div class="text-center space-y-4 py-4">
					<div class="bg-green-100 text-green-800 p-3 rounded-md text-sm">
						Hemos enviado un enlace mágico a tu correo. Haz clic en él para acceder.
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
					class="space-y-4"
				>
					<div class="space-y-2">
						<Label for="nombre">Nombre Completo</Label>
						<Input 
							id="nombre" 
							name="nombre" 
							type="text" 
							placeholder="Juan Pérez" 
							required 
							disabled={loading}
							value={form?.nombre || ''}
						/>
					</div>
					<div class="space-y-2">
						<Label for="email">Correo Electrónico</Label>
						<Input 
							id="email" 
							name="email" 
							type="email" 
							placeholder="juan@ejemplo.com" 
							required 
							disabled={loading}
							value={form?.email || ''}
						/>
					</div>
					<Button type="submit" class="w-full" disabled={loading}>
						{loading ? 'Enviando...' : 'Enviar enlace mágico'}
					</Button>
				</form>
			{/if}
		</Card.Content>
		<Card.Footer class="flex flex-col text-sm text-center text-slate-500">
			<p>Plataforma Mitilicultura 2025</p>
		</Card.Footer>
	</Card.Root>
</div>
