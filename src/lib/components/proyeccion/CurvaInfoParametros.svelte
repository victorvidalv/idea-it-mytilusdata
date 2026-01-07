<script lang="ts">
    interface Props {
        parametros: { L?: number; k?: number; x0?: number; };
    }
    let { parametros }: Props = $props();
</script>

<div class="grid grid-cols-3 gap-2 pt-2 border-t border-ocean-mid/20">
    {#if parametros.L !== undefined}
        <div class="text-center">
            <p class="text-[10px] text-muted-foreground">L (mm)</p>
            <p class="font-mono text-xs font-semibold">{parametros.L.toFixed(1)}</p>
        </div>
    {/if}
    {#if parametros.k !== undefined}
        <div class="text-center">
            <p class="text-[10px] text-muted-foreground">k (1/día)</p>
            <p class="font-mono text-xs font-semibold">{parametros.k.toFixed(4)}</p>
        </div>
    {/if}
    {#if parametros.x0 !== undefined}
        <div class="text-center">
            <p class="text-[10px] text-muted-foreground">x₀ (día)</p>
            <p class="font-mono text-xs font-semibold">{parametros.x0.toFixed(1)}</p>
        </div>
    {/if}
</div>
