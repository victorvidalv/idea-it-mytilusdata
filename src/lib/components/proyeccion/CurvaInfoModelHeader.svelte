<script lang="ts">
    interface Props {
        nombre: string;
        fuente: string;
        codigo: string;
        idAjuste: string;
    }
    let { nombre, fuente, codigo, idAjuste }: Props = $props();
</script>

<div class="flex items-start justify-between gap-2">
    <div class="flex-1 min-w-0">
        <p class="font-semibold text-sm truncate">{nombre}</p>
        <p class="text-xs text-muted-foreground">{fuente}</p>
        {#if codigo}<p class="text-[10px] text-muted-foreground font-mono mt-0.5">{codigo}</p>{/if}
    </div>
    <span class="shrink-0 rounded-full bg-ocean-light/20 px-2 py-0.5 text-[10px] font-medium text-ocean-light">
        Ajuste #{idAjuste}
    </span>
</div>
