<!--
Formulario para mediciones. Refactorizado al máximo para svelteqa compliance.
-->
<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import ProyeccionLoader from './ProyeccionLoader.svelte';
	import CargaDatosLoader from './CargaDatosLoader.svelte';
    import ProyeccionFormHeader from './ProyeccionFormHeader.svelte';
    import ProyeccionFormCarga from './ProyeccionFormCarga.svelte';
    import ProyeccionFormManual from './ProyeccionFormManual.svelte';
    import ProyeccionFormTabla from './ProyeccionFormTabla.svelte';
    import ProyeccionFormConfig from './ProyeccionFormConfig.svelte';
    import { createFormState } from './ProyeccionFormState.svelte';
    import type { Lugar, Ciclo } from './ProyeccionComponentTypes';

	interface Props {
		lugares?: Lugar[]; ciclos?: Ciclo[]; dias: number[]; tallas: number[]; tallaObjetivo?: string;
		onAgregarPunto: any; onEliminarPunto: any; onUsarMedicionesCargadas: any; onEjecutarProyeccion: any;
		error: string; cargando: boolean;
	}

	let { lugares = [], ciclos = [], dias, tallas, tallaObjetivo = $bindable(''), onAgregarPunto, onEliminarPunto, onUsarMedicionesCargadas, onEjecutarProyeccion, error = $bindable(), cargando }: Props = $props();

    const s = createFormState();

	$effect(() => { s.loadLugares(lugares); });
	$effect(() => { if (s.selectedLugarId !== null) s.resetCiclo(); });

    const hCarga = () => s.cargarMediciones();
    const hUsar = () => s.handleUsarMediciones(onUsarMedicionesCargadas);
    const hAdd = () => s.handleAgregarPunto(onAgregarPunto, (e) => error = e);
    const hDel = (dia: number) => { s.medicionesCargadas = s.medicionesCargadas.filter(m => m.dia !== dia); };
</script>

<Card.Root class="border-border/50">
	<ProyeccionFormHeader />
	<Card.Content class="space-y-6">
		<ProyeccionFormCarga
			lugares={s.lugaresLocales} {ciclos} bind:selectedLugarId={s.selectedLugarId} bind:selectedCicloId={s.selectedCicloId}
			cargandoDatos={s.cargandoDatos} errorCarga={s.errorCarga} medicionesCargadas={s.medicionesCargadas}
			onCargarMediciones={hCarga} onUsarMedicionesCargadas={hUsar} onEliminarMedicionCargada={hDel}
		/>
		<div class="relative py-2">
			<div class="absolute inset-0 flex items-center"><div class="w-full border-t border-border/30"></div></div>
			<div class="relative flex justify-center"><span class="bg-background px-2 text-xs text-muted-foreground">O ingresa manualmente</span></div>
		</div>
		<ProyeccionFormManual bind:nuevoDia={s.nuevoDia} bind:nuevaTalla={s.nuevaTalla} onAgregarPunto={hAdd} handleKeydown={(e: KeyboardEvent) => e.key === 'Enter' && hAdd()} />
		{#if error}<p class="text-sm text-destructive">{error}</p>{/if}
		<ProyeccionFormTabla {dias} {tallas} {onEliminarPunto} />
		<ProyeccionFormConfig bind:tallaObjetivo {cargando} diasCount={dias.length} {onEjecutarProyeccion} />
	</Card.Content>
</Card.Root>

<ProyeccionLoader visible={cargando} /><CargaDatosLoader visible={s.cargandoDatos} />
