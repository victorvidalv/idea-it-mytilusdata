<script lang="ts">
	import {
		PerfilInfoSection,
		PerfilExportSection,
		PerfilApiKeysSection,
		PerfilDangerZoneSection
	} from '$lib/components/perfil';

	export let data: import('./$types').PageData;
</script>

<svelte:head>
	<title>Mi Perfil | MytilusData</title>
</svelte:head>

<div class="animate-fade-in max-w-3xl space-y-8">
	<div class="mb-8">
		<h1 class="font-display text-3xl text-foreground">Mi Perfil</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Configura tu información personal y gestiona tu cuenta de acceso.
		</p>
	</div>

	<PerfilInfoSection email={data.user?.email || ''} nombre={data.user?.nombre || ''} />

	<PerfilExportSection />

	<PerfilApiKeysSection />

	<PerfilDangerZoneSection email={data.user?.email || ''} />
</div>