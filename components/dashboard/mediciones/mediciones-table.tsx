"use client"

import { Calendar, MapPin, Loader2, Edit2, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Medicion } from "@/lib/types"

interface MedicionesTableProps {
    mediciones: Medicion[]
    loading: boolean
    onEdit: (medicion: Medicion) => void
    onDelete: (id: number) => void
}

export function MedicionesTable({ mediciones, loading, onEdit, onDelete }: MedicionesTableProps) {
    if (loading) {
        return (
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/30">
                        <TableHead>Fecha</TableHead>
                        <TableHead>Lugar</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Autor</TableHead>
                        <TableHead>Notas</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell colSpan={7} className="h-40 text-center">
                            <Loader2 className="animate-spin inline mr-2" /> Cargando...
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
                    <TableHead>Fecha</TableHead>
                    <TableHead>Lugar</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
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
        </Table>
    )
}
