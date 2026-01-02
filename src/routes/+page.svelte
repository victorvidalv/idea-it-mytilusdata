<script lang="ts">
	import { Button } from '$lib/components/ui/button';
</script>

<div class="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
	<div class="h-16 w-16 mb-6 rounded-full bg-slate-900 dark:bg-slate-50 flex items-center justify-center">
		<div class="h-8 w-8 bg-white dark:bg-slate-900 rounded-sm"></div>
	</div>
	<h1 class="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Plataforma Idea 2025</h1>
	<p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mb-8">
		Plataforma Digital para Mitilicultura. Optimización e Inteligencia en cultivos de mejillón chileno.
	</p>
	<div class="flex gap-4">
		<Button href="/auth/login" size="lg">Ingresar</Button>
		<Button href="/dashboard" variant="outline" size="lg">Ir al Dashboard</Button>
	</div>
</div>
