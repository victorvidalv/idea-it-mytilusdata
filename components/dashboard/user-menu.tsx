"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogOut, User, KeyRound, Loader2, ChevronDown } from "lucide-react"

export function UserMenu() {
    const { user, logout } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        nombre: "",
        password: "",
        passwordConfirm: ""
    })

    const openModal = () => {
        setFormData({
            nombre: user?.nombre || "",
            password: "",
            passwordConfirm: ""
        })
        setIsModalOpen(true)
        setIsOpen(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password && formData.password !== formData.passwordConfirm) {
            alert("Las contraseñas no coinciden")
            return
        }

        setSubmitting(true)
        try {
            const token = localStorage.getItem("token")
            const body: any = {}
            if (formData.nombre !== user?.nombre) body.nombre = formData.nombre
            if (formData.password) body.password = formData.password

            if (Object.keys(body).length === 0) {
                setIsModalOpen(false)
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
                setIsModalOpen(false)
                // Recargar para actualizar datos de usuario
                window.location.reload()
            } else {
                alert(data.message)
            }
        } catch (error) {
            console.error(error)
            alert("Error al actualizar perfil")
        } finally {
            setSubmitting(false)
        }
    }

    const initials = user?.nombre?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?"

    return (
        <>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full border border-border/40 bg-background/50 backdrop-blur-sm hover:bg-accent transition-colors"
                >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
                        <span className="text-sm font-bold text-primary">{initials}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <>
                        {/* Overlay para cerrar */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown */}
                        <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                            <div className="p-3 border-b bg-muted/30">
                                <p className="font-semibold text-sm truncate">{user?.nombre}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            </div>
                            <div className="p-1">
                                <button
                                    onClick={openModal}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left rounded-md hover:bg-accent transition-colors"
                                >
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    Editar Perfil
                                </button>
                                <button
                                    onClick={() => { setIsOpen(false); logout() }}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modal de edición de perfil */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Editar Perfil"
                description="Actualiza tu nombre o contraseña"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-nombre">Nombre</Label>
                        <Input
                            id="edit-nombre"
                            required
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                            <KeyRound className="w-3 h-3" />
                            Cambiar contraseña (opcional)
                        </p>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="edit-password">Nueva Contraseña</Label>
                                <Input
                                    id="edit-password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-password-confirm">Confirmar Contraseña</Label>
                                <Input
                                    id="edit-password-confirm"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.passwordConfirm}
                                    onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            className="flex-1"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" className="flex-1" disabled={submitting}>
                            {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            Guardar
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    )
}
