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
    ChevronRight,
    History
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean, onToggle: () => void }) {
    const t = useTranslations('navigation')
    const tCommon = useTranslations('common')
    const pathname = usePathname()
    const { user } = useAuth()

    const menuItems = [
        { name: t('dashboard'), href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "EQUIPO"] },
        { name: t('places'), href: "/dashboard/lugares", icon: MapPin, roles: ["ADMIN", "EQUIPO"] },
        { name: t('cycles'), href: "/dashboard/ciclos", icon: History, roles: ["ADMIN", "EQUIPO"] },
        { name: t('measurements'), href: "/dashboard/mediciones", icon: Database, roles: ["ADMIN", "EQUIPO"] },
        { name: t('analysis'), href: "/dashboard/analisis", icon: TrendingUp, roles: ["ADMIN", "EQUIPO"] },
        { name: t('configuration'), href: "/dashboard/configuracion", icon: Settings, roles: ["ADMIN", "EQUIPO"] },
        { name: t('users'), href: "/dashboard/usuarios", icon: Users, roles: ["ADMIN"] },
        { name: t('inDevelopment'), href: "/dashboard/en-desarrollo", icon: Rocket, roles: ["PUBLICO"] },
    ]

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
                        {tCommon('appName')}
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

            {/* Language toggle and collapse button */}
            <div className={cn(
                "p-4 border-t space-y-3",
                collapsed ? "flex flex-col items-center" : ""
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
                            <span>{t('collapse')}</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
