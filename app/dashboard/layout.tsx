"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"
import { UserMenu } from "@/components/dashboard/user-menu"
import { useTranslations } from "next-intl"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { loading } = useAuth()
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    // Persistir el estado del sidebar en localStorage
    useEffect(() => {
        const saved = localStorage.getItem("sidebar-collapsed")
        if (saved !== null) {
            setSidebarCollapsed(saved === "true")
        }
    }, [])

    const toggleSidebar = () => {
        setSidebarCollapsed(prev => {
            const newValue = !prev
            localStorage.setItem("sidebar-collapsed", String(newValue))
            return newValue
        })
    }

    const t = useTranslations('common')
    const tDashboard = useTranslations('dashboard')

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium animate-pulse">{t('loading')}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
            <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 border-b border-border/40 flex items-center justify-end px-8 gap-3 bg-background/50 backdrop-blur-md sticky top-0 z-10">
                    <UserMenu />
                </header>
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}
