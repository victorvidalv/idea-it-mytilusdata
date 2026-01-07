<!--
Subcomponente: Información del modelo.
Refactorización extrema: Lógica movida a CurvaInformacionLogic.ts.
Debe bajar de 10 de complejidad.
-->
<script lang="ts">
    import type { Ajuste } from './ProyeccionComponentTypes';
    import CurvaInfoBody from './CurvaInfoBody.svelte';
    import { getCurvaInfoDerivados } from './CurvaInformacionLogic';

	interface Props {
		nombreModelo: string; fuente: string; codigo?: string;
		ajustes?: Ajuste[]; parametros?: any; mostrarParametros?: boolean;
	}

	let { nombreModelo, fuente, codigo = '', ajustes = [], parametros = {}, mostrarParametros = false }: Props = $props();

    let d = $derived(getCurvaInfoDerivados(codigo, parametros, mostrarParametros, ajustes));
</script>

<div class="space-y-2">
	<h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
		<span>📊</span> Información del Modelo
	</h4>
	<CurvaInfoBody {nombreModelo} {fuente} {codigo} idAjuste={d.idAjuste} hasParametros={d.hasParametros} {parametros} ajustesVisibles={d.ajustesVisibles} />
</div>
