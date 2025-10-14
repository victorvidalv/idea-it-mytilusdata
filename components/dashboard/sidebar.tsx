"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Database,
    MapPin,
    Users,
    Calculator,
    TrendingUp,
    Rocket,
    Settings,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"

const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "EQUIPO"] },
    { name: "Mediciones", href: "/dashboard/mediciones", icon: Database, roles: ["ADMIN", "EQUIPO"] },
    { name: "Análisis", href: "/dashboard/analisis", icon: TrendingUp, roles: ["ADMIN", "EQUIPO"] },
    { name: "Lugares", href: "/dashboard/lugares", icon: MapPin, roles: ["ADMIN", "EQUIPO"] },
    { name: "Configuración", href: "/dashboard/configuracion", icon: Settings, roles: ["ADMIN", "EQUIPO"] },
    { name: "Usuarios", href: "/dashboard/usuarios", icon: Users, roles: ["ADMIN"] },
    { name: "En Desarrollo", href: "/dashboard/en-desarrollo", icon: Rocket, roles: ["PUBLICO"] },
]

interface SidebarProps {
    collapsed: boolean
    onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname()
    const { user } = useAuth()

    return (
        <div
            className={cn(
                "flex flex-col bg-card border-r h-screen sticky top-0 transition-all duration-300",
                collapsed ? "w-[72px]" : "w-64"
            )}
        >
            <div className={cn(
                "p-4 flex items-center gap-3",
                collapsed ? "justify-center" : "px-6"
            )}>
                <div className="bg-primary p-2 rounded-lg text-primary-foreground shrink-0">
                    <Calculator className="w-6 h-6" />
                </div>
                {!collapsed && (
                    <span className="font-outfit font-bold text-xl tracking-tight whitespace-nowrap">
                        IT25I0032
                    </span>
                )}
            </div>

            <nav className={cn(
                "flex-1 space-y-1 mt-4",
                collapsed ? "px-2" : "px-4"
            )}>
                {menuItems
                    .filter(item => !user?.rol || item.roles.includes(user.rol))
                    .map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={collapsed ? item.name : undefined}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors group",
                                    collapsed ? "px-3 py-2.5 justify-center" : "px-3 py-2.5",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                )}
                            >
                                <item.icon className={cn(
                                    "w-5 h-5 shrink-0",
                                    isActive ? "" : "group-hover:text-primary"
                                )} />
                                {!collapsed && (
                                    <span className="whitespace-nowrap">{item.name}</span>
                                )}
                            </Link>
                        )
                    })}
            </nav>

            {/* Botón para colapsar/expandir */}
            <div className={cn(
                "p-4 border-t",
                collapsed ? "flex justify-center" : ""
            )}>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className={cn(
                        "gap-2 text-muted-foreground hover:text-foreground",
                        collapsed ? "w-10 h-10 p-0" : "w-full justify-start"
                    )}
                >
                    {collapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <>
                            <ChevronLeft className="w-4 h-4" />
                            <span>Colapsar</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
