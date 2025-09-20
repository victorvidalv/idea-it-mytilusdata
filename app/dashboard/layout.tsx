"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { loading } = useAuth()

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium animate-pulse">Cargando sistema...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 border-b border-border/40 flex items-center justify-end px-8 gap-4 bg-background/50 backdrop-blur-md sticky top-0 z-10">
                    <ThemeToggle />
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
