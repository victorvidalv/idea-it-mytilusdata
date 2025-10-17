"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Plus, Tag, Loader2, Trash2, Edit2, Database } from "lucide-react"
import { useTranslations } from "next-intl"

interface TipoRegistro {
    id: number
    codigo: string
    descripcion: string | null
    _count: {
        mediciones: number
    }
}

export default function TiposRegistroPage() {
    const t = useTranslations('recordTypes')
    const tCommon = useTranslations('common')
    const tMessages = useTranslations('messages')
    
    const [tipos, setTipos] = useState<TipoRegistro[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [editingTipo, setEditingTipo] = useState<TipoRegistro | null>(null)

    const [formData, setFormData] = useState({ codigo: "", descripcion: "" })

    const fetchTipos = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch("/api/tipos-registro", {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) setTipos(data.data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchTipos() }, [])

    const openCreateModal = () => {
        setEditingTipo(null)
        setFormData({ codigo: "", descripcion: "" })
        setIsModalOpen(true)
    }

    const openEditModal = (tipo: TipoRegistro) => {
        setEditingTipo(tipo)
        setFormData({ codigo: tipo.codigo, descripcion: tipo.descripcion || "" })
        setIsModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm(tMessages('confirm.delete'))) return
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`/api/tipos-registro/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                fetchTipos()
            } else {
                alert(data.message)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const token = localStorage.getItem("token")
            const isEditing = !!editingTipo
            const url = isEditing ? `/api/tipos-registro/${editingTipo.id}` : "/api/tipos-registro"
            const method = isEditing ? "PUT" : "POST"

            // Si es edición, solo enviamos descripción (código es inmutable)
            const body = isEditing
                ? { descripcion: formData.descripcion }
                : formData

            const res = await fetch(url, {
                method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            })
            const data = await res.json()
            if (data.success) {
                setIsModalOpen(false)
                setFormData({ codigo: "", descripcion: "" })
                fetchTipos()
            } else {
                alert(data.message)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-outfit">{t('title')}</h2>
                    <p className="text-muted-foreground">{t('description')}</p>
                </div>
                <Button onClick={openCreateModal} className="gap-2">
                    <Plus className="w-4 h-4" /> {t('newRecordType')}
                </Button>
            </div>

            <Card className="border-border/50">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead>{t('fields.name')}</TableHead>
                                <TableHead>{t('fields.description')}</TableHead>
                                <TableHead className="text-center">{tCommon('measurements')}</TableHead>
                                <TableHead className="text-right">{tCommon('actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-40 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary opacity-50" />
                                    </TableCell>
                                </TableRow>
                            ) : tipos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-40 text-center text-muted-foreground">
                                        No record types defined.
                                    </TableCell>
                                </TableRow>
                            ) : tipos.map((tipo) => (
                                <TableRow key={tipo.id} className="group">
                                    <TableCell>
                                        <code className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold flex items-center gap-2 w-fit">
                                            <Tag className="w-3 h-3" />
                                            {tipo.codigo}
                                        </code>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {tipo.descripcion || <span className="italic opacity-50">{t('fields.description')}</span>}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                            <Database className="w-3 h-3" />
                                            {tipo._count.mediciones}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                                onClick={() => openEditModal(tipo)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(tipo.id)}
                                                disabled={tipo._count.mediciones > 0}
                                                title={tipo._count.mediciones > 0 ? "Cannot delete: has measurements" : tCommon('delete')}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTipo ? t('editRecordType') : t('newRecordType')}
                description={editingTipo ? "Only description can be edited" : "Define a new type to classify measurements"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="t-codigo">{t('fields.name')}</Label>
                        <Input
                            id="t-codigo"
                            required={!editingTipo}
                            disabled={!!editingTipo}
                            placeholder={t('placeholders.name')}
                            value={formData.codigo}
                            onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                            className={editingTipo ? "bg-muted" : ""}
                        />
                        {editingTipo && (
                            <p className="text-xs text-muted-foreground">Code cannot be modified</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="t-descripcion">{t('fields.description')}</Label>
                        <Input
                            id="t-descripcion"
                            placeholder={t('placeholders.description')}
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        />
                    </div>
                    <Button type="submit" className="w-full mt-4" disabled={submitting}>
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {editingTipo ? tCommon('update') : tCommon('save')} {t('title')}
                    </Button>
                </form>
            </Modal>
        </div>
    )
}
