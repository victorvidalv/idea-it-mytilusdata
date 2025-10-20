import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MapPin, Globe, Edit2, Trash2, Loader2 } from "lucide-react"
import { LugaresSearchBar } from "./lugares-search-bar"

interface Lugar {
    id: number
    nombre: string
    nota: string | null
    latitud: string | null
    longitud: string | null
    _count?: { mediciones: number }
}

interface LugaresTableProps {
    lugares: Lugar[]
    loading: boolean
    search: string
    setSearch: (value: string) => void
    onEdit: (lugar: Lugar) => void
    onDelete: (id: number) => void
    t: any
    tCommon: any
}

// Componente de tabla para mostrar lugares
export function LugaresTable({
    lugares,
    loading,
    search,
    setSearch,
    onEdit,
    onDelete,
    t,
    tCommon
}: LugaresTableProps) {
    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-md shadow-xl overflow-hidden">
            <CardHeader className="p-4 border-b bg-muted/20">
                <LugaresSearchBar search={search} setSearch={setSearch} tCommon={tCommon} />
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30">
                            <TableHead className="font-bold">{t('fields.name')}</TableHead>
                            <TableHead className="font-bold">{t('fields.latitude')} / {t('fields.longitude')}</TableHead>
                            <TableHead className="font-bold">{t('records')}</TableHead>
                            <TableHead className="font-bold">{t('fields.description')}</TableHead>
                            <TableHead className="text-right font-bold">{tCommon('actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-60 text-center">
                                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary opacity-30" />
                                </TableCell>
                            </TableRow>
                        ) : lugares.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-40 text-center text-muted-foreground italic">
                                    {tCommon('loading')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            lugares.map((lugar) => (
                                <TableRow key={lugar.id} className="group hover:bg-primary/5 transition-all">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-sm tracking-tight">{lugar.nombre}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {lugar.latitud ? (
                                            <div className="flex items-center gap-2 text-xs font-mono bg-muted/50 w-fit px-2 py-1 rounded border border-border/50">
                                                <Globe className="w-3 h-3 text-muted-foreground" />
                                                {parseFloat(lugar.latitud).toFixed(4)}, {parseFloat(lugar.longitud!).toFixed(4)}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-xs italic">{t('noCoordinates')}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-xs font-medium text-muted-foreground">
                                                {lugar._count?.mediciones || 0} {t('records')}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] text-xs text-muted-foreground truncate">
                                        {lugar.nota || "—"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => onEdit(lugar)}>
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => onDelete(lugar.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
