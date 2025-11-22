"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Construction, Sparkles, Rocket, Heart } from "lucide-react"
import { useTranslations } from "next-intl"

export default function EnDesarrolloPage() {
    const t = useTranslations('inDevelopment')
    
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
            <div className="relative mb-8">
                <div className="absolute -inset-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative bg-card p-6 rounded-3xl border border-border/50 shadow-2xl">
                    <Construction className="w-16 h-16 text-primary animate-bounce" />
                </div>
            </div>

            <div className="text-center max-w-2xl space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold font-outfit tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                    {t('title')}
                </h1>

                <p className="text-xl text-muted-foreground font-light leading-relaxed">
                    {t('description')}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
                    <Card className="bg-card/50 border-border/40 backdrop-blur-sm">
                        <CardHeader className="p-4 flex flex-col items-center text-center">
                            <Sparkles className="w-8 h-8 text-yellow-500 mb-2" />
                            <CardTitle className="text-sm font-semibold">{t('features.premiumDesign')}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="bg-card/50 border-border/40 backdrop-blur-sm">
                        <CardHeader className="p-4 flex flex-col items-center text-center">
                            <Rocket className="w-8 h-8 text-blue-500 mb-2" />
                            <CardTitle className="text-sm font-semibold">{t('features.highSpeed')}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="bg-card/50 border-border/40 backdrop-blur-sm">
                        <CardHeader className="p-4 flex flex-col items-center text-center">
                            <Heart className="w-8 h-8 text-red-500 mb-2" />
                            <CardTitle className="text-sm font-semibold">{t('features.madeWithPassion')}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div className="pt-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium animate-pulse">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        {t('syncing')}
                    </div>
                </div>
            </div>
        </div>
    )
}
