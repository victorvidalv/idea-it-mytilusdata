"use client"

import { Calendar, MapPin, Loader2, Edit2, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Medicion } from "@/lib/types"
import { useTranslations } from "next-intl"

interface Pagination {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
}

interface MedicionesTableProps {
    mediciones: Medicion[]
    loading: boolean
    pagination: Pagination
    onEdit: (medicion: Medicion) => void
    onDelete: (id: number) => void
    onPageChange: (page: number) => void
}

export function MedicionesTable({
    mediciones,
    loading,
    pagination,
    onEdit,
    onDelete,
    onPageChange
}: MedicionesTableProps) {
    const t = useTranslations('measurements')
    const tCommon = useTranslations('common')

    if (loading) {
        return (
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/30">
                        <TableHead>{t('fields.date')}</TableHead>
                        <TableHead>{t('fields.place')}</TableHead>
                        <TableHead>{t('fields.cycles') || "Ciclo"}</TableHead>
                        <TableHead className="text-center">{t('fields.daysSinceSowing') || "Días"}</TableHead>
                        <TableHead>{t('fields.value')}</TableHead>
                        <TableHead>{t('fields.recordType')}</TableHead>
                        <TableHead>{tCommon('users')}</TableHead>
                        <TableHead>{t('fields.notes')}</TableHead>
                        <TableHead className="text-right">{tCommon('actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell colSpan={9} className="h-40 text-center">
                            <Loader2 className="animate-spin inline mr-2" /> {tCommon('loading')}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="bg-muted/30">
                    <TableHead>{t('fields.date')}</TableHead>
                    <TableHead>{t('fields.place')}</TableHead>
                    <TableHead>{t('fields.cycles') || "Ciclo"}</TableHead>
                    <TableHead className="text-center">{t('fields.daysSinceSowing') || "Días"}</TableHead>
                    <TableHead>{t('fields.value')}</TableHead>
                    <TableHead>{t('fields.recordType')}</TableHead>
                    <TableHead>{tCommon('users')}</TableHead>
                    <TableHead>{t('fields.notes')}</TableHead>
                    <TableHead className="text-right">{tCommon('actions')}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {mediciones.map((m) => (
                    <TableRow key={m.id} className="group hover:bg-muted/10 transition-colors">
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                {new Date(m.fecha_medicion).toLocaleDateString()}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary/70" />
                                {m.lugar.nombre}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{(m as any).ciclo?.nombre || "-"}</span>
                                {(m as any).ciclo?.fecha_siembra && (
                                    <span className="text-[10px] text-muted-foreground italic">
                                        Desde: {new Date((m as any).ciclo.fecha_siembra).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </TableCell>
                        <TableCell className="text-center font-outfit font-bold">
                            {(m as any).dias_desde_siembra !== null ? (
                                <div className="inline-flex items-center justify-center p-1 bg-primary/10 rounded min-w-[2rem] text-primary">
                                    {(m as any).dias_desde_siembra}
                                </div>
                            ) : "-"}
                        </TableCell>
                        <TableCell className="font-bold text-lg">
                            {m.valor} <span className="text-sm font-medium text-muted-foreground">{m.unidad.sigla}</span>
                        </TableCell>
                        <TableCell>
                            <span className="bg-accent px-2 py-0.5 rounded text-[10px] font-bold uppercase border">
                                {m.tipo.codigo}
                            </span>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                    {m.registrado_por.nombre.charAt(0)}
                                </div>
                                <span className="text-sm">{m.registrado_por.nombre}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <span className="text-xs text-muted-foreground line-clamp-1 italic" title={m.notas || ""}>
                                {m.notas || "-"}
                            </span>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                    onClick={() => onEdit(m)}
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => onDelete(m.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
            <tfoot className="border-t bg-muted/5">
                <tr>
                    <td colSpan={9} className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                {tCommon('total')}: <span className="font-medium text-foreground">{pagination.total}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-sm text-muted-foreground">
                                    {t('fields.page')} <span className="font-medium text-foreground">{pagination.page}</span> / {pagination.totalPages}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!pagination.hasPrevious || loading}
                                        onClick={() => onPageChange(pagination.page - 1)}
                                    >
                                        {tCommon('previous')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!pagination.hasNext || loading}
                                        onClick={() => onPageChange(pagination.page + 1)}
                                    >
                                        {tCommon('next')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            </tfoot>
        </Table>
    )
}
