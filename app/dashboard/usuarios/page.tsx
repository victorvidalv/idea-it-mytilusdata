"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, UserCheck, UserMinus, Shield, User as UserIcon, Microscope, UserPlus } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Label } from "@/components/ui/label"
import { useTranslations } from "next-intl"

interface Usuario {
    id: number
    nombre: string
    email: string
    rol: "ADMIN" | "EQUIPO" | "PUBLICO"
    activo: boolean
    created_at: string
    _count: {
        mediciones: number
        lugares: number
        unidades: number
    }
}

export default function UsuariosPage() {
    const t = useTranslations('users')
    const tCommon = useTranslations('common')
    
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        nombre: "",
        email: "",
        password: "",
        rol: "PUBLICO"
    })

    const fetchUsuarios = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`/api/usuarios?q=${search}&inactivos=true`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) setUsuarios(data.data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsuarios()
    }, [search])

    const updateUsuario = async (id: number, data: Partial<Usuario>) => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`/api/usuarios/${id}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            const result = await res.json()
            if (result.success) {
                fetchUsuarios()
            } else {
                alert(result.message)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch("/api/usuarios", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (data.success) {
                setIsModalOpen(false)
                setFormData({ nombre: "", email: "", password: "", rol: "PUBLICO" })
                fetchUsuarios()
            } else {
                alert(data.message)
            }
        } catch (error) {
            console.error(error)
            alert(tCommon('save'))
        } finally {
            setIsSubmitting(false)
        }
    }

    const RoleBadge = ({ rol }: { rol: string }) => {
        switch (rol) {
            case "ADMIN":
                return <span className="flex items-center gap-1.5 text-violet-500 font-bold"><Shield className="w-3 h-3" /> {t('roles.ADMIN')}</span>
            case "EQUIPO":
                return <span className="flex items-center gap-1.5 text-blue-500 font-bold"><Microscope className="w-3 h-3" /> {t('roles.EQUIPO')}</span>
            default:
                return <span className="flex items-center gap-1.5 text-slate-500 font-bold"><UserIcon className="w-3 h-3" /> {t('roles.PUBLICO')}</span>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-outfit">{t('title')}</h2>
                    <p className="text-muted-foreground">{t('description')}</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-lg shadow-primary/20">
                    <UserPlus className="w-4 h-4" />
                    {t('newUser')}
                </Button>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="p-4 border-b text-center sm:text-left">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder={tCommon('search')}
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead>{t('fields.name')}</TableHead>
                                <TableHead>{t('fields.role')}</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>{tCommon('measurements')}</TableHead>
                                <TableHead className="text-right">{tCommon('actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && usuarios.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary opacity-50" />
                                    </TableCell>
                                </TableRow>
                            ) : usuarios.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                usuarios.map((u) => (
                                    <TableRow key={u.id} className="group transition-colors hover:bg-muted/30">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                                    <span className="font-bold text-primary text-xs">{u.nombre?.[0].toUpperCase()}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{u.nombre}</span>
                                                    <span className="text-xs text-muted-foreground">{u.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <select
                                                    className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer border-b border-transparent hover:border-primary/30 transition-colors py-1"
                                                    value={u.rol}
                                                    onChange={(e) => updateUsuario(u.id, { rol: e.target.value as any })}
                                                >
                                                    <option value="ADMIN">{t('roles.ADMIN')}</option>
                                                    <option value="EQUIPO">{t('roles.EQUIPO')}</option>
                                                    <option value="PUBLICO">{t('roles.PUBLICO')}</option>
                                                </select>
                                                <div className="opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <RoleBadge rol={u.rol} />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold border ${u.activo ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                                {u.activo ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-[11px] text-muted-foreground">
                                                <span>{u._count.mediciones} {tCommon('measurements')}</span>
                                                <span className="text-[10px] opacity-60">ID: {u.id}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`gap-2 ${u.activo ? 'hover:text-rose-500 hover:bg-rose-500/10' : 'hover:text-emerald-500 hover:bg-emerald-500/10'}`}
                                                onClick={() => updateUsuario(u.id, { activo: !u.activo })}
                                            >
                                                {u.activo ? (
                                                    <><UserMinus className="w-4 h-4" /> Deactivate</>
                                                ) : (
                                                    <><UserCheck className="w-4 h-4" /> Activate</>
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Modal para Nuevo Usuario */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={t('newUser')}
                description="Enter new team member data."
            >
                <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nombre">{t('fields.name')}</Label>
                        <Input
                            id="nombre"
                            placeholder={t('placeholders.name')}
                            required
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">{t('fields.email')}</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder={t('placeholders.email')}
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">{t('fields.password')}</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rol">{t('fields.role')}</Label>
                        <select
                            id="rol"
                            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.rol}
                            onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                        >
                            <option value="PUBLICO">{t('roles.PUBLICO')}</option>
                            <option value="EQUIPO">{t('roles.EQUIPO')}</option>
                            <option value="ADMIN">{t('roles.ADMIN')}</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                            {tCommon('cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                            {tCommon('create')}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
