<script lang="ts">
	import TermSection from '../TermSection.svelte';
</script>

<TermSection
	number={4}
	title="Seguridad, Ciberseguridad y Resiliencia"
	subtitle="(Ley 21.459)"
>
	<ul class="space-y-4 text-muted-foreground sm:text-lg sm:leading-relaxed">
		<li class="relative pl-6">
			<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
			<strong class="font-medium text-foreground">Arquitectura de Seguridad:</strong> Implementación
			de protocolos Lucia Auth para gestión de sesiones y Drizzle ORM para prevención de inyecciones
			SQL.
		</li>
		<li class="relative pl-6">
			<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
			<strong class="font-medium text-foreground">API Keys:</strong> El usuario es el único responsable
			de la custodia de sus claves de API. La exposición de estas claves que facilite accesos ilícitos
			será responsabilidad del usuario bajo la Ley de Delitos Informáticos.
		</li>
		<li class="relative pl-6">
			<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
			<strong class="font-medium text-foreground">Notificación de Brechas:</strong> Ante cualquier
			vulneración a la integridad, disponibilidad o confidencialidad de los datos, MytilusData notificará
			a la Agencia de Protección de Datos Personales y a los usuarios afectados en un plazo máximo
			de 72 horas.
		</li>
		<li class="relative pl-6">
			<span class="absolute top-2 left-0 h-2 w-2 rounded-full bg-primary/50"></span>
			<strong class="font-medium text-foreground">Integridad de Logs:</strong> Todas las transacciones
			son registradas en un sistema de auditoría inmutable (audit.ts), registrando IP, timestamp
			y actor, disponible para fines de cumplimiento y fiscalización.
		</li>
	</ul>
</TermSection>