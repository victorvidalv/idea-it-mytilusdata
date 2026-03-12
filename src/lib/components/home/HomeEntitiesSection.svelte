<script lang="ts">
	import HomeEntityCard from './HomeEntityCard.svelte';

	const entities = [
		{
			name: 'Universidad Santo Tomás',
			role: 'Beneficiario',
			description: 'Generador de tecnología a través del Centro de Investigación CAPIA.'
		},
		{
			name: 'AmiChile',
			role: 'Asociado / Mandante',
			description: 'Aporta pertinencia sectorial y vinculación para la masificación.'
		},
		{
			name: 'Sudmaris Chile S.A.',
			role: 'Asociado Piloto',
			description: 'Suma centros de cultivo reales para validación operacional y datos.'
		},
		{
			name: 'Pesquera Apiao S.A.',
			role: 'Asociado Piloto',
			description: 'Provee centros a gran escala para pruebas de rendimiento de plataforma.'
		},
		{
			name: 'INTEMIT',
			role: 'Usuario Operador',
			description: 'Entidad que prestará el servicio a nivel industrial a futuro.'
		}
	] as const;
</script>

<div class="animate-fade-up mt-20 w-full max-w-6xl delay-500">
	<div class="mx-auto mb-10 flex items-center justify-center gap-3">
		<div class="h-px flex-1 bg-gradient-to-r from-transparent to-white/20"></div>
		<h2 class="font-body text-xs font-semibold tracking-[0.2em] text-white/60 uppercase">
			Entidades Participantes
		</h2>
		<div class="h-px flex-1 bg-gradient-to-l from-transparent to-white/20"></div>
	</div>

	<div class="flex flex-wrap justify-center gap-4">
		{#each entities as entity}
			<HomeEntityCard name={entity.name} role={entity.role} description={entity.description} />
		{/each}
	</div>
</div>