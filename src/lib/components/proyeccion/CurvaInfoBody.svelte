<script lang="ts">
    import CurvaInfoModelHeader from './CurvaInfoModelHeader.svelte';
    import CurvaInfoParametros from './CurvaInfoParametros.svelte';
    import CurvaInfoAjustes from './CurvaInfoAjustes.svelte';
    import type { Ajuste } from './ProyeccionComponentTypes';

    interface Props {
        nombreModelo: string; fuente: string; codigo: string; idAjuste: string;
        hasParametros: boolean; parametros: any; ajustesVisibles: Ajuste[];
    }
    let { nombreModelo, fuente, codigo, idAjuste, hasParametros, parametros, ajustesVisibles }: Props = $props();
</script>

<div class="rounded-lg border border-ocean-mid/20 bg-ocean-mid/5 p-4 space-y-2">
    <CurvaInfoModelHeader nombre={nombreModelo} {fuente} {codigo} {idAjuste} />
    {#if hasParametros}<CurvaInfoParametros {parametros} />{/if}
    {#if ajustesVisibles.length > 0}<CurvaInfoAjustes ajustes={ajustesVisibles} />{/if}
</div>
