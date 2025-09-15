"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
    id: number
    nombre: string
    email: string
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const storedToken = localStorage.getItem("token")
        const storedUser = localStorage.getItem("user")

        if (!storedToken || !storedUser) {
            router.push("/login")
            setLoading(false)
            return
        }

        setToken(storedToken)
        setUser(JSON.parse(storedUser))
        setLoading(false)
    }, [router])

    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/login")
    }

    return { user, token, loading, logout }
}
