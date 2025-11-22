"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Edit, Trash2, Calendar, MapPin, CheckCircle2, XCircle } from "lucide-react"
import { Ciclo } from "../hooks/use-ciclos"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface CiclosTableProps {
    ciclos: Ciclo[]
    loading: boolean
    lugares: { id: number; nombre: string }[]
    filters: { lugar_id: string; activo: string }
    setFilters: (filters: any) => void
    onEdit: (ciclo: Ciclo) => void
    onDelete: (id: number) => void
    t: any
    tCommon: any
}

export function CiclosTable({
    ciclos,
    loading,
    lugares,
    filters,
    setFilters,
    onEdit,
    onDelete,
    t,
    tCommon
}: CiclosTableProps) {

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-"
        try {
            return format(new Date(dateString), "PPP", { locale: es })
        } catch (e) {
            return dateString
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <Select
                        value={filters.lugar_id}
                        onValueChange={(val) => setFilters({ ...filters, lugar_id: val })}
                    >
                        <SelectTrigger className="w-full md:w-[300px] bg-background/50 border-border/50 backdrop-blur-sm">
                            <SelectValue placeholder={t('placeholders.place')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{tCommon('all') || "Todos los lugares"}</SelectItem>
                            {lugares.map((lugar) => (
                                <SelectItem key={lugar.id} value={lugar.id.toString()}>
                                    {lugar.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-full md:w-[200px]">
                    <Select
                        value={filters.activo}
                        onValueChange={(val) => setFilters({ ...filters, activo: val })}
                    >
                        <SelectTrigger className="bg-background/50 border-border/50 backdrop-blur-sm">
                            <SelectValue placeholder={tCommon('status')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{tCommon('all') || "Todos"}</SelectItem>
                            <SelectItem value="true">{t('activeIndicator')}</SelectItem>
                            <SelectItem value="false">{t('inactiveIndicator')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setFilters({ lugar_id: "", activo: "" })}
                    className="shrink-0"
                >
                    {tCommon('clear')}
                </Button>
            </div>

            <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-md shadow-xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-bold">{t('fields.name')}</TableHead>
                            <TableHead className="font-bold">{t('fields.place')}</TableHead>
                            <TableHead className="font-bold">{t('fields.sowingDate')}</TableHead>
                            <TableHead className="font-bold">{t('fields.active')}</TableHead>
                            <TableHead className="font-bold text-center">{t('fields.daysSinceSowing')}</TableHead>
                            <TableHead className="text-right font-bold">{tCommon('actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-12 mx-auto" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : ciclos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
                                    No se encontraron ciclos de cultivo registrados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            ciclos.map((ciclo) => (
                                <TableRow key={ciclo.id} className="group hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{ciclo.nombre}</span>
                                            {ciclo.notas && <span className="text-xs text-muted-foreground line-clamp-1">{ciclo.notas}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <MapPin className="w-3.5 h-3.5 text-primary/60" />
                                            {ciclo.lugar?.nombre || "-"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Calendar className="w-3.5 h-3.5 text-primary/60" />
                                            {formatDate(ciclo.fecha_siembra)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {ciclo.activo ? (
                                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 gap-1 px-2">
                                                <CheckCircle2 className="w-3 h-3" />
                                                {t('activeIndicator')}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-muted-foreground gap-1 px-2 border-border/50">
                                                <XCircle className="w-3 h-3" />
                                                {t('inactiveIndicator')}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center font-outfit font-bold">
                                        {/* Este valor vendría del API enriquecido o calculado aquí */}
                                        <div className="inline-flex items-center justify-center p-1.5 bg-primary/5 rounded-lg text-primary min-w-[3rem]">
                                            {ciclo._count?.mediciones || 0}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{tCommon('measurements')}</div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                onClick={() => onEdit(ciclo)}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => onDelete(ciclo.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
