"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import {
    User, KeyRound, Loader2, Calendar, Database, MapPin, Ruler,
    CheckCircle, AlertCircle, Shield
} from "lucide-react"

interface UserStats {
    id: number
    nombre: string
    email: string
    rol: string
    created_at: string
    _count: {
        mediciones: number
        lugares: number
        unidades: number
    }
}

export default function PerfilPage() {
    const { user } = useAuth()
    const [stats, setStats] = useState<UserStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

    const [formData, setFormData] = useState({
        nombre: "",
        passwordActual: "",
        passwordNueva: "",
        passwordConfirm: ""
    })

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("token")
                const res = await fetch("/api/usuarios/me", {
                    headers: { "Authorization": `Bearer ${token}` }
                })
                const data = await res.json()
                if (data.success) {
                    setStats(data.data)
                    setFormData(prev => ({ ...prev, nombre: data.data.nombre }))
                }
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)

        // Validar contraseñas si se quiere cambiar
        if (formData.passwordNueva) {
            if (!formData.passwordActual) {
                setMessage({ type: "error", text: "Debes ingresar tu contraseña actual" })
                return
            }
            if (formData.passwordNueva !== formData.passwordConfirm) {
                setMessage({ type: "error", text: "Las contraseñas nuevas no coinciden" })
                return
            }
            if (formData.passwordNueva.length < 6) {
                setMessage({ type: "error", text: "La contraseña debe tener al menos 6 caracteres" })
                return
            }
        }

        setSubmitting(true)
        try {
            const token = localStorage.getItem("token")
            const body: any = {}

            if (formData.nombre !== stats?.nombre) {
                body.nombre = formData.nombre
            }
            if (formData.passwordNueva) {
                body.passwordActual = formData.passwordActual
                body.password = formData.passwordNueva
            }

            if (Object.keys(body).length === 0) {
                setMessage({ type: "error", text: "No hay cambios para guardar" })
                setSubmitting(false)
                return
            }

            const res = await fetch("/api/usuarios/me", {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            })
            const data = await res.json()

            if (data.success) {
                setMessage({ type: "success", text: "Perfil actualizado exitosamente" })
                setFormData(prev => ({
                    ...prev,
                    passwordActual: "",
                    passwordNueva: "",
                    passwordConfirm: ""
                }))
                // Actualizar stats con nuevo nombre
                if (body.nombre) {
                    setStats(prev => prev ? { ...prev, nombre: body.nombre } : prev)
                }
            } else {
                setMessage({ type: "error", text: data.message })
            }
        } catch (error) {
            console.error(error)
            setMessage({ type: "error", text: "Error al actualizar perfil" })
        } finally {
            setSubmitting(false)
        }
    }

    const getRolBadge = (rol: string) => {
        switch (rol) {
            case "ADMIN":
                return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-violet-500/10 text-violet-500 border border-violet-500/20"><Shield className="w-3 h-3" />Administrador</span>
            case "EQUIPO":
                return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20"><User className="w-3 h-3" />Equipo</span>
            default:
                return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20"><User className="w-3 h-3" />Público</span>
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-outfit flex items-center gap-3">
                    <User className="w-8 h-8 text-primary" />
                    Mi Perfil
                </h2>
                <p className="text-muted-foreground">Administra tu información personal y seguridad.</p>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/20">
                                <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Miembro desde</p>
                                <p className="font-bold text-sm">
                                    {stats?.created_at ? new Date(stats.created_at).toLocaleDateString('es-CL', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    }) : '-'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/20">
                                <Database className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Mediciones</p>
                                <p className="font-bold text-lg">{stats?._count.mediciones || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                                <MapPin className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Lugares</p>
                                <p className="font-bold text-lg">{stats?._count.lugares || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-gradient-to-br from-orange-500/5 to-orange-500/10">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-500/20">
                                <Ruler className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Unidades</p>
                                <p className="font-bold text-lg">{stats?._count.unidades || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Formulario de edición */}
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="text-lg">Información de cuenta</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Mensaje de estado */}
                        {message && (
                            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${message.type === "success"
                                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                    : "bg-destructive/10 text-destructive border border-destructive/20"
                                }`}>
                                {message.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {message.text}
                            </div>
                        )}

                        {/* Info básica */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nombre</Label>
                                <Input
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Correo electrónico</Label>
                                <Input value={stats?.email || ""} disabled className="bg-muted" />
                                <p className="text-xs text-muted-foreground">El email no se puede modificar</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Rol</Label>
                            <div>{stats && getRolBadge(stats.rol)}</div>
                        </div>

                        {/* Cambio de contraseña */}
                        <div className="pt-6 border-t">
                            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                                <KeyRound className="w-4 h-4 text-primary" />
                                Cambiar contraseña
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Contraseña actual</Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.passwordActual}
                                        onChange={(e) => setFormData({ ...formData, passwordActual: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nueva contraseña</Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.passwordNueva}
                                        onChange={(e) => setFormData({ ...formData, passwordNueva: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Confirmar nueva</Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.passwordConfirm}
                                        onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Deja los campos vacíos si no deseas cambiar la contraseña.
                            </p>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={submitting} className="gap-2">
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Guardar cambios
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
