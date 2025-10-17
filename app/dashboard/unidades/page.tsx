"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Plus, Ruler, Loader2, Trash2, Edit2 } from "lucide-react"
import { useTranslations } from "next-intl"

interface Unidad {
    id: number
    nombre: string
    sigla: string
}

export default function UnidadesPage() {
    const t = useTranslations('units')
    const tCommon = useTranslations('common')
    const tMessages = useTranslations('messages')
    
    const [unidades, setUnidades] = useState<Unidad[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [editingUnidad, setEditingUnidad] = useState<Unidad | null>(null)

    const [formData, setFormData] = useState({ nombre: "", sigla: "" })

    const fetchUnidades = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch("/api/unidades", {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) setUnidades(data.data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchUnidades() }, [])

    const openCreateModal = () => {
        setEditingUnidad(null)
        setFormData({ nombre: "", sigla: "" })
        setIsModalOpen(true)
    }

    const openEditModal = (unidad: Unidad) => {
        setEditingUnidad(unidad)
        setFormData({ nombre: unidad.nombre, sigla: unidad.sigla })
        setIsModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm(tMessages('confirm.delete'))) return
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`/api/unidades/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                fetchUnidades()
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
            const url = editingUnidad ? `/api/unidades/${editingUnidad.id}` : "/api/unidades"
            const method = editingUnidad ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (data.success) {
                setIsModalOpen(false)
                setFormData({ nombre: "", sigla: "" })
                fetchUnidades()
            } else { alert(data.message) }
        } catch (error) { console.error(error) }
        finally { setSubmitting(false) }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-outfit">{t('title')}</h2>
                    <p className="text-muted-foreground">{t('description')}</p>
                </div>
                <Button onClick={openCreateModal} className="gap-2">
                    <Plus className="w-4 h-4" /> {t('newUnit')}
                </Button>
            </div>

            <Card className="border-border/50">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead>{t('fields.name')}</TableHead>
                                <TableHead>{t('fields.symbol')}</TableHead>
                                <TableHead className="text-right">{tCommon('actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={3} className="h-40 text-center text-muted-foreground">{tCommon('loading')}</TableCell></TableRow>
                            ) : unidades.map((u) => (
                                <TableRow key={u.id} className="group">
                                    <TableCell className="font-medium">{u.nombre}</TableCell>
                                    <TableCell>
                                        <code className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">{u.sigla}</code>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                                onClick={() => openEditModal(u)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(u.id)}
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
                title={editingUnidad ? t('editUnit') : t('newUnit')}
                description={editingUnidad ? "Update measurement unit data" : "Define a new measurement unit"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="u-nombre">{t('fields.name')}</Label>
                        <Input
                            id="u-nombre"
                            required
                            placeholder={t('placeholders.name')}
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="u-sigla">{t('fields.symbol')}</Label>
                        <Input
                            id="u-sigla"
                            required
                            placeholder={t('placeholders.symbol')}
                            value={formData.sigla}
                            onChange={(e) => setFormData({ ...formData, sigla: e.target.value })}
                        />
                    </div>
                    <Button type="submit" className="w-full mt-4" disabled={submitting}>
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {editingUnidad ? tCommon('update') : tCommon('save')} {t('title')}
                    </Button>
                </form>
            </Modal>
        </div>
    )
}
