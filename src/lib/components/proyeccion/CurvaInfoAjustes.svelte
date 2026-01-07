<script lang="ts">
    import type { Ajuste } from './ProyeccionComponentTypes';
    interface Props {
        ajustes: Ajuste[];
    }
    let { ajustes }: Props = $props();
</script>

<div class="space-y-1.5 pt-2 border-t border-ocean-mid/20">
    <p class="text-[10px] text-muted-foreground font-medium">Ajustes aplicados:</p>
    <div class="flex flex-wrap gap-1.5">
        {#each ajustes as ajuste}
            <span class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                <span>⚡</span> {ajuste.descripcion}
            </span>
        {/each}
    </div>
</div>
