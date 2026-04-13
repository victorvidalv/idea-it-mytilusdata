<script lang="ts">
	import TermSection from '../TermSection.svelte';
</script>

<TermSection
	number={2}
	title="Bases de Legitimación y Consentimiento"
	subtitle="(Ley 21.719)"
>
	<p class="mb-5 text-muted-foreground sm:text-lg sm:leading-relaxed">
		En cumplimiento con el nuevo estándar de protección de datos:
	</p>
	<ul class="space-y-4 text-muted-foreground sm:text-lg sm:leading-relaxed">
		<li class="relative pl-6">
			<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
			<strong class="font-medium text-foreground">Consentimiento Explícito:</strong> La aceptación
			de estos términos requiere una acción positiva y separada de cualquier otra suscripción. No
			se admiten casillas pre-marcadas.
		</li>
		<li class="relative pl-6">
			<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
			<strong class="font-medium text-foreground">Finalidad Específica:</strong> Los datos recolectados
			(registros de biomasa, mediciones ambientales, geolocalización de centros) serán tratados
			exclusivamente para la gestión productiva del usuario y fines de investigación científica
			agregada y anonimizada.
		</li>
		<li class="relative pl-6">
			<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
			<strong class="font-medium text-foreground">Minimización:</strong> El sistema solo solicita
			los datos estrictamente necesarios para la ejecución del servicio y el cumplimiento de normativas
			de Sernapesca/Subpesca.
		</li>
	</ul>
</TermSection>