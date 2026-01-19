<script lang="ts">
    import type { Metadatos, CurvaUsada } from './ProyeccionComponentTypes';
    
    interface Props {
        metadatos: Metadatos;
        curvaUsada: CurvaUsada;
    }
    let { metadatos, curvaUsada }: Props = $props();

    // Extraer talla máxima según el modelo usado
    function getTallaMaxima(parametros: Record<string, number> | undefined): number | undefined {
        if (!parametros) return undefined;
        if (parametros.L !== undefined) return parametros.L;
        if (parametros.Linf !== undefined) return parametros.Linf;
        if (parametros.a !== undefined) return parametros.a;
        return undefined;
    }

    let tallaMax = $derived(getTallaMaxima(curvaUsada.parametros));
    let esMetaSuperada = $derived(metadatos.tallaObjetivo && tallaMax !== undefined && metadatos.tallaObjetivo >= tallaMax);
</script>

{#if metadatos.diaObjetivo && metadatos.tallaObjetivo}
    <div class="space-y-1 rounded-lg bg-ocean-mid/10 p-2 -m-1">
        <p class="text-[10px] font-medium uppercase tracking-wider text-ocean-mid">🎯 Día estimado</p>
        <p class="font-mono text-lg font-bold text-ocean-mid">Día {metadatos.diaObjetivo}</p>
        <p class="text-[10px] text-muted-foreground">para alcanzar {metadatos.tallaObjetivo} mm</p>
    </div>
{:else if metadatos.tallaObjetivo}
    <div class="space-y-1 rounded-lg bg-yellow-500/10 p-2 -m-1">
        <p class="text-[10px] font-medium uppercase tracking-wider text-yellow-600">⚠️ Meta</p>
        <p class="font-mono text-sm font-semibold text-yellow-600">{metadatos.tallaObjetivo} mm</p>
        <p class="text-[10px] text-muted-foreground">
            {#if esMetaSuperada && tallaMax !== undefined}
                Supera talla máx = {tallaMax.toFixed(1)} mm
            {:else}
                Fuera del rango proyectable
            {/if}
        </p>
    </div>
{/if}
