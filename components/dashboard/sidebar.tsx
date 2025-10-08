"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Database,
    MapPin,
    Ruler,
    History,
    Users,
    LogOut,
    Calculator,
    TrendingUp,
    Rocket
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "INVESTIGADOR"] },
    { name: "Mediciones", href: "/dashboard/mediciones", icon: Database, roles: ["ADMIN", "INVESTIGADOR"] },
    { name: "Análisis", href: "/dashboard/analisis", icon: TrendingUp, roles: ["ADMIN", "INVESTIGADOR"] },
    { name: "Lugares", href: "/dashboard/lugares", icon: MapPin, roles: ["ADMIN", "INVESTIGADOR"] },
    { name: "Unidades", href: "/dashboard/unidades", icon: Ruler, roles: ["ADMIN", "INVESTIGADOR"] },
    { name: "Orígenes", href: "/dashboard/origenes", icon: Database, roles: ["ADMIN", "INVESTIGADOR"] },
    { name: "Auditoría", href: "/dashboard/bitacora", icon: History, roles: ["ADMIN"] },
    { name: "Usuarios", href: "/dashboard/usuarios", icon: Users, roles: ["ADMIN"] },
    { name: "En Desarrollo", href: "/dashboard/en-desarrollo", icon: Rocket, roles: ["PUBLICO"] },
]

export function Sidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()

    return (
        <div className="flex flex-col w-64 bg-card border-r h-screen sticky top-0">
            <div className="p-6 flex items-center gap-3">
                <div className="bg-primary p-2 rounded-lg text-primary-foreground">
                    <Calculator className="w-6 h-6" />
                </div>
                <span className="font-outfit font-bold text-xl tracking-tight">IT25I0032</span>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-4">
                {menuItems
                    .filter(item => !user?.rol || item.roles.includes(user.rol))
                    .map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5", isActive ? "" : "group-hover:text-primary")} />
                                {item.name}
                            </Link>
                        )
                    })}
            </nav>

            <div className="p-4 border-t bg-muted/20">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/10">
                        <span className="font-bold text-primary">{user?.nombre?.[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{user?.nombre}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                    onClick={logout}
                >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                </Button>
            </div>
        </div>
    )
}
