"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { LogOut, User, ChevronDown } from "lucide-react"
import { useState } from "react"

export function UserMenu() {
    const router = useRouter()
    const { user, logout } = useAuth()
    const [isOpen, setIsOpen] = useState(false)

    const initials = user?.nombre?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?"

    const goToProfile = () => {
        setIsOpen(false)
        router.push("/dashboard/perfil")
    }

    return (
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
                                onClick={goToProfile}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left rounded-md hover:bg-accent transition-colors"
                            >
                                <User className="w-4 h-4 text-muted-foreground" />
                                Mi Perfil
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
    )
}
