"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, LogIn, UserPlus } from "lucide-react"
import { fetchWithCSRF } from "@/lib/middleware/csrf-helpers"

export function AuthForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const t = useTranslations('auth')

    // Validar tab inicial desde la URL
    const initialTab = searchParams.get("tab") === "register" ? "register" : "login"
    const [activeTab, setActiveTab] = React.useState(initialTab)
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [csrfReady, setCsrfReady] = React.useState(false)

    // Login States
    const [loginEmail, setLoginEmail] = React.useState("")
    const [loginPassword, setLoginPassword] = React.useState("")

    // Register States
    const [regName, setRegName] = React.useState("")
    const [regEmail, setRegEmail] = React.useState("")
    const [regPassword, setRegPassword] = React.useState("")

    // Obtener token CSRF al montar el componente
    const fetchCSRFToken = React.useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch("/api/auth/csrf-token", {
                method: "GET",
                credentials: "include",
            })

            if (response.ok) {
                setCsrfReady(true)
                setError(null)
            } else {
                const data = await response.json().catch(() => ({}))
                setError(data.error?.message || t('error.sessionInitFailed'))
                setCsrfReady(false)
            }
        } catch (err) {
            setError(t('error.connectionError'))
            setCsrfReady(false)
        } finally {
            setIsLoading(false)
        }
    }, [t])

    React.useEffect(() => {
        fetchCSRFToken()
    }, [fetchCSRFToken])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!csrfReady) {
            setError(t('initializing'))
            return
        }

        setIsLoading(true)
        setError(null)
        let response: Response | null = null

        try {
            response = await fetchWithCSRF("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ email: loginEmail, password: loginPassword }),
                headers: { "Content-Type": "application/json" },
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.message || t('error.invalidCredentials'))
            }

            // Guardar token en localStorage
            localStorage.setItem("token", data.token)
            localStorage.setItem("user", JSON.stringify(data.user))

            router.push("/dashboard")
            router.refresh()
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : t('error.invalidCredentials')

            // Manejar errores de CSRF específicamente
            if (response?.status === 403 || errorMessage.includes("CSRF")) {
                setError(t('error.securityError'))
                setCsrfReady(false)
                // Intentar obtener un nuevo token CSRF
                fetch("/api/auth/csrf-token", {
                    method: "GET",
                    credentials: "include",
                }).then(res => {
                    if (res.ok) {
                        setCsrfReady(true)
                    }
                })
            } else {
                setError(errorMessage)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!csrfReady) {
            setError(t('initializing'))
            return
        }

        setIsLoading(true)
        setError(null)
        let response: Response | null = null

        try {
            response = await fetchWithCSRF("/api/auth/registro", {
                method: "POST",
                body: JSON.stringify({ nombre: regName, email: regEmail, password: regPassword }),
                headers: { "Content-Type": "application/json" },
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.message || t('error.invalidCredentials'))
            }

            // Guardar token en localStorage
            localStorage.setItem("token", data.token)
            localStorage.setItem("user", JSON.stringify(data.user))

            router.push("/dashboard")
            router.refresh()
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : t('error.invalidCredentials')

            // Manejar errores de CSRF específicamente
            if (response?.status === 403 || errorMessage.includes("CSRF")) {
                setError(t('error.securityError'))
                setCsrfReady(false)
                // Intentar obtener un nuevo token CSRF
                fetch("/api/auth/csrf-token", {
                    method: "GET",
                    credentials: "include",
                }).then(res => {
                    if (res.ok) {
                        setCsrfReady(true)
                    }
                })
            } else {
                setError(errorMessage)
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight font-outfit">{t('welcome')}</h1>
                <p className="text-muted-foreground">{t('loginDescription')}</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-11">
                    <TabsTrigger value="login" className="text-sm">{t('signIn')}</TabsTrigger>
                    <TabsTrigger value="register" className="text-sm">{t('signUp')}</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                    <Card className="border-border shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LogIn className="w-5 h-5" /> {t('loginTitle')}
                            </CardTitle>
                            <CardDescription>
                                {t('loginDescription')}
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleLogin}>
                            <CardContent className="space-y-4">
                                {error && (
                                    <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                                        {error}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="login-email">{t('email')}</Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder={t('emailPlaceholder')}
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="login-password">{t('password')}</Label>
                                    <Input
                                        id="login-password"
                                        type="password"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        required
                                        autoComplete="current-password"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-3">
                                {!csrfReady && !isLoading && error && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={fetchCSRFToken}
                                        className="w-full"
                                    >
                                        {t('retryConnection')}
                                    </Button>
                                )}
                                <Button
                                    className="w-full h-11 bg-primary hover:bg-primary/90 transition-all font-semibold"
                                    disabled={isLoading || !csrfReady}
                                >
                                    {!csrfReady && isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {t('initializing')}
                                        </>
                                    ) : isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {t('loggingIn')}
                                        </>
                                    ) : !csrfReady ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin text-destructive" />
                                            {t('error.sessionInitFailed')}
                                        </>
                                    ) : (
                                        t('enterSystem')
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                <TabsContent value="register">
                    <Card className="border-border shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="w-5 h-5" /> {t('registerTitle')}
                            </CardTitle>
                            <CardDescription>
                                {t('registerDescription')}
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleRegister}>
                            <CardContent className="space-y-4">
                                {error && (
                                    <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                                        {error}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="name">{t('fullName')}</Label>
                                    <Input
                                        id="name"
                                        placeholder={t('namePlaceholder')}
                                        value={regName}
                                        onChange={(e) => setRegName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-email">{t('email')}</Label>
                                    <Input
                                        id="reg-email"
                                        type="email"
                                        placeholder={t('emailPlaceholder')}
                                        value={regEmail}
                                        onChange={(e) => setRegEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-password">{t('password')}</Label>
                                    <Input
                                        id="reg-password"
                                        type="password"
                                        value={regPassword}
                                        onChange={(e) => setRegPassword(e.target.value)}
                                        required
                                        autoComplete="new-password"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-3">
                                {!csrfReady && !isLoading && error && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={fetchCSRFToken}
                                        className="w-full"
                                    >
                                        {t('retryConnection')}
                                    </Button>
                                )}
                                <Button
                                    className="w-full h-11 bg-primary hover:bg-primary/90 transition-all font-semibold"
                                    disabled={isLoading || !csrfReady}
                                >
                                    {!csrfReady && isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {t('initializing')}
                                        </>
                                    ) : isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {t('registering')}
                                        </>
                                    ) : !csrfReady ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin text-destructive" />
                                            {t('error.sessionInitFailed')}
                                        </>
                                    ) : (
                                        t('createAccount')
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
