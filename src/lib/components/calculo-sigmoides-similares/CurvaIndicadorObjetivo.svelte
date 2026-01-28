<script lang="ts">
    import type { Metadatos, CurvaUsada } from './ProyeccionComponentTypes';
    
    interface Props {
        metadatos: Metadatos;
        curvaUsada: CurvaUsada;
    }
    let { metadatos, curvaUsada }: Props = $props();

    // Extraer talla máxima según el modelo usado
    function getTallaMaxima(parametros: CurvaUsada['parametros']): number | undefined {
        if (!parametros) return undefined;
        const values = parametros as Record<string, number>;
        if (values.L !== undefined) return values.L;
        if (values.Linf !== undefined) return values.Linf;
        if (values.a !== undefined) return values.a;
        return undefined;
    }

    let tallaMax = $derived(getTallaMaxima(curvaUsada.parametros));
    let esMetaSuperada = $derived(metadatos.tallaObjetivo && tallaMax !== undefined && metadatos.tallaObjetivo >= tallaMax);
    let mesObjetivo = $derived(
        metadatos.diaObjetivo != null
            ? Math.max(1, Math.ceil((metadatos.diaObjetivo - (metadatos.diaInicioProyeccion ?? 0)) / 30))
            : undefined
    );
</script>

{#if metadatos.diaObjetivo != null && metadatos.tallaObjetivo}
    <div class="space-y-1 rounded-lg bg-ocean-mid/10 p-2 -m-1">
        <p class="text-[10px] font-medium uppercase tracking-wider text-ocean-mid">Objetivo estimado</p>
        <p class="font-mono text-lg font-bold text-ocean-mid">Mes {mesObjetivo}</p>
        <p class="text-[10px] text-muted-foreground">día {metadatos.diaObjetivo} desde el primer dato</p>
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
