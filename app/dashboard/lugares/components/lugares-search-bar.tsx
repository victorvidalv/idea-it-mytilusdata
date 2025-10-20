import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface LugaresSearchBarProps {
    search: string
    setSearch: (value: string) => void
    tCommon: any
}

// Componente de barra de búsqueda para lugares
export function LugaresSearchBar({ search, setSearch, tCommon }: LugaresSearchBarProps) {
    return (
        <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
                placeholder={tCommon('search')}
                className="pl-10 h-10 border-none bg-background/50 focus-visible:ring-1"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
    )
}
