<script lang="ts">
	import TermSection from '../TermSection.svelte';
</script>

<TermSection
	number={6}
	title="Protección al Consumidor y Cláusulas Abusivas"
	subtitle="(Ley 19.496)"
>
	<ul class="space-y-4 text-muted-foreground sm:text-lg sm:leading-relaxed">
		<li class="relative pl-6">
			<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
			<strong class="font-medium text-foreground">Continuidad del Servicio:</strong> Se garantiza
			un esfuerzo de diligencia profesional para la disponibilidad del servicio. Las suspensiones
			por mantenimiento serán notificadas con 24 horas de antelación.
		</li>
		<li class="relative pl-6">
			<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
			<strong class="font-medium text-foreground">Transparencia en Cambios:</strong> Cualquier modificación
			sustancial a estos términos requiere una nueva aceptación explícita del usuario. El uso continuo
			no constituye aceptación tácita.
		</li>
		<li class="relative pl-6">
			<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
			<strong class="font-medium text-foreground">Limitación de Responsabilidad:</strong> Dada la
			naturaleza TRL 5-7, la plataforma no se responsabiliza por daños indirectos o lucro cesante
			derivados de la indisponibilidad del servicio o errores en la captura de datos de sensores
			externos.
		</li>
	</ul>
</TermSection>