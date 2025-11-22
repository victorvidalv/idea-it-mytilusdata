"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { LogOut, User, ChevronDown, Moon, Sun, Monitor, Languages } from "lucide-react"
import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { getLocale, setLocale, type Locale } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function UserMenu() {
    const t = useTranslations('auth')
    const tProfile = useTranslations('profile')
    const tCommon = useTranslations('common')

    const router = useRouter()
    const { user, logout } = useAuth()
    const { theme, setTheme } = useTheme()
    const [isOpen, setIsOpen] = useState(false)
    const [currentLocale, setCurrentLocale] = useState<Locale>("es")
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        setCurrentLocale(getLocale())
    }, [])

    const initials = user?.nombre?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?"

    const goToProfile = () => {
        setIsOpen(false)
        router.push("/dashboard/perfil")
    }

    if (!mounted) return null

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1 rounded-full border border-border/40 bg-background/50 backdrop-blur-sm hover:bg-accent hover:border-border transition-all duration-200 group"
            >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform">
                    <span className="text-xs font-bold text-primary">{initials}</span>
                </div>
                <ChevronDown className={cn("w-3.5 h-3.5 m-1 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                    <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b bg-muted/30">
                            <p className="font-bold text-sm text-foreground">{user?.nombre}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>

                        <div className="p-2 space-y-3">
                            {/* Tema */}
                            <div className="px-2 pt-1">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">{t('theme')}</p>
                                <div className="grid grid-cols-3 gap-1 bg-muted/40 p-1 rounded-lg">
                                    {[
                                        { value: 'light', icon: Sun, label: t('themeLight') },
                                        { value: 'dark', icon: Moon, label: t('themeDark') },
                                        { value: 'system', icon: Monitor, label: t('themeAuto') }
                                    ].map((item) => (
                                        <button
                                            key={item.value}
                                            onClick={() => setTheme(item.value)}
                                            className={cn(
                                                "flex flex-col items-center gap-1.5 py-2 rounded-md transition-all",
                                                theme === item.value
                                                    ? "bg-background text-primary shadow-sm border border-border/50"
                                                    : "text-muted-foreground hover:bg-background/50"
                                            )}
                                        >
                                            <item.icon className="w-4 h-4" />
                                            <span className="text-[10px] font-medium">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Idioma */}
                            <div className="px-2">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">{t('language')}</p>
                                <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg">
                                    {[
                                        { code: 'es', label: t('languageSpanish') },
                                        { code: 'en', label: t('languageEnglish') }
                                    ].map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => setLocale(lang.code as Locale)}
                                            className={cn(
                                                "flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all",
                                                currentLocale === lang.code
                                                    ? "bg-background text-primary shadow-sm border border-border/50"
                                                    : "text-muted-foreground hover:bg-background/50"
                                            )}
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-border/50 mx-2" />

                            <div className="space-y-1 px-1">
                                <button
                                    onClick={goToProfile}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-accent text-foreground/80 hover:text-foreground transition-all group"
                                >
                                    <div className="p-1.5 rounded-md bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        <User className="w-4 h-4" />
                                    </div>
                                    {tProfile('editProfile')}
                                </button>

                                <button
                                    onClick={() => { setIsOpen(false); logout() }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-destructive/10 text-destructive/80 hover:text-destructive transition-all group"
                                >
                                    <div className="p-1.5 rounded-md bg-muted group-hover:bg-destructive/10 transition-colors">
                                        <LogOut className="w-4 h-4" />
                                    </div>
                                    {t('logout')}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
