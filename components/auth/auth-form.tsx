"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, LogIn, UserPlus } from "lucide-react"

export function AuthForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    // Login States
    const [loginEmail, setLoginEmail] = React.useState("")
    const [loginPassword, setLoginPassword] = React.useState("")

    // Register States
    const [regName, setRegName] = React.useState("")
    const [regEmail, setRegEmail] = React.useState("")
    const [regPassword, setRegPassword] = React.useState("")

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: loginEmail, password: loginPassword }),
            })

            const data = await res.json()

            if (!data.success) {
                throw new Error(data.message || "Error al iniciar sesión")
            }

            // Guardar token en localStorage
            localStorage.setItem("token", data.token)
            localStorage.setItem("user", JSON.stringify(data.user))

            router.push("/dashboard")
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch("/api/auth/registro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre: regName, email: regEmail, password: regPassword }),
            })

            const data = await res.json()

            if (!data.success) {
                throw new Error(data.message || "Error al registrarse")
            }

            // Guardar token en localStorage
            localStorage.setItem("token", data.token)
            localStorage.setItem("user", JSON.stringify(data.user))

            router.push("/dashboard")
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight font-outfit">Bienvenido</h1>
                <p className="text-muted-foreground">Ingresa a tu cuenta para gestionar mediciones</p>
            </div>

            <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-11">
                    <TabsTrigger value="login" className="text-sm">Iniciar Sesión</TabsTrigger>
                    <TabsTrigger value="register" className="text-sm">Registro</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                    <Card className="border-border shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LogIn className="w-5 h-5" /> Acceso
                            </CardTitle>
                            <CardDescription>
                                Introduce tus credenciales para continuar
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
                                    <Label htmlFor="login-email">Email</Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="tu@email.com"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="login-password">Contraseña</Label>
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
                            <CardFooter>
                                <Button className="w-full h-11 bg-primary hover:bg-primary/90 transition-all font-semibold" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Iniciando sesión...
                                        </>
                                    ) : (
                                        "Entrar al Sistema"
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
                                <UserPlus className="w-5 h-5" /> Crear Cuenta
                            </CardTitle>
                            <CardDescription>
                                Regístrate para comenzar a registrar mediciones
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
                                    <Label htmlFor="name">Nombre Completo</Label>
                                    <Input
                                        id="name"
                                        placeholder="Juan Pérez"
                                        value={regName}
                                        onChange={(e) => setRegName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-email">Email</Label>
                                    <Input
                                        id="reg-email"
                                        type="email"
                                        placeholder="tu@email.com"
                                        value={regEmail}
                                        onChange={(e) => setRegEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-password">Contraseña</Label>
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
                            <CardFooter>
                                <Button className="w-full h-11 bg-primary hover:bg-primary/90 transition-all font-semibold" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Registrando...
                                        </>
                                    ) : (
                                        "Crear mi Cuenta"
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
